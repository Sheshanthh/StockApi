import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, CircularProgress } from '@mui/material';
import { signalRService } from '../services/signalRService';

interface Trade {
  id: string;
  symbol: string;
  price: number;
  quantity: number;
  timestamp: string;
  buyOrderId: string;
  sellOrderId: string;
}

const TradeHistory: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/tradehistory/${symbol}?count=20`);
      if (!response.ok) {
        throw new Error('Failed to fetch trade history');
      }
      const data = await response.json();
      setTrades(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching trade history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeHistory();

    // Listen for trade updates
    const handleTrade = (trade: Trade) => {
      if (trade.symbol === symbol) {
        setTrades(prev => [trade, ...prev].slice(0, 20));
      }
    };

    signalRService.onTradeUpdate(handleTrade);
    signalRService.subscribeToSymbol(symbol);

    return () => {
      signalRService.removeTradeCallback(handleTrade);
      signalRService.unsubscribeFromSymbol(symbol);
    };
  }, [symbol]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Trades for {symbol}
      </Typography>
      <Paper sx={{ maxHeight: 400, overflow: 'auto' }}>
        <List>
          {trades.length === 0 ? (
            <ListItem>
              <ListItemText primary="No trades yet" />
            </ListItem>
          ) : (
            trades.map((trade) => (
              <ListItem key={trade.id} divider>
                <ListItemText
                  primary={`$${trade.price.toFixed(2)} x ${trade.quantity}`}
                  secondary={new Date(trade.timestamp).toLocaleString()}
                />
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default TradeHistory; 