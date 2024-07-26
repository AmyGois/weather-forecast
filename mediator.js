/* **************************************************
Events published
- weather-app.js:
  - "New raw weather data" - all data from latest API request, unfiltered
  - "New organised weather data" - weather data, filtered & organised
************************************************** */

const mediator = {
  events: {},

  subscribe: function (eventName, functionToSetOff) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(functionToSetOff);
  },

  unsubscribe: function (eventName, functionToDelete) {
    if (this.events[eventName]) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if (this.events[eventName][i] === functionToDelete) {
          this.events[eventName].splice(i, 1);
          break;
        }
      }
    }
  },

  publish: function (eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((functionToRun) => {
        functionToRun(data);
      });
    }
  },
};

export default mediator;
