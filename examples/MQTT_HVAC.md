
# Home Assistant MQTT HVAC

Here is a yaml example of how to add a Home Assistant [MQTT HVAC](https://www.home-assistant.io/integrations/climate.mqtt/) entity in order to subscribe/publish information to the `mqtt-hvac-vent-control` system.

```yaml
climate:
  - platform: mqtt
    name: Office Target Temperature
    initial: 72
    min_temp: 60
    max_temp: 80
    temperature_command_topic: 'stat/office/target_temperature'
    current_temperature_topic: 'shellies/office/sensor/temperature'
    mode_state_topic: 'stat/office/mode'
    modes:
      - 'cool'
      - 'heat'
      - 'off'
    retain: true
```

![Screenshot_20220811-100628](https://user-images.githubusercontent.com/4724577/184466030-f062cb85-e0fc-4c81-87bf-b64ced862f4a.png)
