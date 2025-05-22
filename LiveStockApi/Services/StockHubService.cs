using Microsoft.AspNetCore.SignalR;
using LiveStockApi.Hubs;
using LiveStockApi.Models;

namespace LiveStockApi.Services
{
    public class StockHubService
    {
        private readonly IHubContext<StockHub> _hubContext;

        public StockHubService(IHubContext<StockHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task BroadcastOrderBookUpdate(string symbol, object orderBookData)
        {
            await _hubContext.Clients.Group(symbol.ToUpper())
                .SendAsync("OrderBookUpdate", orderBookData);
        }

        public async Task BroadcastTrade(string symbol, Trade trade)
        {
            await _hubContext.Clients.Group(symbol.ToUpper())
                .SendAsync("TradeUpdate", trade);
        }
    }
} 