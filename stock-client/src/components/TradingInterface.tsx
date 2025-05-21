import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import OrderBook from './OrderBook';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ParallaxContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  position: 'relative',
  overflow: 'hidden',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(3),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
}));

const TradingInterface: React.FC = () => {
  const theme = useTheme();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  const [orderData, setOrderData] = useState({
    symbol: '',
    price: '',
    quantity: '',
    side: 'Buy'
  });

  const [priceHistory, setPriceHistory] = useState({
    labels: Array.from({ length: 20 }, (_, i) => i.toString()),
    datasets: [
      {
        label: 'Price History',
        data: Array.from({ length: 20 }, () => Math.random() * 100 + 100),
        borderColor: theme.palette.primary.main,
        tension: 0.4,
      },
    ],
  });

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          price: parseFloat(orderData.price),
          quantity: parseFloat(orderData.quantity),
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Order placed successfully:', result);
        // Reset form
        setOrderData({ symbol: '', price: '', quantity: '', side: 'Buy' });
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <ParallaxContainer>
      <motion.div style={{ y }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4}>
            {/* Price Chart */}
            <Grid item xs={12} md={8}>
              <GlassCard>
                <Typography variant="h5" gutterBottom>
                  Price Chart
                </Typography>
                <Box sx={{ height: 400 }}>
                  <Line
                    data={priceHistory}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                      },
                    }}
                  />
                </Box>
              </GlassCard>
            </Grid>

            {/* Order Form */}
            <Grid item xs={12} md={4}>
              <GlassCard>
                <Typography variant="h5" gutterBottom>
                  Place Order
                </Typography>
                <form onSubmit={handleOrderSubmit}>
                  <TextField
                    fullWidth
                    label="Symbol"
                    value={orderData.symbol}
                    onChange={(e) => setOrderData({ ...orderData, symbol: e.target.value })}
                    margin="normal"
                    required
                  />
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    value={orderData.price}
                    onChange={(e) => setOrderData({ ...orderData, price: e.target.value })}
                    margin="normal"
                    required
                    inputProps={{ step: "0.01" }}
                  />
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={orderData.quantity}
                    onChange={(e) => setOrderData({ ...orderData, quantity: e.target.value })}
                    margin="normal"
                    required
                    inputProps={{ step: "1" }}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Side</InputLabel>
                    <Select
                      value={orderData.side}
                      label="Side"
                      onChange={(e) => setOrderData({ ...orderData, side: e.target.value })}
                    >
                      <MenuItem value="Buy">Buy</MenuItem>
                      <MenuItem value="Sell">Sell</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mt: 2 }}
                  >
                    Place Order
                  </Button>
                </form>
              </GlassCard>
            </Grid>

            {/* Order Book */}
            <Grid item xs={12}>
              <GlassCard>
                <Typography variant="h5" gutterBottom>
                  Order Book
                </Typography>
                <OrderBook symbol={orderData.symbol || 'AAPL'} />
              </GlassCard>
            </Grid>
          </Grid>
        </Container>
      </motion.div>
    </ParallaxContainer>
  );
};

export default TradingInterface; 