# Home Assistant Automations

Here are some yaml examples of how to add Home Assistant Automations in order to subscribe/publish information for your thermostat. These automations act as a bridge to add MQTT functionality to a thermostat that otherwise does not have it. The `alias` describes what the automation does.

```yaml
alias: Publish MQTT State when Ecobee Action Changes
trigger:
  - platform: state
    entity_id:
      - climate.ecobee
action:
  - service: mqtt.publish
    data:
      topic: stat/ecobee/action
      payload: '{{trigger.to_state.attributes.hvac_action}}'
      retain: true
mode: single
```

```yaml
alias: Publish MQTT State when Ecobee Actual Temperature Changes
trigger:
  - platform: state
    entity_id:
      - climate.ecobee
action:
  - service: mqtt.publish
    data:
      topic: stat/ecobee/actual_temperature
      payload: '{{trigger.to_state.attributes.current_temperature}}'
      retain: true
mode: single
```

```yaml
alias: Publish MQTT State when Ecobee Mode Changes
trigger:
  - platform: state
    entity_id:
      - climate.ecobee
action:
  - service: mqtt.publish
    data:
      topic: stat/ecobee/mode
      payload: '{{trigger.to_state.state}}'
      retain: true
mode: single
```

```yaml
alias: Publish MQTT State when Ecobee Target Temperature Changes
trigger:
  - platform: state
    entity_id: climate.ecobee
action:
  - service: mqtt.publish
    data:
      topic: stat/ecobee/target_temperature
      payload: '{{trigger.to_state.attributes.temperature}}'
      retain: true
mode: single
```

```yaml
alias: Subscribe to MQTT topic to change Ecobee Set Temperature
trigger:
  - platform: mqtt
    topic: cmd/ecobee/temperature
action:
  - service: climate.set_temperature
    target:
      entity_id: climate.ecobee
    data:
      temperature: '{{trigger.payload}}'
mode: single
```
