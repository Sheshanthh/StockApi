using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace LiveStockApi.Services
{
    public class MatchingEngine : BackgroundService
    {
        private readonly ILogger<MatchingEngine> _logger;
        private readonly OrderBookManager _orderBookManager;

        public MatchingEngine(ILogger<MatchingEngine> logger, OrderBookManager orderBookManager)
        {
            _logger = logger;
            _orderBookManager = orderBookManager;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Matching Engine started");
            
            while (!stoppingToken.IsCancellationRequested)
            {
                foreach (var symbolOrderBook in _orderBookManager.GetOrderBooks())
                {
                    while (symbolOrderBook.Value.TryMatch(out var trade))
                    {
                        _logger.LogInformation($"Matched trade: {trade?.Quantity}@{trade?.Price}");
                    }
                }
                await Task.Delay(100, stoppingToken);
            }
        }
    }
}