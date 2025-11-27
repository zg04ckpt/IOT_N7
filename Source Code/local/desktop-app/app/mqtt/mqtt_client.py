import paho.mqtt.client as mqtt

from app.models.enums import EventType

CLIENT_ID = "desktop-app"

BROKER_HOST = "10.228.235.99"
BROKER_PORT = 1883

ESP32C3_CHANNEL = "esp32c3"
ESP32CAM_CHANNEL = "esp32cam"

class MQTTClient:
    def __init__(self, on_received_message):
        self.client: mqtt.Client = mqtt.Client(
            client_id=CLIENT_ID, protocol=mqtt.MQTTv311,
            reconnect_on_failure=True)
        
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.on_received_message = on_received_message

    def run(self):
        self.client.connect(BROKER_HOST, BROKER_PORT, keepalive=60)
        self.client.loop_start()

    # Xử lý đăng kí kênh khi kết nối
    def _on_connect(self, client: mqtt.Client, userdata, flags, rc):
        if rc == 0:
            print(f"Đã kết nối tới MQTT Broker Server tại: {BROKER_HOST}:{BROKER_PORT}")
            client.subscribe(ESP32C3_CHANNEL); 
            print(f"Đã đăng kí kênh {ESP32C3_CHANNEL}")
            client.subscribe(ESP32CAM_CHANNEL); 
            print(f"Đã đăng kí kênh {ESP32CAM_CHANNEL}")

            print('Gửi REFRESH tới tất cả kênh')
            client.publish(ESP32C3_CHANNEL, "REFRESH")
            client.publish(ESP32CAM_CHANNEL, "REFRESH")
        else:
            print("Kết nối thất bại với code=", rc)

    # Xử lý message
    def _on_message(self, client, userdata, msg: mqtt.MQTTMessage):
        str = msg.payload.decode()
        print(f"Message mới từ channel {msg.topic}: {str}")

        if (msg.topic == ESP32C3_CHANNEL):
            self._handle_esp32c3_message(str)
        elif (msg.topic == ESP32CAM_CHANNEL):
            self._handle_esp32cam_message(str)

    def _handle_esp32c3_message(self, message):
        if (message == "READY"):
            self.on_received_message(EventType.ESP32C3_CONNECTED, {})
        elif (message.startswith("DISCONNECTED-")):
            clientId = message.split("-")[1]
            if clientId == ESP32C3_CHANNEL:
                self.on_received_message(EventType.ESP32C3_DISCONNECTED, None)
        elif (message.startswith("UID-")):
            self.on_received_message(EventType.ESP32C3_UID, message.split("-")[1])

    def _handle_esp32cam_message(self, message):
        if (message == "READY"):
            self.on_received_message(EventType.ESP32CAM_CONNECTED, {})
        elif (message.startswith("STREAM_URL-")):
            self.on_received_message(EventType.ESP32CAM_STREAM_URL, message.split("-")[1])
        elif (message.startswith("CAPTURE_URL-")):
            self.on_received_message(EventType.ESP32CAM_CAPTURE_URL, message.split("-")[1])
        elif (message.startswith("DISCONNECTED-")):
            clientId = message.split("-")[1]
            if clientId == ESP32CAM_CHANNEL:
                self.on_received_message(EventType.ESP32CAM_DISCONNECTED, None)



