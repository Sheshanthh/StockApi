using LiveStockApi.Models;
using System.Collections.Concurrent;

namespace LiveStockApi.Services
{
    public class OrderBookManager
    {
        private readonly ConcurrentDictionary<string, OrderBook> _orderBooks;

        public OrderBookManager()
        {
            _orderBooks = new ConcurrentDictionary<string, OrderBook>();
        }

        public OrderBook GetOrCreateOrderBook(string symbol)
        {
            return _orderBooks.GetOrAdd(symbol, _ => new OrderBook(symbol));
        }

        public void AddOrder(Order order)
        {
            var orderBook = GetOrCreateOrderBook(order.Symbol);
            orderBook.AddOrder(order);
        }

        public OrderBook? GetOrderBook(string symbol)
        {
            return _orderBooks.TryGetValue(symbol, out var orderBook) ? orderBook : null;
        }

        public IEnumerable<string> GetSymbols()
        {
            return _orderBooks.Keys;
        }

        public IEnumerable<KeyValuePair<string, OrderBook>> GetOrderBooks()
        {
            return _orderBooks;
        }
    }
}