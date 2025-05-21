# Stock Trading Interface

A modern, feature-rich stock trading interface built with React, Material-UI, and real-time updates.

## Features

- Real-time order book display
- Interactive price chart
- Modern UI with parallax effects
- Glass-morphism design
- Responsive layout
- Dark theme optimized for trading

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend API running on http://localhost:5000

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd stock-client
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

The application uses the following API endpoints:

- `POST /api/orders` - Place a new order
- `GET /api/orders/{symbol}/book` - Get order book for a symbol
- `GET /api/orders/{symbol}/orders` - Get all orders for a symbol

## Features

### Order Placement
- Enter symbol, price, and quantity
- Choose between Buy and Sell orders
- Real-time validation
- Success/error notifications

### Order Book
- Real-time updates
- Separate buy and sell orders
- Price and quantity display
- Total value calculation

### Price Chart
- Interactive price history
- Real-time updates
- Zoom and pan capabilities
- Customizable timeframes

## Development

The application is built with:
- React
- TypeScript
- Material-UI
- Framer Motion
- Chart.js
- Axios

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
