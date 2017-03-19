const sinon = require('sinon')
const Table = require('easy-table')
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')
const { TrafficLights } = require('./traffic-light.types')

// Default config specified by the information given.
const config = {
  duration: 1000 * 60 * 30,    // 30 minute duration
  turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
  yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
}

let i = 0;
function getResult(state) {
  return {
    '#': i++,
    'Time': `${Date.now() / 1000 / 60} min`,
    'North': state[TrafficLights.North],
    'East': state[TrafficLights.East],
    'South': state[TrafficLights.South],
    'West': state[TrafficLights.West]
  }
}
// Create an intersection using default config provided from the factory.
const intersection = TrafficLightIntersection.of()

// Use a fake timer so that the simulation can be fast forwarded to particular points in time. This enables the
// simulation to be run synchronously. A real timer could be implemented and used instead.
const clock = sinon.useFakeTimers()

// Results output
const results = []

// Instantiate the controller with the necessary parameters.
const controller = TrafficLightIntersectionController.of(intersection, {
  clock,
  onTrafficLightChange: (state) => {
    results.push(getResult(state))
  },
  turnDuration: config.turnDuration,
  yellowDuration: config.yellowDuration
})

console.log('Starting simulation...')
results.push(getResult(intersection))

// Start the simulation, fast forward it by the duration config (30 minutes) and then stop the simulation.
controller.start()
clock.tick(config.duration)
controller.stop()

console.log('Simulation finished\n')

console.log('Simulation Results\n')
console.log('==================\n')
console.log(Table.print(results))
