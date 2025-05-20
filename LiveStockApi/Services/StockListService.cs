using System.Collections.Generic;
using System.Threading.Tasks;

namespace LiveStockApi.Services
{
    public class StockListService
    {
        private readonly List<string> _stocks = new()
        {
            "AAPL", "MSFT", "GOOG", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "WMT"
        };

        public Task<List<string>> GetStocksAsync()
        {
            return Task.FromResult(_stocks);
        }
    }
} 