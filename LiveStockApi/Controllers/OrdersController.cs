using Microsoft.AspNetCore.Mvc;
using LiveStockApi.Models;
using LiveStockApi.Services;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging;

namespace LiveStockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly OrderBookManager _orderBookManager;
        private readonly OrderChannel _orderChannel;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            OrderBookManager orderBookManager, 
            OrderChannel orderChannel,
            ILogger<OrdersController> logger)
        {
            _orderBookManager = orderBookManager;
            _orderChannel = orderChannel;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderRequest request)
        {
            _logger.LogInformation("Received order request: {@Request}", request);

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

            _logger.LogInformation("Created order: {@Order}", order);

            await _orderChannel.WriteAsync(order);

            return Accepted(new { OrderId = order.OrderId });
        }

        [HttpGet("{symbol}/book")]
        public IActionResult GetOrderBook(string symbol)
        {
            _logger.LogInformation("Getting order book for symbol: {Symbol}", symbol);

            var orderBook = _orderBookManager.GetOrCreateOrderBook(symbol.ToUpper());

            var bestBid = orderBook.GetBestBid();
            var bestAsk = orderBook.GetBestAsk();
            decimal? spread = null;

            if (bestBid.HasValue && bestAsk.HasValue)
            {
                spread = bestAsk.Value - bestBid.Value;
            }

            var response = new
            {
                Symbol = symbol.ToUpper(),
                BestBid = bestBid,
                BestAsk = bestAsk,
                Spread = spread,
                BuyOrders = orderBook.GetBuyOrders(bestBid ?? 0),
                SellOrders = orderBook.GetSellOrders(bestAsk ?? 0)
            };

            _logger.LogInformation("Returning order book data: {@Response}", response);

            return Ok(response);
        }

        [HttpGet("{symbol}/orders")]
        public IActionResult GetOrders(string symbol, [FromQuery] decimal? price = null)
        {
            _logger.LogInformation("Getting orders for symbol: {Symbol}, price: {Price}", symbol, price);

            var orderBook = _orderBookManager.GetOrderBook(symbol.ToUpper());
            
            // Return empty lists if no order book exists
            if (orderBook == null)
            {
                _logger.LogWarning("No order book found for symbol {Symbol}", symbol);
                return Ok(new { BuyOrders = Enumerable.Empty<Order>(), SellOrders = Enumerable.Empty<Order>() });
            }

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