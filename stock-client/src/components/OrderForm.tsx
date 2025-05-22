import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, Typography, Snackbar, Alert } from '@mui/material';

const OrderForm: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success'|'error'}>({open: false, message: '', severity: 'success'});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, price: parseFloat(price), quantity: parseFloat(quantity), side })
      });
      if (response.ok) {
        setSnackbar({open: true, message: 'Order placed successfully!', severity: 'success'});
        setSymbol(''); setPrice(''); setQuantity('');
      } else {
        const error = await response.text();
        setSnackbar({open: true, message: error, severity: 'error'});
      }
    } catch {
      setSnackbar({open: true, message: 'Network error', severity: 'error'});
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
      <TextField label="Symbol" value={symbol} onChange={e => setSymbol(e.target.value.toUpperCase())} required sx={{ width: 100 }} />
      <TextField label="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} required sx={{ width: 100 }} inputProps={{ step: '0.01' }} />
      <TextField label="Quantity" type="number" value={quantity} onChange={e => setQuantity(e.target.value)} required sx={{ width: 100 }} inputProps={{ step: '1', min: '1' }} />
      <TextField select label="Side" value={side} onChange={e => setSide(e.target.value as 'Buy' | 'Sell')} sx={{ width: 100 }}>
        <MenuItem value="Buy">Buy</MenuItem>
        <MenuItem value="Sell">Sell</MenuItem>
      </TextField>
      <Button type="submit" variant="contained">Place Order</Button>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrderForm; 