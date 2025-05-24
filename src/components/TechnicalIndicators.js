import React, { useState, useEffect } from 'react';
import { Card, Spin, Alert, Typography, Tag, Space, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, LineChartOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { Title } = Typography;
const { useToken } = theme;

const TechnicalIndicators = ({ symbol }) => {
  const [indicators, setIndicators] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useToken();

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/indicators/${symbol.toLowerCase()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIndicators(data);
      } catch (error) {
        console.error('Error fetching indicators:', error);
        setError('Failed to fetch technical indicators');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
    const interval = setInterval(fetchIndicators, 60000);
    return () => clearInterval(interval);
  }, [symbol]);

  const getSignalColor = (signal) => {
    switch (signal.toLowerCase()) {
      case 'bullish':
      case 'oversold':
        return 'success';
      case 'bearish':
      case 'overbought':
        return 'error';
      case 'strong trend':
        return 'processing';
      default:
        return 'default';
    }
  };

  const formatIndicators = () => {
    if (!indicators) return [];

    const formattedData = [];

    if (indicators.macd?.macdLine?.length > 0 && indicators.macd?.signalLine?.length > 0) {
      const lastIndex = indicators.macd.macdLine.length - 1;
      const macdValue = indicators.macd.macdLine[lastIndex];
      const signalValue = indicators.macd.signalLine[lastIndex];
      
      if (macdValue !== null && signalValue !== null) {
        formattedData.push({
          key: 'macd',
          name: 'MACD',
          value: macdValue.toFixed(2),
          signal: macdValue > signalValue ? 'Bullish' : 'Bearish',
          trend: macdValue > signalValue ? 'up' : 'down'
        });
      }
    }

    if (indicators.stochRSI?.k?.length > 0) {
      const lastIndex = indicators.stochRSI.k.length - 1;
      const rsiValue = indicators.stochRSI.k[lastIndex];
      
      if (rsiValue !== null) {
        formattedData.push({
          key: 'rsi',
          name: 'Stochastic RSI',
          value: rsiValue.toFixed(2),
          signal: rsiValue > 80 ? 'Overbought' : 
                 rsiValue < 20 ? 'Oversold' : 'Neutral',
          trend: rsiValue > 80 ? 'down' : rsiValue < 20 ? 'up' : 'neutral'
        });
      }
    }

    if (indicators.bollingerBands?.middleBand?.length > 0) {
      const lastIndex = indicators.bollingerBands.middleBand.length - 1;
      const middleBand = indicators.bollingerBands.middleBand[lastIndex];
      const upperBand = indicators.bollingerBands.upperBand[lastIndex];
      const lowerBand = indicators.bollingerBands.lowerBand[lastIndex];
      
      if (middleBand !== null && upperBand !== null && lowerBand !== null) {
        formattedData.push({
          key: 'bb',
          name: 'Bollinger Bands',
          value: middleBand.toFixed(2),
          signal: `Upper: ${upperBand.toFixed(2)}, Lower: ${lowerBand.toFixed(2)}`,
          trend: 'neutral'
        });
      }
    }

    if (indicators.adx?.adx?.length > 0) {
      const lastIndex = indicators.adx.adx.length - 1;
      const adxValue = indicators.adx.adx[lastIndex];
      
      if (adxValue !== null) {
        formattedData.push({
          key: 'adx',
          name: 'ADX',
          value: adxValue.toFixed(2),
          signal: adxValue > 25 ? 'Strong Trend' : 'Weak Trend',
          trend: adxValue > 25 ? 'up' : 'neutral'
        });
      }
    }

    return formattedData;
  };

  const renderIndicatorCard = (indicator) => (
    <Card
      key={indicator.key}
      style={{
        marginBottom: '16px',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col span={24}>
          <Space>
            <LineChartOutlined style={{ fontSize: '20px', color: token.colorPrimary }} />
            <Title level={5} style={{ margin: 0 }}>{indicator.name}</Title>
          </Space>
        </Col>
        <Col span={12}>
          <Statistic
            value={indicator.value}
            precision={2}
            valueStyle={{
              color: indicator.trend === 'up' ? token.colorSuccess :
                     indicator.trend === 'down' ? token.colorError :
                     token.colorText
            }}
            prefix={indicator.trend === 'up' ? <ArrowUpOutlined /> :
                   indicator.trend === 'down' ? <ArrowDownOutlined /> : null}
          />
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Tag color={getSignalColor(indicator.signal)}>
            {indicator.signal}
          </Tag>
        </Col>
      </Row>
    </Card>
  );

  if (error) {
    return (
      <Card style={{ margin: '24px' }}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card
      title={
        <Space>
          <LineChartOutlined />
          <span>Technical Indicators - {symbol}</span>
        </Space>
      }
      style={{
        margin: '24px',
        borderRadius: token.borderRadiusLG,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
    >
      <Spin spinning={loading}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {formatIndicators().map(renderIndicatorCard)}
        </div>
      </Spin>
    </Card>
  );
};

export default TechnicalIndicators; 