const { TrafficLightColor, TrafficLights } = require('./traffic-light.models')

function defaultConfig() {
  return {
    clock: setTimeout,
    duration: 1000 * 60 * 30,    // 30 minutes duration
    turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
    yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
  };
}

class TrafficLightIntersectionController {

  static of(intersection, config) {
    return new TrafficLightIntersectionController(intersection, config)
  }

  constructor(intersection, config = defaultConfig()) {
    this.intersection = intersection
    this.config = config
  }

  start() {
    let elapsed = 0
    const { clock, turnDuration, yellowDuration } = this.config
    while (elapsed < this.config.duration) {
      elapsed += turnDuration - yellowDuration
      clock.setTimeout(function (elapsed) {
        this.tick(elapsed)
      }.bind(this, elapsed), elapsed)
      elapsed += yellowDuration
      clock.setTimeout(function (elapsed) {
        this.tick(elapsed)
      }.bind(this, elapsed), elapsed)
    }
  }

  tick(elapsed) {
    const currentState = this.intersection.getState()
    const newState = this.getState(currentState, elapsed)
    if (currentState !== newState) {
      this.intersection.setState(newState)
      if (this.config.callback) {
        this.config.callback(elapsed, newState)
      }
    }
  }

  getState(state, elapsed) {
    // Validate that we are changing state and then retrieve the next state.
    if (elapsed % (this.config.turnDuration - this.config.yellowDuration) === 0
      || elapsed % this.config.turnDuration === 0) {
      return this.getNextState(state)
    }

    return state;
  }

  getNextState(state) {
    const getNextTrafficLightColor = (color, adjacentColor) => {
      if (color === TrafficLightColor.Green) {
        return TrafficLightColor.Yellow
      } else if (color === TrafficLightColor.Yellow) {
        return TrafficLightColor.Red
      } else if (color === TrafficLightColor.Red && adjacentColor === TrafficLightColor.Yellow) {
        return TrafficLightColor.Green
      }
      return color
    }

    return {
      [TrafficLights.North]: getNextTrafficLightColor(state[TrafficLights.North], state[TrafficLights.East]),
      [TrafficLights.East]: getNextTrafficLightColor(state[TrafficLights.East], state[TrafficLights.South]),
      [TrafficLights.South]: getNextTrafficLightColor(state[TrafficLights.South], state[TrafficLights.West]),
      [TrafficLights.West]: getNextTrafficLightColor(state[TrafficLights.West], state[TrafficLights.North])
    };
  }

}

module.exports = TrafficLightIntersectionController
