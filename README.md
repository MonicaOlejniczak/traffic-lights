## Installation

Install the dependencies with npm:

`$ npm install`

## Getting started

**To start the simulation:** `$ npm start`

**To run the test suite:** `$ npm test`

## Assumptions

- The North/South and East/West traffic lights have been grouped together. There are no turning lanes in this simulation. This means that when North/South are green, East/West must be red and when North/South are yellow, East/West are still red, and vice versa.
- Every traffic light alternates between red and green every five minutes.
- The yellow traffic light is on for thirty seconds, thirty seconds prior to to each five minute interval. e.g. At 4:30 a set of traffic lights will alternate from green to yellow. At 5:00 the yellow traffic light will transition from yellow to red, and the other set of lights will switch from red to green.
- Fake timers have been used to run the simulation immediately and synchronously, a real timer could be used instead.

## Notes

Although an initial solution was implemented within the recommended timeframe, I spent the extra time refactoring it into a solution that I was happy with.
