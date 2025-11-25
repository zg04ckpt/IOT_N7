using System.Text;
using MQTTnet;
using MQTTnet.Server;

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
    return Task.CompletedTask;
};

// Xử lý client đăng kí channel 
server.InterceptingSubscriptionAsync += args => {
    Console.WriteLine($"Client {args.ClientId} đã đăng kí kênh {args.TopicFilter.Topic}");
    return Task.CompletedTask;
};

server.InterceptingPublishAsync += args => {
    Console.WriteLine($"Yêu cầu public gói tin mới từ {args.ClientId}: {Encoding.UTF8.GetString(args.ApplicationMessage.PayloadSegment.Array)}");
    return Task.CompletedTask;
};

await server.StartAsync();
Console.WriteLine($"MQTT Broker Server is running in: tcp://0.0.0.0:1883");
Console.WriteLine("Press Enter to exit.");
Console.ReadLine();
await server.StopAsync();