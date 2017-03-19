const sinon = require('sinon')
const config = require('./config');
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')
const { TrafficLights } = require('./traffic-light.models')

const intersection = TrafficLightIntersection.of()
const clock = sinon.useFakeTimers()
const controller = TrafficLightIntersectionController.of(intersection, {
  clock,
  turnDuration: config.turnDuration,
  yellowDuration: config.yellowDuration,
  callback: (state) => {
    console.log(`Elapsed: ${Date.now() / 1000} seconds`)
    console.log(`North: ${state[TrafficLights.North]}`)
    console.log(`East: ${state[TrafficLights.East]}`)
    console.log(`South: ${state[TrafficLights.South]}`)
    console.log(`West: ${state[TrafficLights.West]}\n`)
  }
})

console.log('Starting simulation')
controller.start()
clock.tick(config.duration)
controller.stop()

