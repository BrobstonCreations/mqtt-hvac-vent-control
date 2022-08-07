# mqtt-hvac-vent-control
This project is intended to bring together a thermostat, tempertaure sensors, and smart vents to make your home more comfortable.

## Getting Started
1. Home Assistant
- Create a bridge to expose your thermostat to the MQTT broker through the use of automations.
- Create [MQTT HVAC](https://www.home-assistant.io/integrations/climate.mqtt/) entities for rooms.
2. Temperature Sensors
- Any temperature sensor that can be exposed to the MQTT broker should work, I'm using [Shelly H&T](https://shelly.cloud/products/shelly-humidity-temperature-smart-home-automation-sensor/) currently.
- It is likely possible to use sensors that are not specifically MQTT, as long as there is some sort of bridge available. Any sensor that can be integrated with Home Assistant could be used through creating Home Assistant automations as a bridge to MQTT. This is similar to the current approach to expose your thermostat to the MQTT Broker.
3. Vents 
- Any Smart Vent that can be opened/closed using MQTT should work. I've built my own using a 3D printer and some relatively simple microelectronics [Yet Another Smart Vent](https://github.com/TonyBrobston/yet-another-smart-vent).
- It is likely possible to modify an off-the-shelf smart vent to be controlled via MQTT.
4. MQTT Broker
5. MQTT HVAC Vent Control

## Future features

## Philosophy

## Pull Requests

## Bugs
