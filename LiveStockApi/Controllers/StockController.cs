using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly FinnhubService _finnhubService;

    public StockController(FinnhubService finnhubService)
    {
        _finnhubService = finnhubService;
    }

    [HttpGet("price/{symbol}")]
    public async Task<IActionResult> GetPrice(string symbol)
    {
        var result = await _finnhubService.GetLivePriceAsync(symbol);

        if (!result.Success)
            return Problem(result.Error ?? "Unknown error occurred.");

        return Ok(new { Symbol = symbol.ToUpper(), Price = result.Price });
    }
}
