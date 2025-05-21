using System.Text.Json.Serialization;

namespace LiveStockApi.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum OrderSide
    {
        Buy,
        Sell
    }
}