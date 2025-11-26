using System.Text;
using MQTTnet;
using MQTTnet.Protocol;
using MQTTnet.Server;

var clientTopics = new Dictionary<string, List<string>>();

var factory = new MqttFactory();
var options = new MqttServerOptionsBuilder()
	.WithDefaultEndpoint()
	.WithDefaultEndpointPort(1883)
    .Build();

using var server = factory.CreateMqttServer(options);

// Xử lý client kết nối 
server.ClientConnectedAsync += args => {
    Console.WriteLine($"Client {args.ClientId} đã kết nối từ {args.Endpoint}");
    return Task.CompletedTask;
};

// Xử lý client mất kết nối 
server.ClientDisconnectedAsync += args => {
    Console.WriteLine($"Client {args.ClientId} đã đóng kết nối");

    // Gửi thong báo mất kết nối tới toàn bộ topic
    if (clientTopics.TryGetValue(args.ClientId, out var topics))
    {
        foreach (var topic in topics)
        {
            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload($"DISCONNECTED-{args.ClientId}")
                .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtMostOnce) 
                .Build();

            server.InjectApplicationMessage(new InjectedMqttApplicationMessage(message));
        }
    }

    return Task.CompletedTask;
};

// Xử lý client đăng kí channel 
server.InterceptingSubscriptionAsync += args => {
    Console.WriteLine($"Client {args.ClientId} đã đăng kí kênh {args.TopicFilter.Topic}");

    // Quản lý topic
    if (!clientTopics.ContainsKey(args.ClientId))
        clientTopics[args.ClientId] = new List<string>();
    clientTopics[args.ClientId].Add(args.TopicFilter.Topic);

    // Không gửi lại message cho chính mình
    args.TopicFilter.NoLocal = true;
    return Task.CompletedTask;
};

server.InterceptingPublishAsync += args => {
    Console.WriteLine($"Client {args.ClientId} gửi lên kênh {args.ApplicationMessage.Topic}: {Encoding.UTF8.GetString(args.ApplicationMessage.PayloadSegment.Array)}");
    return Task.CompletedTask;
};

await server.StartAsync();
Console.WriteLine($"MQTT Broker Server is running in: tcp://0.0.0.0:1883");
Console.WriteLine("Press Enter to exit.");
Console.ReadLine();
await server.StopAsync();