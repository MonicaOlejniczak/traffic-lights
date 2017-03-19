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

  let clock
  let controller
  let intersection
  let onTrafficLightChange
  let turnDuration
  let yellowDuration

  beforeEach(function () {
    clock = sinon.useFakeTimers()
    intersection = new TrafficLightIntersection({
      [North]: TrafficLightColor.Green,
      [East]: TrafficLightColor.Red,
      [South]: TrafficLightColor.Green,
      [West]: TrafficLightColor.Red
    })
    onTrafficLightChange = sinon.spy()
    turnDuration = 1000 * 60 * 5
    yellowDuration = 1000 * 30

    controller = new TrafficLightIntersectionController({
      clock,
      intersection,
      onTrafficLightChange,
      turnDuration,
      yellowDuration
    })
  })

  afterEach(function () {
    clock.restore()
  })

  it('should automatically change the lights from green to red every five minutes', function () {
    controller.start()
    clock.tick(turnDuration)
    controller.stop()

    expect(onTrafficLightChange).to.be.calledTwice // Green -> Yellow -> Red
    expect(onTrafficLightChange).to.be.calledWith({
      [North]: Red,
      [East]: Green,
      [South]: Red,
      [West]: Green
    })
  })

  it('should not change traffic light colors one second before (turnDuration - yellowDuration)', function () {
    controller.start()
    clock.tick(turnDuration - yellowDuration - 1)
    controller.stop()

    expect(onTrafficLightChange).to.be.not.be.called
  })

  it('should change the lights from green to yellow and the other remain red at (turnDuration - yellowDuration)', function () {
    controller.start()
    clock.tick(turnDuration - yellowDuration)
    controller.stop()

    expect(onTrafficLightChange).to.be.calledOnce // Green -> Yellow
    expect(onTrafficLightChange).to.be.calledWith({
      [North]: Yellow,
      [East]: Red,
      [South]: Yellow,
      [West]: Red
    })
  })

  it('should display the red light for yellow duration prior to switching to red', function () {
    controller.start()

    clock.tick(turnDuration - yellowDuration)
    expect(onTrafficLightChange).to.be.calledWith({
      [North]: Yellow,
      [East]: Red,
      [South]: Yellow,
      [West]: Red
    })

    clock.tick(yellowDuration)
    expect(onTrafficLightChange).to.be.calledWith({
      [North]: Red,
      [East]: Green,
      [South]: Red,
      [West]: Green
    })

    controller.stop()

    expect(onTrafficLightChange).to.be.calledTwice

  })

  it('should not change state when the controller has stopped', function () {
    controller.start()
    controller.stop()
    clock.tick(1)

    expect(onTrafficLightChange).to.not.have.been.called
  })

  it('should output as expected for thirty minutes with default options', function () {
    controller.start()
    clock.tick(1000 * 60 * 30)
    controller.stop()

    const getOutput = (north, east, south, west) => {
      return {
        [North]: north,
        [East]: east,
        [South]: south,
        [West]: west
      }
    }

    const calls = onTrafficLightChange.getCalls()
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
