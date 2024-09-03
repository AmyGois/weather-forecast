/* ***********************************************************************
Contents:
  - Object for final organised weather data
  - Get weather info from Visual Crossing API
  - Set off all functions to filter & organise weather info
  - Filter & organise "current conditions" section of weather data
  - Filter & organise "days" section of weather data
  - Filter & organise "hours" section of weather data
  - Subscribe to all relevant events to trigger weatherApp functions
*********************************************************************** */
import mediator from "./mediator.js";

const weatherApp = (() => {
  /* - Object for final organised weather data */
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
      isNight: "",
    },
    days: [],
    hours: [],
  };

  /* - Get weather info from Visual Crossing API */
  function getWeather(data) {
    const urlStart =
      "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/";
    const location = data.location.toString();
    const celciusOrFarenheit = data.isCelcius;
    const celsiusCode = "?unitGroup=metric";
    const farenheitCode = "?unitGroup=us";
    const urlEnd = "&key=UPUV9ETN2YGMY5JFBF53V82E7&contentType=json";
    let fullUrl;
    let weatherData;

    if (celciusOrFarenheit) {
      fullUrl = `${urlStart}${location}${celsiusCode}${urlEnd}`;
    } else {
      fullUrl = `${urlStart}${location}${farenheitCode}${urlEnd}`;
    }

    fetch(fullUrl, { mode: "cors" })
      .then((response) => response.json())
      .then((response) => {
        weatherData = response;
        weatherData.isCelsius = celciusOrFarenheit;
        console.log("Raw weather data:"); /* Temporary */
        console.log(weatherData); /* Temporary */
        mediator.publish("New raw weather data", weatherData);
      })
      .catch((error) => {
        mediator.publish("Request error", error);
      });
  }

  /* - Set off all functions to filter & organise weather info */
  function sortWeatherData(data) {
    sortAddress(data.resolvedAddress);
    sortCurrentConditions(data.currentConditions);
    cleanedWeatherData.currentConditions.description = data.description;
    cleanedWeatherData.isCelsius = data.isCelsius;
    sortDays(data.days);
    sortHours(data.currentConditions, data.days);

    console.log(cleanedWeatherData); /* Temporary */
    mediator.publish("New organised weather data", cleanedWeatherData);
  }

  function sortAddress(rawAddress) {
    const orderedAddress = rawAddress.split(", ");
    cleanedWeatherData.address.town = orderedAddress[0];
    cleanedWeatherData.address.country =
      orderedAddress[orderedAddress.length - 1];
  }

  /* - Filter & organise "current conditions" section of weather data */
  function sortCurrentConditions(currentConditions) {
    cleanedWeatherData.currentConditions.temperature = currentConditions.temp;
    cleanedWeatherData.currentConditions.conditions =
      currentConditions.conditions;
    cleanedWeatherData.currentConditions.icon = currentConditions.icon;
    cleanedWeatherData.currentConditions.time = sortTimeInfo(
      currentConditions.datetime
    );
    cleanedWeatherData.currentConditions.uvIndex = sortUvIndexInfo(
      currentConditions.uvindex
    );
    cleanedWeatherData.currentConditions.humidity = currentConditions.humidity;
    cleanedWeatherData.currentConditions.chanceOfRain =
      currentConditions.precipprob;
    cleanedWeatherData.currentConditions.sunrise = sortTimeInfo(
      currentConditions.sunrise
    );
    cleanedWeatherData.currentConditions.sunset = sortTimeInfo(
      currentConditions.sunset
    );
    cleanedWeatherData.currentConditions.moonPhase = sortMoonPhaseInfo(
      currentConditions.moonphase
    );
    cleanedWeatherData.currentConditions.sunAxis = sortTimeInfo(
      calcSunAxis(currentConditions.sunrise, currentConditions.sunset)
    );
    cleanedWeatherData.currentConditions.sunPercentage = calcSunPercentage(
      currentConditions.sunrise,
      currentConditions.sunset,
      currentConditions.datetime
    );
    cleanedWeatherData.currentConditions.isNight = answerIsNight(
      currentConditions.datetimeEpoch,
      currentConditions.sunriseEpoch,
      currentConditions.sunsetEpoch
    );
  }

  function sortUvIndexInfo(uvIndexInfo) {
    const sortedUvIndexInfo = {};
    sortedUvIndexInfo.level = uvIndexInfo;
    if (uvIndexInfo <= 2) {
      sortedUvIndexInfo.risk = "low";
    } else if ((uvIndexInfo >= 3) & (uvIndexInfo <= 5)) {
      sortedUvIndexInfo.risk = "moderate";
    } else if ((uvIndexInfo >= 6) & (uvIndexInfo <= 7)) {
      sortedUvIndexInfo.risk = "high";
    } else if ((uvIndexInfo >= 8) & (uvIndexInfo <= 10)) {
      sortedUvIndexInfo.risk = "very high";
    } else if (uvIndexInfo >= 11) {
      sortedUvIndexInfo.risk = "extreme";
    } else {
      console.log("Something went wrong!");
    }
    return sortedUvIndexInfo;
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
      const rounded = Number(percentage.toFixed(2));
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

  function sortMoonPhaseInfo(moonphase) {
    const moonPhaseInfo = {};
    moonPhaseInfo.number = moonphase;
    if (moonphase === 0) {
      moonPhaseInfo.description = "new moon";
    } else if ((moonphase > 0) & (moonphase < 0.25)) {
      moonPhaseInfo.description = "waxing crescent";
    } else if (moonphase === 0.25) {
      moonPhaseInfo.description = "first quarter";
    } else if ((moonphase > 0.25) & (moonphase < 0.5)) {
      moonPhaseInfo.description = "waxing gibbous";
    } else if (moonphase === 0.5) {
      moonPhaseInfo.description = "full moon";
    } else if ((moonphase > 0.5) & (moonphase < 0.75)) {
      moonPhaseInfo.description = "waning gibbous";
    } else if (moonphase === 0.75) {
      moonPhaseInfo.description = "third quater";
    } else if ((moonphase > 0.75) & (moonphase < 1)) {
      moonPhaseInfo.description = "waning crescent";
    } else {
      console.log("Something went wrong!");
    }
    return moonPhaseInfo;
  }

  /* - Filter & organise "days" section of weather data */
  function sortDays(daysData) {
    daysData.forEach((newDay) => {
      const day = {};
      day.date = sortDateInfo(newDay.datetime);
      day.conditions = newDay.conditions;
      day.icon = newDay.icon;
      day.maxTemperature = newDay.tempmax;
      day.minTemperature = newDay.tempmin;
      day.weekday = getWeekDay(newDay.datetime);
      cleanedWeatherData.days.push(day);
    });
  }

  function sortDateInfo(rawDate) {
    const sortedDate = {};
    const dateArray = rawDate.split("-");
    sortedDate.day = Number(dateArray[2]);
    sortedDate.month = Number(dateArray[1]);
    sortedDate.year = Number(dateArray[0]);
    return sortedDate;
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

  /* - Filter & organise "hours" section of weather data */
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
    hour.time = sortTimeInfo(time);
    hour.conditions = conditions;
    hour.temperature = temperature;
    hour.icon = icon;
    hour.isNight = answerIsNight(
      hourTimestamp,
      sunriseTimestamp,
      sunsetTimestamp
    );
    cleanedWeatherData.hours.push(hour);
  }

  function sortTimeInfo(rawTime) {
    const sortedTime = {};
    const timeArray = rawTime.split(":");
    sortedTime.fullTime = rawTime;
    sortedTime.hour = Number(timeArray[0]);
    sortedTime.minutes = Number(timeArray[1]);
    sortedTime.seconds = Number(timeArray[2]);
    return sortedTime;
  }

  function answerIsNight(hourTimestamp, sunriseTimestamp, sunsetTimestamp) {
    if (
      (hourTimestamp >= sunriseTimestamp) &
      (hourTimestamp <= sunsetTimestamp)
    ) {
      return false;
    } else {
      return true;
    }
  }

  /* - Subscribe to all relevant events to trigger weatherApp functions */
  function subscribe() {
    mediator.subscribe("New weather request", getWeather);
    mediator.subscribe("New raw weather data", sortWeatherData);
  }

  return { getWeather, subscribe };
})();

/* weatherApp.subscribe(); */

/* const data = {
  location: "Marco de Canaveses",
  isCelcius: true,
};

weatherApp.getWeather(data); */

export default weatherApp;
