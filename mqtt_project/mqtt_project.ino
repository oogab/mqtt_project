#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT11.h>
#include <string.h>

char ssid[] = "oogab";
char pass[] = "rejavaji";
byte server1[] = {192, 168, 0, 46}; // MQTT Server IP (MQTT Broker)
int port = 1883;
DHT11 dht11(4);
WiFiClient client;

void msgReceived(char *topic, byte *payload, unsigned int uLen) {
  char pBuffer[uLen+1]; // 문자열로 오는 데이터를 담을 수 있는 배열 선언
  int i;
  for(i=0; i<uLen; i++) {
    pBuffer[i] = payload[i];
  }
  pBuffer[i] = '\0';
  Serial.println(pBuffer);
  if (pBuffer[0] == '1') {
    digitalWrite(14, HIGH);
  } else if (pBuffer[0] == '2') {
    digitalWrite(14, LOW);
  }
}

PubSubClient mqttClient(server1, port, msgReceived, client);

void setup() {
  pinMode(14, OUTPUT);
  Serial.begin(115200);
  delay(10);
  // digitalWrite(14, HIGH);
  Serial.println();
  Serial.println();
  Serial.print("Connecting to - ");
  Serial.println(ssid);
  WiFi.begin(ssid, pass);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500); // 0.5초 딜레이
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Wi-Fi Connected!");
  Serial.println(WiFi.localIP());
  // MQTT Server 접속
  if (mqttClient.connect("Arduino")) {
    Serial.println("MQTT Broker Connected!");
    mqttClient.subscribe("led"); // led 구독자 등록 (데이터를 읽어갈 구독자를 등록)
  }
}

void loop() {
  mqttClient.loop();
  float tmp, hum;
  int err = dht11.read(hum, tmp);
  if (err == 0) {
    char message[64] = "", pTmpBuf[50], pHumBuf[50];
    dtostrf(tmp, 5, 2, pTmpBuf);
    dtostrf(hum, 5, 2, pHumBuf);
    sprintf(message, "{\"tmp\":%s,\"hum\":%s}", pTmpBuf, pHumBuf);
    mqttClient.publish("dht11", message);
  }
  delay(3000);
}
