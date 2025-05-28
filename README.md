# Stock Trading Application

A real-time stock trading platform built with React, .NET, and SignalR.

## Features

- Real-time stock price updates
- Live order book visualization
- Trading interface with buy/sell orders
- Price history charts
- SignalR integration for real-time updates

## Tech Stack

### Frontend
- React
- TypeScript
- Material-UI
- Chart.js
- SignalR Client

### Backend
- .NET 8.0
- SignalR
- RESTful API
- Docker support

## Prerequisites

- Node.js (v14 or higher)
- .NET 8.0 SDK
- Docker (for containerized deployment)
- Finnhub API key

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
```bash
cd LiveStockApi
```

2. Build and run with Docker:
```bash
docker build -t stockapi-backend .
docker run -d -p 5000:5000 -e FINNHUB_API_KEY=your_finnhub_api_key --name stockapi-backend stockapi-backend
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd stock-client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with:
```
REACT_APP_BACKEND_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm start
```

## Deployment

### Backend Deployment
The backend is containerized using Docker and can be deployed to any cloud platform that supports Docker containers.

### Frontend Deployment
The frontend is deployed on Netlify:
1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Deploy to Netlify:
```bash
netlify deploy --prod
```

## Environment Variables

### Backend
- `FINNHUB_API_KEY`: Your Finnhub API key

### Frontend
- `REACT_APP_BACKEND_URL`: URL of the backend API

## API Endpoints

- `GET /api/orders`: Get all orders
- `POST /api/orders`: Place a new order
- `GET /hubs/stock`: SignalR hub for real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 