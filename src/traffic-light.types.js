/**
 * Traffic light intersection model.
 * 
 * @type {{North: string, East: string, South: string, West: string}}
 */
const TrafficLights = {
  North: 'North',
  East: 'East',
  South: 'South',
  West: 'West'
}

/**
 * Traffic light model.
 * 
 * @type {{Green: string, Yellow: string, Red: string}}
 */
const TrafficLightColor = {
  Green: 'Green',
  Yellow: 'Yellow',
  Red: 'Red'
}

module.exports = {
  TrafficLights,
  TrafficLightColor
}
