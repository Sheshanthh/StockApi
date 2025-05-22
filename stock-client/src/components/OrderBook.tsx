import React, { useEffect, useState, useCallback } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button } from '@mui/material';
import { signalRService } from '../services/signalRService';
import * as signalR from '@microsoft/signalr';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<signalR.HubConnectionState>(signalR.HubConnectionState.Disconnected);

  const fetchOrderBook = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:5000/api/orders/${symbol}/book`);
      if (!response.ok) {
        throw new Error('Failed to fetch order book');
      }
      const data = await response.json();
      setOrderBook(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching order book:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToUpdates = useCallback(async () => {
    try {
      setError(null);
      await signalRService.subscribeToSymbol(symbol);
    } catch (err) {
      console.error('Error subscribing to symbol:', err);
      setError('Failed to subscribe to updates');
    }
  }, [symbol]);

  useEffect(() => {
    let isMounted = true;
    let retryTimer: NodeJS.Timeout;

    const handleUpdate = (data: OrderBookData) => {
      if (data.symbol === symbol && isMounted) {
        console.log('Updating order book with new data:', data);
        setOrderBook(data);
      }
    };

    const checkConnection = () => {
      const state = signalRService.getConnectionState();
      setConnectionState(state);

      if (state !== signalR.HubConnectionState.Connected) {
        retryTimer = setTimeout(checkConnection, 1000);
      } else {
        subscribeToUpdates();
      }
    };

    // Initial fetch
    fetchOrderBook();

    // Subscribe to updates
    signalRService.onOrderBookUpdate(handleUpdate);
    checkConnection();

    return () => {
      isMounted = false;
      if (retryTimer) {
        clearTimeout(retryTimer);
      }
      signalRService.removeOrderBookCallback(handleUpdate);
      signalRService.unsubscribeFromSymbol(symbol).catch(console.error);
    };
  }, [symbol, subscribeToUpdates]);

  const handleRetry = () => {
    setError(null);
    fetchOrderBook();
    subscribeToUpdates();
  };

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
        <Typography color="error" gutterBottom>Error: {error}</Typography>
        <Button variant="contained" onClick={handleRetry}>
          Retry
        </Button>
      </Box>
    );
  }

  if (!orderBook) {
    return <Typography>No order book data available</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Order Book for {symbol}
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">
          Best Bid: {orderBook.bestBid ? `$${orderBook.bestBid.toFixed(2)}` : 'N/A'}
        </Typography>
        <Typography variant="subtitle1">
          Best Ask: {orderBook.bestAsk ? `$${orderBook.bestAsk.toFixed(2)}` : 'N/A'}
        </Typography>
        <Typography variant="subtitle1">
          Spread: {orderBook.spread ? `$${orderBook.spread.toFixed(2)}` : 'N/A'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Connection: {connectionState}
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Price</TableCell>
              <TableCell align="right">Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orderBook.sellOrders.map((order, index) => (
              <TableRow key={`sell-${index}`} sx={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
                <TableCell>${order.price.toFixed(2)}</TableCell>
                <TableCell align="right">{order.quantity}</TableCell>
              </TableRow>
            ))}
            {orderBook.buyOrders.map((order, index) => (
              <TableRow key={`buy-${index}`} sx={{ backgroundColor: 'rgba(0, 255, 0, 0.1)' }}>
                <TableCell>${order.price.toFixed(2)}</TableCell>
                <TableCell align="right">{order.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderBook; 