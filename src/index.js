const sinon = require('sinon')
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')
const { TrafficLights } = require('./traffic-light.models')

// Default config specified by the information given.
const config = {
  duration: 1000 * 60 * 30,    // 30 minute duration
  turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
  yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
}

function outputState(state) {
  console.log(`North: ${state[TrafficLights.North]}`)
  console.log(`East: ${state[TrafficLights.East]}`)
  console.log(`South: ${state[TrafficLights.South]}`)
  console.log(`West: ${state[TrafficLights.West]}\n`)
}

// Create an intersection using default config provided from the factory.
const intersection = TrafficLightIntersection.of()

// Use a fake timer so that the simulation can be fast forwarded to particular points in time. This enables the 
// simulation to be run synchronously. A real timer could be implemented and used instead.
const clock = sinon.useFakeTimers()

// Instantiate the controller with the necessary parameters.
const controller = TrafficLightIntersectionController.of(intersection, {
  clock,
  onTrafficLightChange: (state) => {
    console.log(`Elapsed: ${Date.now() / 1000} seconds`)
    outputState(state)
  },
  turnDuration: config.turnDuration,
  yellowDuration: config.yellowDuration
})

// Output the initial configuration.
console.log('Starting simulation\n')
console.log('Starting configuration:')
outputState(intersection.getState())

// Start the simulation, fast forward it by the duration config (30 minutes) and then stop the simulation.
controller.start()
clock.tick(config.duration)
controller.stop()
