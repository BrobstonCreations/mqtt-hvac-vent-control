# mqtt-hvac-vent-control
This project is intended to bring together a thermostat, tempertaure sensors, and smart vents to make your home more comfortable.

## Getting Started
1. Home Assistant
- Create a bridge to expose your thermostat to the MQTT broker through the use of [automations](/MQTT_AUTOMATIONS.md).
- Create [MQTT HVAC](https://www.home-assistant.io/integrations/climate.mqtt/) entities for rooms.
2. Temperature Sensors
- Any temperature sensor that can be exposed to the MQTT broker should work, I'm using [Shelly H&T](https://shelly.cloud/products/shelly-humidity-temperature-smart-home-automation-sensor/) currently.
- It is likely possible to use sensors that are not specifically MQTT, as long as there is some sort of bridge available. Any sensor that can be integrated into Home Assistant could be used through creating Home Assistant automations as a bridge to MQTT; this is similar to the current approach to expose your thermostat to the MQTT Broker.
3. Vents 
- Any Smart Vent that can be opened/closed using MQTT should work. I've built my own using a 3D printer and some relatively simple microelectronics [Yet Another Smart Vent](https://github.com/TonyBrobston/yet-another-smart-vent).
- It is likely possible to modify an off-the-shelf smart vent to be controlled via MQTT.
4. MQTT Broker
- [Everything Smart Home](https://www.youtube.com/c/EverythingSmartHome) has a good [MQTT Broker Setup Video](https://www.youtube.com/watch?v=dqTn-Gk4Qeo).
6. MQTT HVAC Vent Control
- In order to create the configuration to run this system, you need to understand the basic structure; I made it as straight forward as I could. The [TypeScript types](https://github.com/TonyBrobston/mqtt-hvac-vent-control/blob/master/src/types/Mqtt.ts) can serve as documentation. In general, a House has a Thermostat and Rooms... and a Room consistents of Vents. Each of these Types also has command and state topics, as well as payloads for different commands or states. Here is [my configuration file](https://github.com/TonyBrobston/tbro-server/blob/master/home-automation/mqtt-hvac-vent-control/options.json) which is stored as [JSON](https://www.json.org/json-en.html).
- Eventually I will publish a Docker Image to Docker Hub, but for now you will need to use the DockerFile in this project to build your own local image. I currently run Home Assistant and this project using [Docker Compose on an Ubuntu Server](https://github.com/TonyBrobston/tbro-server/blob/1807110b9a0e4be52087e243b67bff6fa52bc397/home-automation/docker-compose.yml#L75-L80). If you are running Home Assistant on a Raspberry Pi, this can likely be ran using Portainer. I also assume this will run fine on Unraid, however I have not tested that method.

## Future features

## Philosophy

## Pull Requests

## Bugs
