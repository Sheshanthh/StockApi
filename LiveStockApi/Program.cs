using LiveStockApi.Services;
using LiveStockApi.Hubs;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();  // Required for SignalR
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

// Add SignalR
builder.Services.AddSignalR();

// Register services
builder.Services.AddSingleton<StockListService>();
builder.Services.AddSingleton<PriceCacheService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<PriceCacheService>());
builder.Services.AddSingleton<OrderBookManager>();
builder.Services.AddSingleton<OrderChannel>();
builder.Services.AddSingleton<StockHubService>();
builder.Services.AddHostedService<MatchingEngine>();
builder.Services.AddSingleton<TradeHistoryService>();

var app = builder.Build();

// Enable CORS
app.UseCors();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}

// Remove HTTPS redirection for development
// app.UseHttpsRedirection();

app.MapControllers();
app.MapHub<StockHub>("/hubs/stock");  // Map SignalR hub

// Configure the URLs
app.Urls.Clear();
app.Urls.Add("http://localhost:5000");

app.Run();