const sinon = require('sinon')
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')
const { TrafficLights } = require('./traffic-light.models')

const config = {
  duration: 1000 * 60 * 30,    // 30 minute duration
  turnDuration: 1000 * 60 * 5, // 5 minutes before lights automatically switch
  yellowDuration: 1000 * 30    // Yellow light is on for 30 seconds before switching to red
}

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

