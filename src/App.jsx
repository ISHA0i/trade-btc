import React, { useState } from 'react';
import { Layout, Select, Typography, Space, theme } from 'antd';
import { LineChartOutlined, DashboardOutlined } from '@ant-design/icons';
import TradingSignals from './components/TradingSignals';
import TechnicalIndicators from './components/TechnicalIndicators';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const { token } = theme.useToken();

  const handleSymbolChange = (value) => {
    setSelectedSymbol(value);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: token.colorBgContainer,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1
      }}>
        <Space size="large" style={{ flex: 1 }}>
          <LineChartOutlined style={{ fontSize: '24px', color: token.colorPrimary }} />
          <Title level={3} style={{ margin: 0 }}>Cryptocurrency Trading Signals</Title>
        </Space>
        <Space>
          <DashboardOutlined style={{ fontSize: '20px', color: token.colorTextSecondary }} />
          <Select
            value={selectedSymbol}
            onChange={handleSymbolChange}
            style={{ width: 150 }}
            size="large"
          >
            <Option value="BTCUSDT">BTC/USDT</Option>
            <Option value="ETHUSDT">ETH/USDT</Option>
            <Option value="BNBUSDT">BNB/USDT</Option>
          </Select>
        </Space>
      </Header>
      <Content style={{ 
        margin: '24px',
        padding: '24px',
        background: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        minHeight: 280
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          <TradingSignals />
          <TechnicalIndicators symbol={selectedSymbol} />
        </div>
      </Content>
    </Layout>
  );
}

export default App; 