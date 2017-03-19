const { TrafficLightColor, TrafficLights } = require('./traffic-light.models')

function defaultState() {
  return {
    [TrafficLights.North]: TrafficLightColor.Green,
    [TrafficLights.East]: TrafficLightColor.Red,
    [TrafficLights.South]: TrafficLightColor.Green,
    [TrafficLights.West]: TrafficLightColor.Red
  };
}

class TrafficLightIntersection {

  static of(state = defaultState()) {
    return new TrafficLightIntersection(state)
  }

  constructor(state) {
    this.state = state
  }

  setState(state) {
    this.state = state
  }

  getState() {
    return this.state
  }

}

module.exports = TrafficLightIntersection
