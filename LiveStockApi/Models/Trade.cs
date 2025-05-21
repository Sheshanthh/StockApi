using System;

namespace LiveStockApi.Models
{
    public class Trade
    {
        public Guid Id { get; set; }
        public required string Symbol { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
        public Guid BuyOrderId { get; set; }
        public Guid SellOrderId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}