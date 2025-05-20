using LiveStockApi.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<FinnhubService>(client =>
{
    client.BaseAddress = new Uri("https://finnhub.io/");
});

// Register services
builder.Services.AddSingleton<StockListService>();
builder.Services.AddSingleton<PriceCacheService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<PriceCacheService>());

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
