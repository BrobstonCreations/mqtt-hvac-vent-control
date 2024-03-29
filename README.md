# MQTT HVAC Vent Control
This project is intended to bring together a thermostat, temperature sensors, and smart vents to make your home more comfortable.

Currently I would consider this system experimental and would not recommend running this system all the time. See the [Future Features](https://github.com/TonyBrobston/mqtt-hvac-vent-control#future-features) for more context. Also, see [this issue](https://github.com/BrobstonCreations/mqtt-hvac-vent-control/issues/3) before you run this project.

The intent is to eventually port this to a Home Assistant Integration. This will make installation easier and hopefully I can utilize Home Assistant entities to expand on the devices that can be used with this system (not just MQTT).

![image](https://user-images.githubusercontent.com/4724577/184554335-28a964c4-4650-4a7c-8759-7eb4af0e5048.png)
![image](https://user-images.githubusercontent.com/4724577/184554530-deefc180-39fc-4a3f-83d5-a1e775e62f94.png)


## Getting Started
1. Home Assistant
    - Currently this system requires that you have a thermostat integrated into Home Assistant.
    - Create a bridge to expose your thermostat to the MQTT broker through the use of [automations](/examples/MQTT_AUTOMATIONS.md).
    - Create [MQTT HVAC entities for rooms](/examples/MQTT_HVAC.md) in order to have a way to set the target temperature of a room.
2. Temperature Sensors
    - Any temperature sensor that can be exposed to the MQTT broker should work, I'm using [Shelly H&T](https://shelly.cloud/products/shelly-humidity-temperature-smart-home-automation-sensor/) currently.
    - It is likely possible to use sensors that are not specifically MQTT, as long as there is some sort of bridge available. Any sensor that can be integrated into Home Assistant could be used through creating Home Assistant automations as a bridge to MQTT; this is similar to the current approach to expose your thermostat to the MQTT Broker.
3. Smart Vents 
    - Any Smart Vent that can be opened/closed using MQTT should work. I've built my own ([Yet Another Smart Vent](https://github.com/TonyBrobston/yet-another-smart-vent)) using a 3D printer and some relatively simple microelectronics.
    - It is likely possible to modify an off-the-shelf smart vent to be controlled via MQTT.
4. MQTT Broker
    - [Everything Smart Home](https://www.youtube.com/c/EverythingSmartHome) has a good [MQTT Broker Setup Video](https://www.youtube.com/watch?v=dqTn-Gk4Qeo).
5. MQTT HVAC Vent Control
    - In order to create the configuration to run this system, you need to understand the basic structure; I made it as straight forward as I could. The [TypeScript types](https://github.com/TonyBrobston/mqtt-hvac-vent-control/blob/master/src/types/Mqtt.ts) can serve as documentation. In general, a House has a Thermostat and Rooms... and a Room consistents of Vents. Each of these Types also has command and state topics, as well as payloads for different commands or states. Here is [my configuration file](https://github.com/TonyBrobston/tbro-server/blob/master/home-automation/mqtt-hvac-vent-control/options.json) which is stored as [JSON](https://www.json.org/json-en.html).
    - You can pull down this Docker Image from Docker Hub. `docker pull brobstoncreations/mqtt-hvac-vent-control`. I currently run Home Assistant and this project using [Docker Compose on an Ubuntu Server](https://github.com/TonyBrobston/tbro-server/blob/master/home-automation/docker-compose.yml). If you are running Home Assistant on a Raspberry Pi, this can likely be ran using Portainer. I also assume this will run fine on Unraid, however I have not tested that method.

## Future Features
- Add the ability to monitor Delta T (the difference in temperature of the air between the return plenum and the main plenum). 
- Add the ability to predefine the number of vents to keep open at all times.
- Add the ability to store secrets.
- Publish messages when system is online/offline (Last Will and Testament).
- Subscribe to vent online/offline and publish warnings.
- Analyze actual vs. target temperature comparison as well as whole number vs. decimal.
- Research QoS and determine if changes need made.
- Add retain as a configuration option.
- Consolidate test data creation (consider using factories).
- Refactor room service to publish mode based on thermostat and vent state.
- Add configuration options to set certain values globally.
- Setup GitHub Actions to run test/lint on pull requests.
- Look into adding functionality to push latest yet-another-smart-vent version to vents through ArduinoOTA.

## Philosophy
- Local Control
- External Integration
- Easy of Use (this will improve over time)
- Community Feedback
- Community Contributions
- Agile, Lean, and Extreme Programming Practices
- Test Driven Development

## Pull Requests
Pull Requests are always welcome. I would recommend starting with an [issue](https://github.com/TonyBrobston/mqtt-hvac-vent-control/issues), so that we can discuss viability and implementation.

## Issues
Feel free to open an [issue](https://github.com/TonyBrobston/mqtt-hvac-vent-control/issues) and I will respond as I have time. The hope is to create a system that gives consumers what they want, your feedback is important. 
