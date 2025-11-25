import paho.mqtt.client as mqtt

CLIENT_ID = "desktop-app"

BROKER_HOST = "0.0.0.0"
BROKER_PORT = 1883

ESP32C3_CHANNEL = "esp32c3"
ESP32CAM_CHANNEL = "esp32cam"

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client(CLIENT_ID)
        
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message

    def run(self):
        self.client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
        self.client.loop_forever()

    # Xử lý đăng kí kênh khi kết nối
    def _on_connect(client, userdata, flags, rc):
        if rc == 0:
            print(f"Đã kết nối tới MQTT Broker Server tại: {BROKER_HOST}:{BROKER_PORT}")
            client.subscribe(ESP32C3_CHANNEL); 
            print(f"Đã đăng kí kênh {ESP32C3_CHANNEL}")
            client.subscribe(ESP32CAM_CHANNEL); 
            print(f"Đã đăng kí kênh {ESP32C3_CHANNEL}")

            client.publish(ESP32C3_CHANNEL, "Xin chào")
        else:
            print("Kết nối thất bại với code=", rc)

    # Xử lý message
    def _on_message(client, userdata, msg):
        print(f"Message mới từ channel {msg.topic}: {msg.payload.decode()}")



