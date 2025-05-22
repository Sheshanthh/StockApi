import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';
import { signalRService } from '../services/signalRService';

interface Trade {
  Price: number;
  Quantity: number;
  Timestamp: string;
}

const TradeHistory: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    // Listen for trade updates
    const handleTrade = (trade: any) => {
      if (trade.Symbol === symbol) {
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

  return (
    <Box>
      <Typography variant="h6">Recent Trades for {symbol}</Typography>
      <Paper sx={{ maxHeight: 300, overflow: 'auto', mt: 1 }}>
        <List>
          {trades.length === 0 && <ListItem><ListItemText primary="No trades yet." /></ListItem>}
          {trades.map((trade, idx) => (
            <ListItem key={idx}>
              <ListItemText
                primary={`$${trade.Price.toFixed(2)} x ${trade.Quantity}`}
                secondary={new Date(trade.Timestamp).toLocaleTimeString()}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default TradeHistory; 