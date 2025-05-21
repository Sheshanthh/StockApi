using System.Threading.Channels;
using LiveStockApi.Models;

namespace LiveStockApi.Services
{
    public class OrderChannel
    {
        private readonly Channel<Order> _channel;

        public OrderChannel()
        {
            // Create an unbounded channel with SingleReaderSingleWriter mode for better performance
            _channel = Channel.CreateUnbounded<Order>(new UnboundedChannelOptions
            {
                SingleReader = true,
                SingleWriter = false
            });
        }

        public async ValueTask WriteAsync(Order order)
        {
            await _channel.Writer.WriteAsync(order);
        }

        public IAsyncEnumerable<Order> ReadAllAsync(CancellationToken cancellationToken = default)
        {
            return _channel.Reader.ReadAllAsync(cancellationToken);
        }
    }
} 