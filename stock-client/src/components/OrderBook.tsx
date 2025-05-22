import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { signalRService } from '../services/signalRService';

interface OrderLevel {
  price: number;
  quantity: number;
}

interface OrderBookData {
  symbol: string;
  bestBid: number | null;
  bestAsk: number | null;
  spread: number | null;
  buyOrders: OrderLevel[];
  sellOrders: OrderLevel[];
}

const OrderBook: React.FC<{ symbol: string }> = ({ symbol }) => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);

  useEffect(() => {
    let isMounted = true;
    // Fetch initial order book
    fetch(`http://localhost:5000/api/orders/${symbol}/book`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch order book');
        return res.json();
      })
      .then(data => { if (isMounted) setOrderBook(data); })
      .catch(() => { if (isMounted) setOrderBook(null); });

    // Subscribe to SignalR updates
    const handleUpdate = (data: any) => {
      if (data.Symbol === symbol) setOrderBook(data);
    };
    signalRService.onOrderBookUpdate(handleUpdate);
    signalRService.subscribeToSymbol(symbol);

    return () => {
      isMounted = false;
      signalRService.removeOrderBookCallback(handleUpdate);
      signalRService.unsubscribeFromSymbol(symbol);
    };
  }, [symbol]);

  if (!orderBook) return <Typography>Loading order book...</Typography>;

  return (
    <Box>
      <Typography variant="h6">Order Book for {symbol}</Typography>
      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Sell Orders (Asks) */}
        <TableContainer component={Paper} sx={{ maxWidth: 300 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ask Price</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...(orderBook.sellOrders || [])].reverse().map((order, idx) => (
                <TableRow key={idx}>
                  <TableCell>{order.price.toFixed(2)}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Buy Orders (Bids) */}
        <TableContainer component={Paper} sx={{ maxWidth: 300 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bid Price</TableCell>
                <TableCell>Quantity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(orderBook.buyOrders || []).map((order, idx) => (
                <TableRow key={idx}>
                  <TableCell>{order.price.toFixed(2)}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Best Bid: {orderBook.bestBid ?? 'N/A'} | Best Ask: {orderBook.bestAsk ?? 'N/A'} | Spread: {orderBook.spread ?? 'N/A'}</Typography>
      </Box>
    </Box>
  );
};

export default OrderBook; 