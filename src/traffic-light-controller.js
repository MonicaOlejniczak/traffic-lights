const { TrafficLightColor, TrafficLights } = require('./traffic-light.models')

/**
 * Default config for the traffic light intersection controller factory function.
 *
 * @returns {{clock: *, onTrafficLightChange: (function()), turnDuration: number, yellowDuration: number}}
 */
function defaultConfig() {
  return {
    clock: setTimeout,
    onTrafficLightChange: () => {},
    turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
    yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
  };
}

/**
 * The class for starting and ending the traffic light intersection simulation.
 */
class TrafficLightIntersectionController {

  /**
   * Factory function for instantiating a traffic light intersection controller.
   *
   * @param intersection
   * @param config
   * @returns {TrafficLightIntersectionController}
   */
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

  /**
   *
   * @param clock
   * @param intersection
   * @param onTrafficLightChange
   * @param turnDuration
   * @param yellowDuration
   */
  constructor({ clock, intersection, onTrafficLightChange, turnDuration, yellowDuration }) {
    this.clock = clock
    this.intersection = intersection
    this.onTrafficLightChange = onTrafficLightChange
    this.turnDuration = turnDuration
    this.yellowDuration = yellowDuration
  }

  /**
   * Begin the simulation.
   */
  start() {
    this.step()
  }

  /**
   * Stop the simulation by destroying any existing timers.
   */
  stop() {
    if (this.destroy) {
      this.destroy()
    }
  }

  /**
   * Steps through the state for every turn duration. The following logic has been applied for each state transition:
   *
   * - Every (turnDuration - yellowDuration), any green traffic lights will be changed to yellow.
   * - Every turnDuration, any yellow lights will become red and all red lights will become green.
   *
   * @private
   */
  step() {
    const { clock, turnDuration, yellowDuration } = this

    // Set the first timeout for a transition from green -> yellow.
    const timeout1 = clock.setTimeout(() => {
      // Change the state.
      this.advanceToNextState()
    }, turnDuration - yellowDuration)

    // Set the second timeout for a transition from yellow -> red and red to green.
    const timeout2 = clock.setTimeout(() => {
      // Change the state.
      this.advanceToNextState()
      // Recursively repeat the step function, which results in incrementally adding timeouts as needed until stop()
      // is called.
      this.step()
    }, turnDuration)

    // Set the destroy function to clear the existing timeouts, which is used in the stop method.
    this.destroy = () => {
      clock.clearTimeout(timeout1)
      clock.clearTimeout(timeout2)
    }
  }

  /**
   * This method updates the state of the intersection if it has changed and outputs the new state to the
   * onTrafficLightChange callback function if it has been provided.
   *
   * @private
   */
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

  /**
   * Determines the next state of the traffic lights given the current state. This acts a bit like a reducer / state
   * machine in that only the previous state needs to be known to get the next one. There is only one 'action' i.e.
   * change the traffic light, so it does not need to be provided like it would in the redux pattern.
   *
   * @private
   * @param state
   * @returns {{}}
   */
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
