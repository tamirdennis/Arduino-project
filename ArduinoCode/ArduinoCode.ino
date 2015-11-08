/*
 Created by Igor Jarc
See http://iot-playground.com for details
Please use community fourum on website do not contact author directly

Code based on https://github.com/DennisSc/easyIoT-ESPduino/blob/master/sketches/ds18b20.ino

External libraries:
- https://github.com/adamvr/arduino-base64
- https://github.com/milesburton/Arduino-Temperature-Control-Library

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
version 2 as published by the Free Software Foundation.
*/
#include <ESP8266.h>
#include <OneWire.h>
#include <DallasTemperature.h>
//#include <DateTime.h>

//AP definitions
#define AP_SSID "DEN"
#define AP_PASSWORD "zxasqw123"

// Arduino server definitions
#define USERNAME    "tamir"
#define PASSWORD    "denis"
#define IP_ADDRESS  "192.168.1.101"
#define PORT        3000

#define REPORT_INTERVAL 5 // in seconds


//#define ONE_WIRE_BUS 2  // DS18B20 pin
//OneWire oneWire(ONE_WIRE_BUS);
//DallasTemperature DS18B20(&oneWire);
String token;
ESP8266 wifi(Serial1);

void setup() {
  Serial.begin(9600);
  Serial.print("setup begin\r\n");
  if(wifi.restart()){
    Serial.print("restart ok\r\n");
  } else {
    Serial.print("restart err\r\n");
  }
  delay(5000);
  
  Serial.print("FW Version:");
  Serial.println(wifi.getVersion().c_str());

  if (wifi.setOprToStationSoftAP()) {
    Serial.print("to station + softap ok\r\n");
  } else {
    Serial.print("to station + softap err\r\n");
  }
  wifiConnect();
  //////////////////////////////////////

  uint8_t buffer[128] = {0};

  if (wifi.createTCP(IP_ADDRESS, PORT)) {
    Serial.print("create tcp ok\r\n");
  } else {
    Serial.print("create tcp err\r\n");
  }

  String url = "/api/authenticate";

  Serial.print("Get data to URL: ");
  Serial.println(url);
  String content = "username=" + String(USERNAME) + "&password=" + String(PASSWORD);
  String message = "POST " + url + " HTTP/1.1\r\n" +
                "Host: " + String(IP_ADDRESS) + "\r\n" +
                "Connection: close\r\n" +
                "Content-Type: application/x-www-form-urlencoded" +
                "Content-Length: " + content.length() + "\r\n" +
                "\r\n" + content;
  if(wifi.send((const uint8_t*)&message, message.length()))
  {
      Serial.print("send msg ok\r\n");
   /*   uint32_t len = wifi.recv(buffer, sizeof(buffer), 10000);
      if (len > 0) {
        Serial.print("Received:[");
        for (uint32_t i = 0; i < len; i++) {
          Serial.print((char)buffer[i]);
        }
        Serial.print("]\r\n");
    }
    */
  }
  else
  {
    Serial.print("send msg err\r\n");
  }


  if (wifi.releaseTCP()) {
    Serial.print("release tcp ok\r\n");
  } else {
    Serial.print("release tcp err\r\n");
  }
  delay(5000);

  //////////////////////////////////////


  delay(100);
  Serial.print("setup end\r\n");
}

void loop() {
  /*float temp = 1;

  do {
    DS18B20.requestTemperatures();
    temp = DS18B20.getTempCByIndex(0);
    Serial.print("Temperature: ");
    Serial.println(temp);
  } while (temp == 85.0 || temp == (-127.0));
  
  // sendTeperature(temp);
  temp++;
  int cnt = REPORT_INTERVAL;

  while (cnt--)
    delay(1000);
  */
}

void wifiConnect()
{
  Serial.print("Connecting to AP");
  if (wifi.joinAP(AP_SSID, AP_PASSWORD)) {
    Serial.print("Join AP success\r\n");
    Serial.print("IP:");
    Serial.println( wifi.getLocalIP().c_str());
  } else {
    Serial.print("Join AP failure\r\n");
  }
  Serial.println("Setting to single connection mode\r\n");
  if (wifi.disableMUX()) {
    Serial.print("single ok\r\n");
  } else {
    Serial.print("single err\r\n");
  }
}

/*void sendTeperature(float temp)
{
   WiFiClient client;

   while(!client.connect(IP_ADDRESS, PORT)) {
    Serial.println("connection failed");
    wifiConnect();
  }

  String url = "";
  url += "/Api/EasyIoT/Control/Module/Virtual/"+ String(EIOT_NODE) + "/ControlLevel/"+String(temp); // generate EasIoT server node URL

  Serial.print("POST data to URL: ");
  Serial.println(url);

  client.print(String("POST ") + url + " HTTP/1.1\r\n" +
               "Host: " + String(EIOT_IP_ADDRESS) + "\r\n" +
               "Connection: close\r\n" +
               "Authorization: Basic " + unameenc + " \r\n" +
               "Content-Length: 0\r\n" +
               "\r\n");

  delay(100);
    while(client.available()){
    String line = client.readStringUntil('\r');
    Serial.print(line);
  }

  Serial.println();
  Serial.println("Connection closed");
}*/

