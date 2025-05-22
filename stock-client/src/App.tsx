import React, { useEffect, useState } from 'react';
import { ThemeProvider, CssBaseline, Box, MenuItem, Select, Typography, Grid, Paper } from '@mui/material';
import theme from './theme';
import OrderBook from './components/OrderBook';
import TradeHistory from './components/TradeHistory';
import OrderForm from './components/OrderForm';

const App: React.FC = () => {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:5000/api/stock/all')
      .then(res => res.json())
      .then((data: string[]) => {
        setSymbols(data);
        if (data.length > 0 && !selectedSymbol) setSelectedSymbol(data[0]);
      });
  }, [selectedSymbol]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100vh', p: 4 }}>
        <Typography variant="h4" gutterBottom>Stock Trading Dashboard</Typography>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mr: 2, display: 'inline-block' }}>Select Symbol:</Typography>
          <Select
            value={selectedSymbol}
            onChange={e => setSelectedSymbol(e.target.value)}
            sx={{ minWidth: 120 }}
          >
            {symbols.map(symbol => (
              <MenuItem key={symbol} value={symbol}>{symbol}</MenuItem>
            ))}
          </Select>
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <OrderBook symbol={selectedSymbol} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <TradeHistory symbol={selectedSymbol} />
            </Paper>
          </Grid>
        </Grid>
        <Paper sx={{ p: 2, mt: 4 }}>
          <OrderForm />
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;
