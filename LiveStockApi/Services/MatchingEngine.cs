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
        private readonly StockHubService _stockHubService;
        private readonly TradeHistoryService _tradeHistoryService;

        public MatchingEngine(
            ILogger<MatchingEngine> logger,
            OrderBookManager orderBookManager,
            OrderChannel orderChannel,
            StockHubService stockHubService,
            TradeHistoryService tradeHistoryService)
        {
            _logger = logger;
            _orderBookManager = orderBookManager;
            _orderChannel = orderChannel;
            _stockHubService = stockHubService;
            _tradeHistoryService = tradeHistoryService;
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
                        _logger.LogInformation("Processing order: {@Order}", order);

                        var orderBook = _orderBookManager.GetOrCreateOrderBook(order.Symbol);
                        orderBook.AddOrder(order);

                        _logger.LogInformation("Order added to order book for {Symbol}", order.Symbol);

                        // Get order book data and broadcast update
                        var orderBookData = _orderBookManager.GetOrderBookData(order.Symbol);
                        _logger.LogInformation("Broadcasting order book update: {@OrderBookData}", orderBookData);
                        await _stockHubService.BroadcastOrderBookUpdate(order.Symbol, orderBookData);

                        // Try to match orders immediately after adding a new order
                        while (orderBook.TryMatch(out var trade))
                        {
                            _logger.LogInformation(
                                "Matched trade: {Quantity}@{Price} for {Symbol}",
                                trade.Quantity,
                                trade.Price,
                                trade.Symbol);

                            // Store trade in history
                            _tradeHistoryService.AddTrade(trade);

                            // Broadcast trade update
                            _logger.LogInformation("Broadcasting trade update: {@Trade}", trade);
                            await _stockHubService.BroadcastTrade(trade.Symbol, trade);

                            // Broadcast updated order book after trade
                            orderBookData = _orderBookManager.GetOrderBookData(order.Symbol);
                            await _stockHubService.BroadcastOrderBookUpdate(order.Symbol, orderBookData);
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