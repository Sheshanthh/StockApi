import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  side: 'Buy' | 'Sell';
  bestPrice?: number | null;
  onSubmit: (price: number, quantity: number) => void;
}

const OrderModal: React.FC<OrderModalProps> = ({ open, onClose, symbol, side, bestPrice, onSubmit }) => {
  const [price, setPrice] = useState(bestPrice ? bestPrice.toString() : '');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Enter a valid price');
      return;
    }
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setError('Enter a valid quantity');
      return;
    }
    setError('');
    onSubmit(priceNum, quantityNum);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{side} {symbol}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 300 }}>
          <Typography variant="body2" color="text.secondary">
            {bestPrice ? `Best ${side === 'Buy' ? 'Ask' : 'Bid'}: $${bestPrice}` : ''}
          </Typography>
          <TextField
            label="Price"
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            inputProps={{ step: '0.01' }}
            required
            autoFocus
          />
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            inputProps={{ step: '1', min: '1' }}
            required
          />
          {error && <Typography color="error">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderModal; 