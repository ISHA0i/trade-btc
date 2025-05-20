import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import { createChart } from 'lightweight-charts';

const PriceChart = ({ priceHistory, signals }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    // Format data for the chart
    const candleData = priceHistory.map(candle => ({
      time: candle.timestamp / 1000,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    const volumeData = priceHistory.map(candle => ({
      time: candle.timestamp / 1000,
      value: candle.volume,
      color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
    }));

    candlestickSeries.setData(candleData);
    volumeSeries.setData(volumeData);

    // Add signal markers
    signals.forEach(signal => {
      if (signal.signal === 'BUY') {
        candlestickSeries.setMarkers([
          {
            time: signal.timestamp / 1000,
            position: 'belowBar',
            color: '#26a69a',
            shape: 'arrowUp',
            text: 'BUY',
          },
        ]);
      } else if (signal.signal === 'SELL') {
        candlestickSeries.setMarkers([
          {
            time: signal.timestamp / 1000,
            position: 'aboveBar',
            color: '#ef5350',
            shape: 'arrowDown',
            text: 'SELL',
          },
        ]);
      }
    });

    // Handle resize
    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener('resize', handleResize);
    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [priceHistory, signals]);

  return (
    <Card title="Price Chart">
      <div ref={chartContainerRef} />
    </Card>
  );
};

export default PriceChart; 