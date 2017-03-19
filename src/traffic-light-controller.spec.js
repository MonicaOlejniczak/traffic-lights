const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

const { expect } = chai
chai.use(sinonChai)

const { TrafficLights, TrafficLightColor } = require('./traffic-light.models')
const TrafficLightIntersection = require('./traffic-light')
const TrafficLightIntersectionController = require('./traffic-light-controller')

const { Green, Yellow, Red } = TrafficLightColor;

describe('traffic lights', function() {

  function createIntersectionController(callback) {
    const intersection = new TrafficLightIntersection({
      [TrafficLights.North]: TrafficLightColor.Green,
      [TrafficLights.East]: TrafficLightColor.Red,
      [TrafficLights.South]: TrafficLightColor.Green,
      [TrafficLights.West]: TrafficLightColor.Red
    })

    const config = {
      clock: sinon.useFakeTimers(),
      turnDuration: 1000 * 60 * 5,
      yellowDuration: 1000 * 30,
      callback
    }

    const controller = new TrafficLightIntersectionController(intersection, config)

    return { config, controller }
  }

  // it('should start with north and south as green and east and west as red', function () {
  //   const { intersection } = createIntersection();
  //   expectTrafficColors(intersection, Green, Red, Green, Red);
  // })

  it('should automatically change the lights from green to red every five minutes', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()
    config.clock.tick(config.turnDuration)
    controller.stop()

    expect(spy).to.be.calledTwice // Green -> Yellow -> Red
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Red,
      [TrafficLights.East]: Green,
      [TrafficLights.South]: Red,
      [TrafficLights.West]: Green
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
      [TrafficLights.North]: Yellow,
      [TrafficLights.East]: Red,
      [TrafficLights.South]: Yellow,
      [TrafficLights.West]: Red
    })
  })

  it('should display the red light for yellow duration prior to switching to red', function () {
    const spy = sinon.spy()
    const { config, controller } = createIntersectionController(spy)

    controller.start()

    config.clock.tick(config.turnDuration - config.yellowDuration)
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Yellow,
      [TrafficLights.East]: Red,
      [TrafficLights.South]: Yellow,
      [TrafficLights.West]: Red
    })

    config.clock.tick(config.yellowDuration)
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Red,
      [TrafficLights.East]: Green,
      [TrafficLights.South]: Red,
      [TrafficLights.West]: Green
    })

    controller.stop()

    expect(spy).to.be.calledTwice

  })

});
