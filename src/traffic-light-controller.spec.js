const expect = require('chai').expect
const sinon = require('sinon');

const { TrafficLights, TrafficLightColor, TrafficLightIntersection } = require('./traffic-lights')

const { Green, Yellow, Red } = TrafficLightColor;

describe('traffic lights', function() {

  function expectTrafficColors(intersection, north, east, south, west) {
    expect(intersection.getTrafficLightColors()).to.deep.equal({
      [TrafficLights.North]: north,
      [TrafficLights.East]: east,
      [TrafficLights.South]: south,
      [TrafficLights.West]: west
    })
  }

  function createIntersection(callback) {
    const config = {
      turnDuration: 1000 * 60 * 5,
      yellowDuration: 1000 * 30,
      callback
    }
    return { config, intersection: TrafficLightIntersection.of(config) }
  }

  it('should start with north and south as green and east and west as red', function () {
    const { intersection } = createIntersection();
    expectTrafficColors(intersection, Green, Red, Green, Red);
  })

  it('should automatically change the lights from green to red every five minutes', function () {
    const spy = sinon.spy()
    const { config, intersection } = createIntersection(spy)
    intersection.tick(config.turnDuration)

    expect(spy).to.be.calledTwice() // Green -> Yellow -> Red
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Red,
      [TrafficLights.East]: Green,
      [TrafficLights.South]: Red,
      [TrafficLights.West]: Green
    })
  })

  it('should not change traffic light colors one second before (turnDuration - yellowDuration)', function () {
    const spy = sinon.spy()
    const { config, intersection } = createIntersection(spy)
    intersection.tick(config.turnDuration - config.yellowDuration - 1)

    expect(spy).to.be.not.be.called()
  })

  it('should change the lights from green to yellow and the other remain red at (turnDuration - yellowDuration)', function () {
    const spy = sinon.spy()
    const { config, intersection } = createIntersection(spy)
    intersection.tick(config.turnDuration - config.yellowDuration)

    expect(spy).to.be.calledOnce() // Green -> Yellow
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Yellow,
      [TrafficLights.East]: Red,
      [TrafficLights.South]: Yellow,
      [TrafficLights.West]: Red
    })
  })

  it('should display the red light for yellow duration prior to switching to red', function () {
    const spy = sinon.spy()
    const { config, intersection } = createIntersection()
    
    intersection.tick(config.turnDuration - config.yellowDuration)
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Yellow,
      [TrafficLights.East]: Red,
      [TrafficLights.South]: Yellow,
      [TrafficLights.West]: Red
    })

    intersection.tick(config.yellowDuration)
    expect(spy).to.be.calledWith({
      [TrafficLights.North]: Red,
      [TrafficLights.East]: Green,
      [TrafficLights.South]: Red,
      [TrafficLights.West]: Green
    })
    
    expect(spy).to.be.calledTwice()
  })

  it('should run for thirty minutes', function () {

  })

});
