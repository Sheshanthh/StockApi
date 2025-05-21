using System;

namespace LiveStockApi.Models
{
    public class Order
    {
        public Guid OrderId { get; set; } = Guid.NewGuid();
        public required string Symbol { get; set; }
        public decimal Price { get; set; }
        public decimal Quantity { get; set; }
        public OrderSide Side { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public string UserId { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }
}