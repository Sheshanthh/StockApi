using System;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

public class FinnhubService
{
    private readonly HttpClient _client;
    private readonly string? _apiKey;

    public FinnhubService(HttpClient client, IConfiguration configuration)
    {
        _client = client;
        _apiKey = configuration["FinnhubApiKey"];
    }

    public async Task<(bool Success, decimal? Price, string? Error)> GetLivePriceAsync(string symbol)
    {
        if (string.IsNullOrEmpty(_apiKey))
            return (false, null, "Finnhub API key is missing");

        HttpResponseMessage response;
        try
        {
            response = await _client.GetAsync($"api/v1/quote?symbol={symbol}&token={_apiKey}");
        }
        catch (Exception ex)
        {
            return (false, null, $"HTTP request failed: {ex.Message}");
        }

        if (!response.IsSuccessStatusCode)
            return (false, null, $"Failed to fetch data from Finnhub. Status code: {response.StatusCode}");

        var json = await response.Content.ReadAsStringAsync();

        // Log full response for debugging
        Console.WriteLine($"Finnhub response for '{symbol}': {json}");

        try
        {
            using var doc = JsonDocument.Parse(json);

            if (doc.RootElement.TryGetProperty("c", out var currentPriceElement) &&
                currentPriceElement.TryGetDecimal(out var currentPrice))
            {
                return (true, currentPrice, null);
            }
            else
            {
                return (false, null, $"Price field 'c' not found or invalid in response.");
            }
        }
        catch (JsonException ex)
        {
            return (false, null, $"Failed to parse JSON response: {ex.Message}");
        }
    }
}
