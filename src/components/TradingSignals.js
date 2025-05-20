import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, Alert } from 'antd';

const TradingSignals = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setError(null);
        const response = await fetch('http://localhost:3001/api/signals');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSignals(data);
      } catch (error) {
        console.error('Error fetching signals:', error);
        setError('Failed to fetch trading signals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
    const interval = setInterval(fetchSignals, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Signal',
      dataIndex: 'signal',
      key: 'signal',
      render: (signal) => (
        <Tag color={signal === 'BUY' ? 'green' : signal === 'SELL' ? 'red' : 'default'}>
          {signal}
        </Tag>
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
    },
    {
      title: 'Suggestion',
      dataIndex: 'suggestion',
      key: 'suggestion',
      ellipsis: true,
    },
    {
      title: 'Risk/Reward',
      dataIndex: 'riskReward',
      key: 'riskReward',
      render: (riskReward) => riskReward?.ratio || 'N/A',
    },
  ];

  return (
    <Card title="Trading Signals" style={{ margin: '24px' }}>
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
        <Table
          dataSource={signals}
          columns={columns}
          rowKey="symbol"
          pagination={false}
        />
      </Spin>
    </Card>
  );
};

export default TradingSignals; 