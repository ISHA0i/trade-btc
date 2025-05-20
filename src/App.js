import React from 'react';
import { Layout } from 'antd';
import TradingSignals from './components/TradingSignals';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: '0 24px' }}>
        <h1 style={{ margin: 0 }}>Cryptocurrency Trading Signals</h1>
      </Header>
      <Content>
        <TradingSignals />
      </Content>
    </Layout>
  );
}

export default App;
