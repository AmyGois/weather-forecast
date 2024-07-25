import mediator from "./mediator.js";

const weatherApp = (() => {
  const cleanedWeatherData = {
    address: {
      town: "",
      country: "",
    },
    isCelsius: "",
    currentConditions: {
      description: "",
      temperature: "",
      conditions: "",
      icon: "",
      time: "",
      uvIndex: "",
      humidity: "",
      chanceOfRain: "",
      sunrise: "",
      sunset: "",
      sunAxis: "",
      sunPercentage: "",
      moonPhase: "",
    },
    days: [],
    hours: [],
  };

  function getWeather(chosenLocation, isCelsius) {
    const urlStart =
      "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
    const location = chosenLocation.toString();
    const celsiusCode = "?unitGroup=metric";
    const farenheitCode = "?unitGroup=us";
    const urlEnd = "&key=UPUV9ETN2YGMY5JFBF53V82E7&contentType=json";
    let fullUrl;
    let weatherData;

    if (isCelsius) {
      fullUrl = `${urlStart}${location}${celsiusCode}${urlEnd}`;
    } else {
      fullUrl = `${urlStart}${location}${farenheitCode}${urlEnd}`;
    }

    fetch(fullUrl, { mode: "cors" })
      .then((response) => response.json())
      .then((response) => {
        weatherData = response;
        weatherData.isCelsius = isCelsius;
        console.log("Raw weather data:");
        console.log(weatherData); /* Temporary */
        mediator.publish("New raw weather data", weatherData);
      })
      .catch((error) => console.log("Error: " + error));
  }

  function sortWeatherData(data) {
    sortAddress(data.resolvedAddress);
    sortCurrentConditions(data.currentConditions);
    cleanedWeatherData.currentConditions.description = data.description;
    cleanedWeatherData.isCelsius = data.isCelsius;
    sortDays(data.days);
    sortHours(data.currentConditions, data.days);

    console.log(cleanedWeatherData);
  }

  function sortAddress(rawAddress) {
    const orderedAddress = rawAddress.split(", ");
    cleanedWeatherData.address.town = orderedAddress[0];
    cleanedWeatherData.address.country =
      orderedAddress[orderedAddress.length - 1];
  }

  function sortCurrentConditions(currentConditions) {
    cleanedWeatherData.currentConditions.temperature = currentConditions.temp;
    cleanedWeatherData.currentConditions.conditions =
      currentConditions.conditions;
    cleanedWeatherData.currentConditions.icon = currentConditions.icon;
    cleanedWeatherData.currentConditions.time = currentConditions.datetime;
    cleanedWeatherData.currentConditions.uvIndex = currentConditions.uvindex;
    cleanedWeatherData.currentConditions.humidity = currentConditions.humidity;
    cleanedWeatherData.currentConditions.chanceOfRain =
      currentConditions.precipprob;
    cleanedWeatherData.currentConditions.sunrise = currentConditions.sunrise;
    cleanedWeatherData.currentConditions.sunset = currentConditions.sunset;
    cleanedWeatherData.currentConditions.moonPhase =
      currentConditions.moonphase;

    cleanedWeatherData.currentConditions.sunAxis = calcSunAxis(
      currentConditions.sunrise,
      currentConditions.sunset
    );
    cleanedWeatherData.currentConditions.sunPercentage = calcSunPercentage(
      currentConditions.sunrise,
      currentConditions.sunset,
      currentConditions.datetime
    );
  }

  function calcSunAxis(sunrise, sunset) {
    const sunriseSecs = timeInSeconds(sunrise);
    const sunsetSecs = timeInSeconds(sunset);
    const axisFullTimeSecs = Math.round(
      sunriseSecs + (sunsetSecs - sunriseSecs) / 2
    );
    const axisSeconds = axisFullTimeSecs % 60;
    const axisMinutes = ((axisFullTimeSecs - axisSeconds) / 60) % 60;
    const axisHours = Math.floor(axisFullTimeSecs / 60 / 60);
    const axisTime = `${axisHours}:${axisMinutes}:${axisSeconds}`;
    return axisTime;
  }

  function calcSunPercentage(sunrise, sunset, time) {
    const sunriseSecs = timeInSeconds(sunrise);
    const sunsetSecs = timeInSeconds(sunset);
    const timeSecs = timeInSeconds(time);
    if ((timeSecs >= sunriseSecs) & (timeSecs <= sunsetSecs)) {
      const percentage =
        ((timeSecs - sunriseSecs) * 100) / (sunsetSecs - sunriseSecs);
      const rounded = percentage.toFixed(2);
      return rounded;
    } else {
      return "night";
    }
  }

  function timeInSeconds(time) {
    const timeArray = time.split(":");
    const hoursInSeconds = Number(timeArray[0]) * 60 * 60;
    const minutesInSeconds = Number(timeArray[1]) * 60;
    const fullTime = hoursInSeconds + minutesInSeconds + Number(timeArray[2]);
    return fullTime;
  }

  function sortDays(daysData) {
    daysData.forEach((newDay) => {
      const day = {};
      day.date = newDay.datetime;
      day.conditions = newDay.conditions;
      day.icon = newDay.icon;
      day.maxTemperature = newDay.tempmax;
      day.minTemperature = newDay.tempmin;
      day.weekday = getWeekDay(newDay.datetime);
      cleanedWeatherData.days.push(day);
    });
  }

  function getWeekDay(date) {
    const fullDate = new Date(date);
    const dayNumber = fullDate.getDay();
    switch (dayNumber) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        console.log("Something went wrong!");
    }
  }

  function sortHours(currentConditions, days) {
    const currentTimestamp = currentConditions.datetimeEpoch;
    sortHourInfo(
      currentConditions.datetime,
      currentConditions.conditions,
      currentConditions.temp,
      currentConditions.icon,
      currentConditions.datetimeEpoch,
      currentConditions.sunriseEpoch,
      currentConditions.sunsetEpoch
    );
    getHours(
      days[0].hours,
      currentTimestamp,
      days[0].sunriseEpoch,
      days[0].sunsetEpoch
    );
    getHours(
      days[1].hours,
      currentTimestamp,
      days[1].sunriseEpoch,
      days[1].sunsetEpoch
    );
    getHours(
      days[2].hours,
      currentTimestamp,
      days[2].sunriseEpoch,
      days[2].sunsetEpoch
    );
  }

  function getHours(rawHours, currentTimestamp, sunrise, sunset) {
    for (let i = 0; i < rawHours.length; i++) {
      if (cleanedWeatherData.hours.length === 49) {
        break;
      } else if (rawHours[i].datetimeEpoch < currentTimestamp) {
        continue;
      } else {
        sortHourInfo(
          rawHours[i].datetime,
          rawHours[i].conditions,
          rawHours[i].temp,
          rawHours[i].icon,
          rawHours[i].datetimeEpoch,
          sunrise,
          sunset
        );
      }
    }
  }

  function sortHourInfo(
    time,
    conditions,
    temperature,
    icon,
    hourTimestamp,
    sunriseTimestamp,
    sunsetTimestamp
  ) {
    const hour = {};
    hour.time = time;
    hour.conditions = conditions;
    hour.temperature = temperature;
    hour.icon = icon;
    if (
      (hourTimestamp >= sunriseTimestamp) &
      (hourTimestamp <= sunsetTimestamp)
    ) {
      hour.isNight = false;
    } else {
      hour.isNight = true;
    }
    cleanedWeatherData.hours.push(hour);
  }

  function subscribe() {
    mediator.subscribe("New raw weather data", sortWeatherData);
  }

  return { getWeather, subscribe };
})();

weatherApp.subscribe();
weatherApp.getWeather("Porto", true);
