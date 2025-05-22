using Microsoft.AspNetCore.Mvc;
using LiveStockApi.Services;

namespace LiveStockApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TradeHistoryController : ControllerBase
    {
        private readonly TradeHistoryService _tradeHistoryService;
        private readonly ILogger<TradeHistoryController> _logger;

        public TradeHistoryController(
            TradeHistoryService tradeHistoryService,
            ILogger<TradeHistoryController> logger)
        {
            _tradeHistoryService = tradeHistoryService;
            _logger = logger;
        }

        [HttpGet("{symbol}")]
        public IActionResult GetRecentTrades(string symbol, [FromQuery] int count = 20)
        {
            _logger.LogInformation("Getting recent trades for symbol: {Symbol}, count: {Count}", symbol, count);
            var trades = _tradeHistoryService.GetRecentTrades(symbol, count);
            return Ok(trades);
        }

        [HttpGet]
        public IActionResult GetAllRecentTrades([FromQuery] int count = 20)
        {
            _logger.LogInformation("Getting all recent trades, count: {Count}", count);
            var trades = _tradeHistoryService.GetAllRecentTrades(count);
            return Ok(trades);
        }
    }
} 