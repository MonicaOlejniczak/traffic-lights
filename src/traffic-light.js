const { TrafficLightColor, TrafficLights } = require('./traffic-light.models')

/**
 * Default state of the traffic light intersection used by the factory function.
 *
 * @returns {{}}
 */
function defaultState() {
  return {
    [TrafficLights.North]: TrafficLightColor.Green,
    [TrafficLights.East]: TrafficLightColor.Red,
    [TrafficLights.South]: TrafficLightColor.Green,
    [TrafficLights.West]: TrafficLightColor.Red
  };
}

/**
 * A simple class for storing the position of the traffic light in the intersection and its corresponding traffic light
 * color.
 */
class TrafficLightIntersection {

  /**
   * Factory function for instantiating a traffic light intersection.
   * 
   * @param state
   * @returns {TrafficLightIntersection}
   */
  static of(state = defaultState()) {
    return new TrafficLightIntersection(state)
  }

  /**
   * 
   * @param state
   */
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
