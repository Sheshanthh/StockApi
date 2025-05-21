import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

interface Order {
  orderId: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'Buy' | 'Sell';
}

interface OrderBookProps {
  symbol: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/orders/${symbol}/orders`);
        if (response.ok) {
          const data = await response.json();
          setBuyOrders(data.buyOrders || []);
          setSellOrders(data.sellOrders || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <StyledTableCell>Price</StyledTableCell>
              <StyledTableCell>Quantity</StyledTableCell>
              <StyledTableCell>Total</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Sell Orders (in reverse order) */}
            {[...sellOrders].reverse().map((order) => (
              <TableRow key={order.orderId}>
                <StyledTableCell sx={{ color: 'error.main' }}>
                  ${order.price.toFixed(2)}
                </StyledTableCell>
                <StyledTableCell>{order.quantity}</StyledTableCell>
                <StyledTableCell>
                  ${(order.price * order.quantity).toFixed(2)}
                </StyledTableCell>
              </TableRow>
            ))}
            {/* Buy Orders */}
            {buyOrders.map((order) => (
              <TableRow key={order.orderId}>
                <StyledTableCell sx={{ color: 'success.main' }}>
                  ${order.price.toFixed(2)}
                </StyledTableCell>
                <StyledTableCell>{order.quantity}</StyledTableCell>
                <StyledTableCell>
                  ${(order.price * order.quantity).toFixed(2)}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default OrderBook; 