using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

public class PriceCacheService : BackgroundService
{
    private readonly FinnhubService _finnhubService;
    private readonly ILogger<PriceCacheService> _logger;

    // Thread-safe in-memory cache for symbol -> price
    private readonly ConcurrentDictionary<string, decimal> _priceCache = new();

    // List of symbols to update periodically — customize as needed
    private readonly string[] _symbolsToTrack = new[] { "AAPL", "MSFT", "GOOG", "AMZN", "TSLA" };

    public PriceCacheService(FinnhubService finnhubService, ILogger<PriceCacheService> logger)
    {
        _finnhubService = finnhubService;
        _logger = logger;
    }

    public decimal? GetPrice(string symbol)
    {
        return _priceCache.TryGetValue(symbol.ToUpper(), out var price) ? price : null;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("PriceCacheService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            foreach (var symbol in _symbolsToTrack)
            {
                var result = await _finnhubService.GetLivePriceAsync(symbol);
                if (result.Success && result.Price.HasValue)
                {
                    _priceCache[symbol.ToUpper()] = result.Price.Value;
                    _logger.LogInformation($"Updated price for {symbol}: {result.Price.Value}");
                }
                else
                {
                    _logger.LogWarning($"Failed to update price for {symbol}: {result.Error}");
                }
            }

            await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);
        }

        _logger.LogInformation("PriceCacheService is stopping.");
    }
}
