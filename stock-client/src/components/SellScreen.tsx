import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Snackbar, Alert } from '@mui/material';
import OrderModal from './OrderModal';

interface StockInfo {
  symbol: string;
  bestBid: number | null;
  quantity: number | null;
}

const SellScreen: React.FC = () => {
  const [stocks, setStocks] = useState<string[]>([]);
  const [stockData, setStockData] = useState<Record<string, StockInfo>>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('');
  const [bestBid, setBestBid] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

  useEffect(() => {
    const fetchStocks = async () => {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/stock/all');
      const symbols: string[] = await res.json();
      setStocks(symbols);
      setLoading(false);
      // Fetch order book for each symbol
      symbols.forEach(async (symbol) => {
        const obRes = await fetch(`http://localhost:5000/api/orders/${symbol}/book`);
        if (obRes.ok) {
          const ob = await obRes.json();
          setStockData(prev => ({
            ...prev,
            [symbol]: {
              symbol,
              bestBid: ob.BestBid,
              quantity: ob.BuyOrders && ob.BuyOrders.length > 0 ? ob.BuyOrders[0].Quantity : null
            }
          }));
        } else {
          setStockData(prev => ({ ...prev, [symbol]: { symbol, bestBid: null, quantity: null } }));
        }
      });
    };
    fetchStocks();
  }, []);

  const handleSellClick = (symbol: string, bestBid: number | null) => {
    setSelectedSymbol(symbol);
    setBestBid(bestBid);
    setModalOpen(true);
  };

  const handleOrderSubmit = async (price: number, quantity: number) => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol, price, quantity, side: 'Sell' })
      });
      if (response.ok) {
        setSnackbar({open: true, message: 'Order placed successfully!', severity: 'success'});
      } else {
        const error = await response.text();
        setSnackbar({open: true, message: error, severity: 'error'});
      }
    } catch (err) {
      setSnackbar({open: true, message: 'Network error', severity: 'error'});
    }
    setModalOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Sell Stocks</Typography>
      {loading ? <CircularProgress /> : (
        <TableContainer component={Paper} sx={{ maxWidth: 700 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell>Best Bid</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map(symbol => (
                <TableRow key={symbol}>
                  <TableCell>{symbol}</TableCell>
                  <TableCell>{stockData[symbol]?.bestBid ?? 'N/A'}</TableCell>
                  <TableCell>{stockData[symbol]?.quantity ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="secondary" onClick={() => handleSellClick(symbol, stockData[symbol]?.bestBid ?? null)}>
                      Sell
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <OrderModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        symbol={selectedSymbol}
        side="Sell"
        bestPrice={bestBid}
        onSubmit={handleOrderSubmit}
      />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SellScreen; 