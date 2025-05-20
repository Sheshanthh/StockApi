var builder = WebApplication.CreateBuilder(args);

// Register typed HttpClient for FinnhubService
builder.Services.AddHttpClient<FinnhubService>(client =>
{
    client.BaseAddress = new Uri("https://finnhub.io/");
});

builder.Services.AddControllers();

var app = builder.Build();

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
