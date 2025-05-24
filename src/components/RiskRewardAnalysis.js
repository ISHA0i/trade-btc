import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Space, Alert, Spin, Typography } from 'antd';
import { DollarOutlined, SafetyOutlined, LineChartOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { useToken } = theme;
const { Text } = Typography;

const RiskRewardAnalysis = ({ symbol, indicators }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEntryPrice, setCurrentEntryPrice] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { token } = useToken();

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/risk-reward/${symbol.toLowerCase()}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }
        setAnalysis(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching risk/reward analysis:', error);
        setError(error.message || 'Failed to fetch risk/reward analysis');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
    const interval = setInterval(fetchAnalysis, 10000);
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    const updateEntryPrice = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/price/${symbol.toLowerCase()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCurrentEntryPrice(data.price);
      } catch (error) {
        console.error('Error fetching current price:', error);
      }
    };

    updateEntryPrice();
    const priceInterval = setInterval(updateEntryPrice, 2000);
    return () => clearInterval(priceInterval);
  }, [symbol]);

  const calculateStrategyConfidence = () => {
    if (!indicators) return 0;
    
    let alignedCount = 0;
    let totalCount = 0;

    if (indicators.macd?.macdLine?.length > 0) {
      totalCount++;
      const lastIndex = indicators.macd.macdLine.length - 1;
      const macdValue = indicators.macd.macdLine[lastIndex];
      const signalValue = indicators.macd.signalLine[lastIndex];
      if (macdValue > signalValue) alignedCount++;
    }

    if (indicators.stochRSI?.k?.length > 0) {
      totalCount++;
      const lastIndex = indicators.stochRSI.k.length - 1;
      const rsiValue = indicators.stochRSI.k[lastIndex];
      if (rsiValue < 30 || rsiValue > 70) alignedCount++;
    }

    if (indicators.adx?.adx?.length > 0) {
      totalCount++;
      const lastIndex = indicators.adx.adx.length - 1;
      const adxValue = indicators.adx.adx[lastIndex];
      if (adxValue > 25) alignedCount++;
    }

    return totalCount > 0 ? (alignedCount / totalCount) * 100 : 0;
  };

  const getPositionType = (volatility) => {
    if (volatility > 0.05) return 'Intraday';
    if (volatility > 0.02) return 'Swing';
    return 'Long Term';
  };

  const getCapitalUsage = (riskScore) => {
    return 5 + (riskScore / 100) * 25;
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    const confidence = calculateStrategyConfidence();
    const positionType = getPositionType(analysis.volatility);
    const capitalUsage = getCapitalUsage(confidence);

    return (
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title="Position Analysis" 
            style={{ marginBottom: '16px' }}
            extra={
              lastUpdated && (
                <Space>
                  <ClockCircleOutlined />
                  <Text type="secondary">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </Text>
                </Space>
              )
            }
          >
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Entry Price"
                  value={currentEntryPrice || analysis.currentPrice}
                  precision={2}
                  prefix="$"
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Target Price"
                  value={analysis.targetPrice}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: token.colorSuccess }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Stop Loss"
                  value={analysis.stopLoss}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: token.colorError }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Risk/Reward Metrics" style={{ marginBottom: '16px' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="Risk/Reward Ratio"
                  value={analysis.riskRewardRatio}
                  precision={2}
                  prefix={<SafetyOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Strategy Confidence"
                  value={confidence}
                  precision={1}
                  suffix="%"
                  valueStyle={{
                    color: confidence > 70 ? token.colorSuccess :
                           confidence > 40 ? token.colorWarning :
                           token.colorError
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col span={24}>
          <Card title="Position Details">
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <Statistic
                  title="Position Type"
                  value={positionType}
                  valueStyle={{
                    color: positionType === 'Intraday' ? token.colorError :
                           positionType === 'Swing' ? token.colorWarning :
                           token.colorSuccess
                  }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Capital Usage"
                  value={capitalUsage}
                  precision={1}
                  suffix="%"
                  prefix={<DollarOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Max Risk"
                  value={analysis.maxRisk}
                  precision={2}
                  prefix="$"
                  valueStyle={{ color: token.colorError }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined />
          <span>Risk/Reward Analysis - {symbol}</span>
        </Space>
      }
      style={{
        margin: '24px',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}
      <Spin spinning={loading}>
        {!loading && !error && renderAnalysis()}
      </Spin>
    </Card>
  );
};

export default RiskRewardAnalysis;