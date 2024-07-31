/* **************************************************
Events published
- weather-app.js:
  - "New raw weather data" - all data from latest API request, unfiltered
  - "New organised weather data" - weather data, filtered & organised
************************************************** */

const mediator = (() => {
  const events = {};

  const subscribe = function (eventName, functionToSetOff) {
    events[eventName] = events[eventName] || [];
    events[eventName].push(functionToSetOff);
  };

  const unsubscribe = function (eventName, functionToDelete) {
    if (events[eventName]) {
      for (let i = 0; i < events[eventName].length; i++) {
        if (events[eventName][i] === functionToDelete) {
          events[eventName].splice(i, 1);
          break;
        }
      }
    }
  };

  const publish = function (eventName, data) {
    if (events[eventName]) {
      events[eventName].forEach((functionToRun) => {
        functionToRun(data);
      });
    }
  };

  return { subscribe, unsubscribe, publish };
})();

export default mediator;
