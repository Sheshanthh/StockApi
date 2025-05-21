using Microsoft.AspNetCore.Mvc;
using LiveStockApi.Models;
using LiveStockApi.Services;
using System.ComponentModel.DataAnnotations;

namespace LiveStockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderBookManager _orderBookManager;

        public OrdersController(OrderBookManager orderBookManager)
        {
            _orderBookManager = orderBookManager;
        }

        [HttpPost]
        public IActionResult PlaceOrder([FromBody] OrderRequest request)
        {
            if (request == null)
                return BadRequest("Invalid order request");

            if (string.IsNullOrWhiteSpace(request.Symbol))
                return BadRequest("Symbol is required");

            if (request.Price <= 0)
                return BadRequest("Price must be greater than 0");

            if (request.Quantity <= 0)
                return BadRequest("Quantity must be greater than 0");

            var order = new Order
            {
                Symbol = request.Symbol.ToUpper(),
                Price = request.Price,
                Quantity = request.Quantity,
                Side = request.Side
            };

            var orderBook = _orderBookManager.GetOrCreateOrderBook(order.Symbol);
            orderBook.AddOrder(order);

            return Accepted(new { OrderId = order.OrderId });
        }

        [HttpGet("{symbol}/book")]
        public IActionResult GetOrderBook(string symbol)
        {
            var orderBook = _orderBookManager.GetOrderBook(symbol.ToUpper());
            if (orderBook == null)
                return NotFound($"No order book found for symbol {symbol}");

            var bestBid = orderBook.GetBestBid();
            var bestAsk = orderBook.GetBestAsk();
            decimal? spread = null;

            if (bestBid.HasValue && bestAsk.HasValue)
            {
                spread = bestAsk.Value - bestBid.Value;
            }

            return Ok(new
            {
                Symbol = symbol.ToUpper(),
                BestBid = bestBid,
                BestAsk = bestAsk,
                Spread = spread
            });
        }

        [HttpGet("{symbol}/orders")]
        public IActionResult GetOrders(string symbol, [FromQuery] decimal? price = null)
        {
            var orderBook = _orderBookManager.GetOrderBook(symbol.ToUpper());
            if (orderBook == null)
                return NotFound($"No order book found for symbol {symbol}");

            if (price.HasValue)
            {
                var buyOrders = orderBook.GetBuyOrders(price.Value);
                var sellOrders = orderBook.GetSellOrders(price.Value);
                return Ok(new { BuyOrders = buyOrders, SellOrders = sellOrders });
            }

            var bestBid = orderBook.GetBestBid();
            var bestAsk = orderBook.GetBestAsk();

            var allBuyOrders = bestBid.HasValue ? orderBook.GetBuyOrders(bestBid.Value) : Enumerable.Empty<Order>();
            var allSellOrders = bestAsk.HasValue ? orderBook.GetSellOrders(bestAsk.Value) : Enumerable.Empty<Order>();

            return Ok(new { BuyOrders = allBuyOrders, SellOrders = allSellOrders });
        }
    }

    public class OrderRequest
    {
        [Required]
        public string Symbol { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
        public decimal Price { get; set; }

        [Range(0.01, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
        public decimal Quantity { get; set; }

        [Required]
        public OrderSide Side { get; set; }
    }
}