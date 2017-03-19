const sinon = require('sinon')
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')
const { TrafficLights } = require('./traffic-light.models')

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

const intersection = TrafficLightIntersection.of()
const clock = sinon.useFakeTimers()
const controller = TrafficLightIntersectionController.of(intersection, {
  clock,
  onTrafficLightChange: (state) => {
    console.log(`Elapsed: ${Date.now() / 1000} seconds`)
    outputState(state)
  },
  turnDuration: config.turnDuration,
  yellowDuration: config.yellowDuration
})

console.log('Starting simulation\n')
console.log('Starting configuration:')
outputState(intersection.getState())

controller.start()
clock.tick(config.duration)
controller.stop()

