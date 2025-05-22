using Microsoft.AspNetCore.SignalR;
using LiveStockApi.Models;

namespace LiveStockApi.Hubs
{
    public class StockHub : Hub
    {
        public async Task SubscribeToSymbol(string symbol)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, symbol.ToUpper());
        }

        public async Task UnsubscribeFromSymbol(string symbol)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, symbol.ToUpper());
        }
    }
} 