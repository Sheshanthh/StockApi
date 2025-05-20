using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using LiveStockApi.Services;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly StockListService _stockListService;
    private readonly PriceCacheService _priceCacheService;

    public StockController(StockListService stockListService, PriceCacheService priceCacheService)
    {
        _stockListService = stockListService;
        _priceCacheService = priceCacheService;
    }

    // Return the full list of stocks
    [HttpGet("all")]
    public async Task<IActionResult> GetAllStocks()
    {
        var stocks = await _stockListService.GetStocksAsync();
        return Ok(stocks);
    }

    // Return price only if cached (symbol is in background update list)
    [HttpGet("price/{symbol}")]
    public IActionResult GetPrice(string symbol)
    {
        var price = _priceCacheService.GetPrice(symbol);

        if (price == null)
            return NotFound($"Price for symbol '{symbol}' not found in cache.");

        return Ok(new { Symbol = symbol.ToUpper(), Price = price });
    }
}
