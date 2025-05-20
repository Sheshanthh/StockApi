import React, { useEffect, useState } from 'react';
import './App.css';
import SignalRService from './services/signalRService';

interface StockPrice {
  symbol: string;
  price: number;
}

function App() {
  const [stockPrices, setStockPrices] = useState<StockPrice[]>([]);
  const [stocks, setStocks] = useState<string[]>([]);

  useEffect(() => {
    const signalR = SignalRService.getInstance();

    // Start SignalR connection
    signalR.startConnection();

    // Set up event handlers
    signalR.onPriceUpdate((symbol: string, price: number) => {
      setStockPrices(prev => {
        const existing = prev.findIndex(p => p.symbol === symbol);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = { symbol, price };
          return updated;
        }
        return [...prev, { symbol, price }];
      });
    });

    signalR.onStockListUpdate((stockList: string[]) => {
      setStocks(stockList);
    });

    // Cleanup on component unmount
    return () => {
      signalR.stopConnection();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Stock Prices</h1>
        <div className="stock-grid">
          {stockPrices.map(stock => (
            <div key={stock.symbol} className="stock-card">
              <h2>{stock.symbol}</h2>
              <p className="price">${stock.price.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
