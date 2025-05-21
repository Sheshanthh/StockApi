using LiveStockApi.Services;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpClient<FinnhubService>(client =>
{
    client.BaseAddress = new Uri("https://finnhub.io/");
});

// Configure JSON serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Register services
builder.Services.AddSingleton<StockListService>();
builder.Services.AddSingleton<PriceCacheService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<PriceCacheService>());
builder.Services.AddSingleton<OrderBookManager>();
builder.Services.AddSingleton<OrderChannel>();
builder.Services.AddHostedService<MatchingEngine>();  // Add matching engine as background service

var app = builder.Build();

// Enable CORS
app.UseCors();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();