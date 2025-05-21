using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using LiveStockApi.Models;

namespace LiveStockApi.Services
{
    public class MatchingEngine : BackgroundService
    {
        private readonly ILogger<MatchingEngine> _logger;
        private readonly OrderBookManager _orderBookManager;
        private readonly OrderChannel _orderChannel;

        public MatchingEngine(
            ILogger<MatchingEngine> logger,
            OrderBookManager orderBookManager,
            OrderChannel orderChannel)
        {
            _logger = logger;
            _orderBookManager = orderBookManager;
            _orderChannel = orderChannel;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Matching Engine started");
            
            try
            {
                await foreach (var order in _orderChannel.ReadAllAsync(stoppingToken))
                {
                    try
                    {
                        var orderBook = _orderBookManager.GetOrCreateOrderBook(order.Symbol);
                        orderBook.AddOrder(order);

                        // Try to match orders immediately after adding a new order
                        while (orderBook.TryMatch(out var trade))
                        {
                            _logger.LogInformation(
                                "Matched trade: {Quantity}@{Price} for {Symbol}",
                                trade.Quantity,
                                trade.Price,
                                trade.Symbol);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing order {OrderId}", order.OrderId);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Matching Engine stopped");
            }
        }
    }
}