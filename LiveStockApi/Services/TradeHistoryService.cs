using System.Collections.Concurrent;
using LiveStockApi.Models;

namespace LiveStockApi.Services
{
    public class TradeHistoryService
    {
        private readonly ConcurrentDictionary<string, ConcurrentBag<Trade>> _tradeHistory;
        private const int MaxTradesPerSymbol = 100;

        public TradeHistoryService()
        {
            _tradeHistory = new ConcurrentDictionary<string, ConcurrentBag<Trade>>();
        }

        public void AddTrade(Trade trade)
        {
            var trades = _tradeHistory.GetOrAdd(trade.Symbol, _ => new ConcurrentBag<Trade>());
            trades.Add(trade);

            // Keep only the most recent trades
            if (trades.Count > MaxTradesPerSymbol)
            {
                var newTrades = new ConcurrentBag<Trade>(trades.OrderByDescending(t => t.Timestamp).Take(MaxTradesPerSymbol));
                _tradeHistory[trade.Symbol] = newTrades;
            }
        }

        public IEnumerable<Trade> GetRecentTrades(string symbol, int count = 20)
        {
            if (_tradeHistory.TryGetValue(symbol, out var trades))
            {
                return trades.OrderByDescending(t => t.Timestamp).Take(count);
            }
            return Enumerable.Empty<Trade>();
        }

        public IEnumerable<Trade> GetAllRecentTrades(int count = 20)
        {
            return _tradeHistory.Values
                .SelectMany(trades => trades)
                .OrderByDescending(t => t.Timestamp)
                .Take(count);
        }
    }
} 