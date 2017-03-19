const { TrafficLightColor, TrafficLights } = require('./traffic-light.models')

function defaultConfig() {
  return {
    clock: setTimeout,
    onTrafficLightChange: () => {},
    turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
    yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
  };
}

class TrafficLightIntersectionController {

  static of(intersection, config = defaultConfig()) {
    const { clock, onTrafficLightChange, turnDuration, yellowDuration } = config
    const options = {
      clock,
      intersection,
      onTrafficLightChange,
      turnDuration,
      yellowDuration
    }
    return new TrafficLightIntersectionController(options)
  }

  constructor({ clock, intersection, onTrafficLightChange, turnDuration, yellowDuration }) {
    this.clock = clock
    this.intersection = intersection
    this.onTrafficLightChange = onTrafficLightChange
    this.turnDuration = turnDuration
    this.yellowDuration = yellowDuration
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
    const { clock, turnDuration, yellowDuration } = this
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
      if (this.onTrafficLightChange) {
        this.onTrafficLightChange(newState)
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
