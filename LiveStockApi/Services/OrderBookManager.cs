using LiveStockApi.Models;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

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

        public object GetOrderBookData(string symbol)
        {
            var orderBook = GetOrderBook(symbol);
            if (orderBook == null)
            {
                return new
                {
                    Symbol = symbol,
                    BestBid = (decimal?)null,
                    BestAsk = (decimal?)null,
                    Spread = (decimal?)null,
                    BuyOrders = new List<object>(),
                    SellOrders = new List<object>()
                };
            }

            var bestBid = orderBook.GetBestBid();
            var bestAsk = orderBook.GetBestAsk();

            return new
            {
                Symbol = symbol,
                BestBid = bestBid,
                BestAsk = bestAsk,
                Spread = bestBid.HasValue && bestAsk.HasValue ? bestAsk.Value - bestBid.Value : (decimal?)null,
                BuyOrders = bestBid.HasValue
                    ? orderBook.GetBuyOrders(bestBid.Value).Select(o => new OrderBookEntryDto { Price = o.Price, Quantity = o.Quantity }).ToList()
                    : new List<OrderBookEntryDto>(),
                SellOrders = bestAsk.HasValue
                    ? orderBook.GetSellOrders(bestAsk.Value).Select(o => new OrderBookEntryDto { Price = o.Price, Quantity = o.Quantity }).ToList()
                    : new List<OrderBookEntryDto>()
            };
        }
    }
}