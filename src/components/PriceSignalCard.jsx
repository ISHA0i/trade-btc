// client/src/components/PriceSignalCard.jsx
import React, { useEffect, useState } from "react";
import { Card, Tag, Row, Col, Statistic, Progress } from "antd";
import axios from "axios";

const signalColors = {
  BUY: "green",
  SELL: "red",
  HOLD: "orange",
};

const PriceSignalCard = () => {
  const [price, setPrice] = useState(null);
  const [signal, setSignal] = useState("HOLD");
  const [indicators, setIndicators] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priceRes, signalRes, indicatorsRes] = await Promise.all([
          axios.get("/api/price/btcusdt"),
          axios.get("/api/signal/btcusdt"),
          axios.get("/api/indicators/btcusdt")
        ]);
        
        setPrice(priceRes.data.price);
        setSignal(signalRes.data.signal);
        setIndicators(indicatorsRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const getIndicatorColor = (value, type) => {
    switch (type) {
      case 'rsi':
        return value < 30 ? 'green' : value > 70 ? 'red' : 'orange';
      case 'stoch':
        return value < 20 ? 'green' : value > 80 ? 'red' : 'orange';
      case 'adx':
        return value > 25 ? 'green' : 'orange';
      default:
        return 'blue';
    }
  };

  return (
    <Card title="BTC/USDT" style={{ width: "100%", maxWidth: 800 }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Statistic
            title="Current Price"
            value={price}
            precision={2}
            prefix="$"
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Signal"
            value={signal}
            valueStyle={{ color: signalColors[signal] }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="ADX"
            value={indicators?.adx?.adx[indicators.adx.adx.length - 1]?.toFixed(2)}
            valueStyle={{ color: getIndicatorColor(indicators?.adx?.adx[indicators.adx.adx.length - 1], 'adx') }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card size="small" title="RSI">
            <Progress
              percent={indicators?.stochRSI?.k[indicators.stochRSI.k.length - 1]}
              status="active"
              strokeColor={getIndicatorColor(indicators?.stochRSI?.k[indicators.stochRSI.k.length - 1], 'rsi')}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" title="Stochastic RSI">
            <Progress
              percent={indicators?.stochRSI?.k[indicators.stochRSI.k.length - 1]}
              status="active"
              strokeColor={getIndicatorColor(indicators?.stochRSI?.k[indicators.stochRSI.k.length - 1], 'stoch')}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card size="small" title="Support/Resistance Levels">
            {indicators?.supportResistance?.slice(-3).map((level, index) => (
              <Tag 
                key={index}
                color={level.type === 'support' ? 'green' : 'red'}
              >
                {level.type.toUpperCase()}: ${level.price.toFixed(2)}
              </Tag>
            ))}
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default PriceSignalCard;

