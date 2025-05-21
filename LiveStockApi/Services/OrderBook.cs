using System.Collections.Generic;
using LiveStockApi.Models;
using System.Collections.Concurrent;

namespace LiveStockApi.Services
{
    public class OrderBook
    {
        private readonly string _symbol;
        private readonly ConcurrentDictionary<decimal, List<Order>> _buyOrders;
        private readonly ConcurrentDictionary<decimal, List<Order>> _sellOrders;
        private readonly object _syncLock = new();

        public OrderBook(string symbol)
        {
            _symbol = symbol;
            _buyOrders = new ConcurrentDictionary<decimal, List<Order>>();
            _sellOrders = new ConcurrentDictionary<decimal, List<Order>>();
        }

        public void AddOrder(Order order)
        {
            if (order.Symbol != _symbol)
                throw new ArgumentException("Order symbol does not match order book symbol");

            var orders = order.Side == OrderSide.Buy ? _buyOrders : _sellOrders;
            orders.AddOrUpdate(
                order.Price,
                new List<Order> { order },
                (_, existingOrders) =>
                {
                    existingOrders.Add(order);
                    return existingOrders;
                });
        }

        public bool TryMatch(out Trade? trade)
        {
            trade = null;
            lock (_syncLock)
            {
                var bestBid = GetBestBid();
                var bestAsk = GetBestAsk();

                if (!bestBid.HasValue || !bestAsk.HasValue || bestBid.Value < bestAsk.Value)
                    return false;

                var buyOrders = _buyOrders[bestBid.Value];
                var sellOrders = _sellOrders[bestAsk.Value];

                if (buyOrders.Count == 0 || sellOrders.Count == 0)
                    return false;

                var buyOrder = buyOrders[0];
                var sellOrder = sellOrders[0];

                var quantity = Math.Min(buyOrder.Quantity, sellOrder.Quantity);
                trade = new Trade
                {
                    BuyOrderId = buyOrder.OrderId,
                    SellOrderId = sellOrder.OrderId,
                    Symbol = _symbol,
                    Price = bestAsk.Value,
                    Quantity = quantity,
                    Timestamp = DateTime.UtcNow
                };

                buyOrder.Quantity -= quantity;
                sellOrder.Quantity -= quantity;

                if (buyOrder.Quantity == 0)
                    buyOrders.RemoveAt(0);
                if (sellOrder.Quantity == 0)
                    sellOrders.RemoveAt(0);

                if (buyOrders.Count == 0)
                    _buyOrders.TryRemove(bestBid.Value, out _);
                if (sellOrders.Count == 0)
                    _sellOrders.TryRemove(bestAsk.Value, out _);

                return true;
            }
        }

        public decimal? GetBestBid()
        {
            return _buyOrders.Keys.Any() ? _buyOrders.Keys.Max() : null;
        }

        public decimal? GetBestAsk()
        {
            return _sellOrders.Keys.Any() ? _sellOrders.Keys.Min() : null;
        }

        public IEnumerable<Order> GetBuyOrders(decimal price)
        {
            return _buyOrders.TryGetValue(price, out var orders) ? orders : Enumerable.Empty<Order>();
        }

        public IEnumerable<Order> GetSellOrders(decimal price)
        {
            return _sellOrders.TryGetValue(price, out var orders) ? orders : Enumerable.Empty<Order>();
        }
    }
}