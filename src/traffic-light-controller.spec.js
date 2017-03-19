const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const { expect } = chai
chai.use(sinonChai)

const { TrafficLights, TrafficLightColor } = require('./traffic-light.models')
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')

const { North, East, South, West } = TrafficLights
const { Green, Yellow, Red } = TrafficLightColor

describe('traffic lights', function() {

  function createIntersectionController(onTrafficLightChange) {
    const intersection = new TrafficLightIntersection({
      [North]: TrafficLightColor.Green,
      [East]: TrafficLightColor.Red,
      [South]: TrafficLightColor.Green,
      [West]: TrafficLightColor.Red
    })

    const config = {
      clock: sinon.useFakeTimers(),
      intersection,
      onTrafficLightChange,
      turnDuration: 1000 * 60 * 5,
      yellowDuration: 1000 * 30
    }

    const controller = new TrafficLightIntersectionController(config)

    return { config, controller }
  }

  it('should automatically change the lights from green to red every five minutes', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()
    config.clock.tick(config.turnDuration)
    controller.stop()

    expect(spy).to.be.calledTwice // Green -> Yellow -> Red
    expect(spy).to.be.calledWith({
      [North]: Red,
      [East]: Green,
      [South]: Red,
      [West]: Green
    })
  })

  it('should not change traffic light colors one second before (turnDuration - yellowDuration)', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()
    config.clock.tick(config.turnDuration - config.yellowDuration - 1)
    controller.stop()

    expect(spy).to.be.not.be.called
  })

  it('should change the lights from green to yellow and the other remain red at (turnDuration - yellowDuration)', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()
    config.clock.tick(config.turnDuration - config.yellowDuration)
    controller.stop()

    expect(spy).to.be.calledOnce // Green -> Yellow
    expect(spy).to.be.calledWith({
      [North]: Yellow,
      [East]: Red,
      [South]: Yellow,
      [West]: Red
    })
  })

  it('should display the red light for yellow duration prior to switching to red', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()

    config.clock.tick(config.turnDuration - config.yellowDuration)
    expect(spy).to.be.calledWith({
      [North]: Yellow,
      [East]: Red,
      [South]: Yellow,
      [West]: Red
    })

    config.clock.tick(config.yellowDuration)
    expect(spy).to.be.calledWith({
      [North]: Red,
      [East]: Green,
      [South]: Red,
      [West]: Green
    })

    controller.stop()

    expect(spy).to.be.calledTwice

  })

  it('should not change state when the controller has stopped', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)
    controller.start()
    controller.stop()
    config.clock.tick(1)

    expect(spy).to.not.have.been.called
  })

  it('should output as expected for thirty minutes with default config', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()
    config.clock.tick(1000 * 60 * 30)
    controller.stop()

    const getOutput = (north, east, south, west) => {
      return {
        [North]: north,
        [East]: east,
        [South]: south,
        [West]: west
      }
    }

    const calls = spy.getCalls()
    const input = calls.map(call => call.args[0])
    const output = [
      getOutput(Yellow, Red, Yellow, Red), // 1
      getOutput(Red, Green, Red, Green),   // 2
      getOutput(Red, Yellow, Red, Yellow), // 3
      getOutput(Green, Red, Green, Red),   // 4
      getOutput(Yellow, Red, Yellow, Red), // 5
      getOutput(Red, Green, Red, Green),   // 6
      getOutput(Red, Yellow, Red, Yellow), // 7
      getOutput(Green, Red, Green, Red),   // 8
      getOutput(Yellow, Red, Yellow, Red), // 9
      getOutput(Red, Green, Red, Green),   // 10
      getOutput(Red, Yellow, Red, Yellow), // 11
      getOutput(Green, Red, Green, Red)    // 12
    ]

    expect(input).to.deep.equal(output)

  })

});
