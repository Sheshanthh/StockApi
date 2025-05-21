import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import TradingInterface from './components/TradingInterface';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <TradingInterface />
    </ThemeProvider>
  );
}

export default App;
