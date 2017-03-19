const { TrafficLightColor, TrafficLights } = require('./traffic-light.models')

function defaultConfig() {
  return {
    clock: setTimeout,
    turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
    yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
  };
}

class TrafficLightIntersectionController {

  static of(intersection, config = defaultConfig()) {
    return new TrafficLightIntersectionController(intersection, config)
  }

  constructor(intersection, config) {
    this.intersection = intersection
    this.config = config
  }

  start() {
    this.step()
  }

  stop() {
    if (this.destroy) {
      this.destroy()
    }
  }

  step() {
    const { clock, turnDuration, yellowDuration } = this.config
    const timeout1 = clock.setTimeout(() => {
      this.advanceToNextState()
    }, turnDuration - yellowDuration)
    const timeout2 = clock.setTimeout(() => {
      this.advanceToNextState()
      this.step()
    }, turnDuration)

    this.destroy = () => {
      clock.clearTimeout(timeout1)
      clock.clearTimeout(timeout2)
    }
  }

  advanceToNextState() {
    const currentState = this.intersection.getState()
    const newState = this.getNextState(currentState)
    if (currentState !== newState) {
      this.intersection.setState(newState)
      if (this.config.callback) {
        this.config.callback(newState)
      }
    }
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
