/* ***********************************************************************
Contents:
	- Send form data to make new API request
  - Functions to update UI with new weather data
    -> Update night mode
    -> Update "current conditions" subsection
    -> Update UV Index, humidity & rain charts
    -> Update astronomy information
    -> Update daily & hourly forecasts
    -> Function to pick the right weather icon
  - Show error message for bad weather request
	- Toggle visibility of daily and hourly forecasts on click
	- Add all event listeners to page
*********************************************************************** */
import mediator from "./mediator.js";

const uiController = (() => {
  const errorSpan = document.querySelector("#search-error");

  /* - Send form data to make new API request */
  function makeWeatherRequest(e) {
    e.preventDefault();
    const chosenLocation = document.querySelector("#search-location").value;

    if (chosenLocation !== "") {
      const measurement = document.querySelector("#search-measurement").value;
      const data = {
        location: chosenLocation,
        isCelcius: "",
      };

      if (measurement === "celcius") {
        data.isCelcius = true;
      } else if (measurement === "farenheit") {
        data.isCelcius = false;
      }

      mediator.publish("New weather request", data);
    }
  }

  /* - Functions to update UI with new weather data */
  function updateUi(data) {
    const humidityChart = document.querySelector("#humidity-chart");
    const humidityText = document.querySelector("#humidity-chart-text");
    const rainChart = document.querySelector("#rain-chart");
    const rainText = document.querySelector("#rain-chart-text");

    if (!errorSpan.classList.contains("hidden")) {
      errorSpan.classList.add("hidden");
    }

    updateNightMode(data.currentConditions.isNight);

    updateCurrentSubsection(
      data.address.town,
      data.address.country,
      data.currentConditions.description,
      data.currentConditions.icon,
      data.currentConditions.temperature,
      data.isCelcius,
      data.currentConditions.conditions
    );

    updateUvIndexChart(
      data.currentConditions.uvIndex.level,
      data.currentConditions.uvIndex.risk
    );

    updateCircleChart(
      humidityChart,
      humidityText,
      data.currentConditions.humidity
    );

    updateCircleChart(rainChart, rainText, data.currentConditions.chanceOfRain);

    updateSunChart(
      data.currentConditions.sunrise.fullTime,
      data.currentConditions.sunAxis.fullTime,
      data.currentConditions.sunset.fullTime,
      data.currentConditions.sunPercentage,
      data.currentConditions.isNight
    );

    updateMoonChart(
      data.currentConditions.moonPhase.description,
      data.currentConditions.moonPhase.number
    );

    updateDaysCards(data.days, data.isCelcius);

    updateHoursCards(data.hours, data.isCelcius);
  }

  /* -> Update night mode */
  function updateNightMode(isNight) {
    const body = document.querySelector("body");

    if (isNight === true) {
      body.classList.add("night");
    } else {
      body.classList.remove("night");
    }
  }

  /* -> Update "current conditions" subsection */
  function updateCurrentSubsection(
    location,
    country,
    description,
    icon,
    temperature,
    isCelcius,
    conditions
  ) {
    const locationTitle = document.querySelector("#weather-location");
    const countryTitle = document.querySelector("#weather-country");
    const conditionsDescription = document.querySelector(
      "#weather-description"
    );
    const weatherIcon = document.querySelector("#weather-icon");
    const temperatureNum = document.querySelector("#weather-temp");
    const celciusOrFarenheit = document.querySelector(
      "#weather-temp-measurement"
    );
    const weatherConditions = document.querySelector("#weather-conditions");

    locationTitle.textContent = location;
    countryTitle.textContent = country;
    conditionsDescription.textContent = description;
    selectWeatherIcon(weatherIcon, icon);
    temperatureNum.textContent = temperature;
    if (isCelcius === true) {
      celciusOrFarenheit.textContent = "ºC";
    } else if (isCelcius === false) {
      celciusOrFarenheit.textContent = "ºF";
    }
    weatherConditions.textContent = conditions;
  }

  /* -> Update UV Index, humidity & rain charts */
  function updateUvIndexChart(uvNumber, uvRisk) {
    const uvIndexNum = document.querySelector(".uvindex-number");
    const uvIndexRisk = document.querySelector(".uvindex-level");
    const uvIndexChart = document.querySelector(".uvindex-chart-value");
    const chartLevel = uvNumber * 10;

    uvIndexNum.textContent = uvNumber;
    uvIndexRisk.textContent = uvRisk;
    uvIndexChart.style.height = `${chartLevel}%`;
    uvIndexChart.classList.add("animated");
    removeAnimation(uvIndexChart);
  }

  function updateCircleChart(chart, text, percentage) {
    text.textContent = `${percentage}%`;
    chart.style.strokeDasharray = `${percentage} 100`;
    chart.classList.add("animated");
    removeAnimation(chart);
  }

  /* -> Update astronomy information */
  function updateSunChart(sunrise, zenith, sunset, percentage, isNight) {
    const sunriseTime = document.querySelector("#sunchart-sunrise");
    const zenithTime = document.querySelector("#sunchart-zenith");
    const sunsetTime = document.querySelector("#sunchart-sunset");
    const sunIcon = document.querySelector("#sunchart-icon");
    const sunPercentage = percentage - 7;

    sunriseTime.textContent = sunrise;
    zenithTime.textContent = zenith;
    sunsetTime.textContent = sunset;
    sunIcon.classList.remove("hidden");

    if (isNight === false) {
      sunIcon.style.left = `${sunPercentage}%`;
      sunIcon.classList.add("animated");
      removeAnimation(sunIcon);
    } else {
      sunIcon.classList.add("hidden");
    }
  }

  function removeAnimation(element) {
    setTimeout(() => {
      element.classList.remove("animated");
    }, 1001);
  }

  function updateMoonChart(moonPhase, moonNumber) {
    const moonPhaseTitle = document.querySelector("#moon-phase");
    const moonPhaseIcon = document.querySelector("#moon-icon");

    moonPhaseTitle.textContent = moonPhase;
    if (moonNumber === 0) {
      moonPhaseIcon.src = "./images/moon-phase/new-moon.png";
    } else if ((moonNumber > 0) & (moonNumber < 0.25)) {
      moonPhaseIcon.src = "./images/moon-phase/waxing-crescent.png";
    } else if (moonNumber === 0.25) {
      moonPhaseIcon.src = "./images/moon-phase/first-quarter.png";
    } else if ((moonNumber > 0.25) & (moonNumber < 0.5)) {
      moonPhaseIcon.src = "./images/moon-phase/waxing-gibbous.png";
    } else if (moonNumber === 0.5) {
      moonPhaseIcon.src = "./images/moon-phase/full-moon.png";
    } else if ((moonNumber > 0.5) & (moonNumber < 0.75)) {
      moonPhaseIcon.src = "./images/moon-phase/waning-gibbous.png";
    } else if (moonNumber === 0.75) {
      moonPhaseIcon.src = "./images/moon-phase/third-quarter.png";
    } else if ((moonNumber > 0.75) & (moonNumber < 1)) {
      moonPhaseIcon.src = "./images/moon-phase/waning-crescent.png";
    } else {
      console.log("Something went wrong getting the moon icon!");
    }
  }

  /* -> Update daily & hourly forecasts */
  function updateDaysCards(days, isCelcius) {
    const daysSection = document.querySelector("#days-cards-reel");
    const dayCardTemplate = document.querySelector("#day-card-template");

    daysSection.innerHTML = "";
    for (let i = 0; i < days.length; i++) {
      const newDay = dayCardTemplate.content.cloneNode(true);
      const newWeekday = newDay.querySelector(".days-card-weekday");
      const newDate = newDay.querySelector(".days-card-date");
      const newIcon = newDay.querySelector(".days-card-icon");
      const newConditions = newDay.querySelector(".days-card-conditions");
      const newMaxTemp = newDay.querySelector(".days-card-maxtemp");
      const newMinTemp = newDay.querySelector(".days-card-mintemp");
      let celciusOrFarenheit;

      if (isCelcius === true) {
        celciusOrFarenheit = "ºC";
      } else if (isCelcius === false) {
        celciusOrFarenheit = "ºF";
      }

      if (i === 0) {
        newWeekday.textContent = "Today";
      } else {
        newWeekday.textContent = days[i].weekday;
      }
      newDate.textContent = `${days[i].date.day} - ${days[i].date.month} - ${days[i].date.year}`;
      selectWeatherIcon(newIcon, days[i].icon);
      newConditions.textContent = days[i].conditions;
      newMaxTemp.textContent = `${days[i].maxTemperature} ${celciusOrFarenheit}`;
      newMinTemp.textContent = `${days[i].minTemperature} ${celciusOrFarenheit}`;

      daysSection.appendChild(newDay);
    }
  }

  function updateHoursCards(hours, isCelcius) {
    const hoursSection = document.querySelector("#hours-cards-reel");
    const hourCardTemplate = document.querySelector("#hour-card-template");

    hoursSection.innerHTML = "";
    for (let i = 0; i < hours.length; i++) {
      const newHour = hourCardTemplate.content.cloneNode(true);
      const newTime = newHour.querySelector(".hours-card-time");
      const newIcon = newHour.querySelector(".hours-card-icon");
      const newConditions = newHour.querySelector(".hours-card-conditions");
      const newTemp = newHour.querySelector(".hours-card-temp");

      if (i === 0) {
        newTime.textContent = `Now (${hours[i].time.hour}:${hours[i].time.minutes})`;
      } else {
        newTime.textContent = `${hours[i].time.hour}:${hours[i].time.minutes}`;
      }
      selectWeatherIcon(newIcon, hours[i].icon);
      newConditions.textContent = hours[i].conditions;

      if (isCelcius === true) {
        newTemp.textContent = `${hours[i].temperature} ºC`;
      } else if (isCelcius === false) {
        newTemp.textContent = `${hours[i].temperature} ºF`;
      }

      if (hours[i].isNight === true) {
        newHour.firstElementChild.classList.remove("hours-card-day");
        newHour.firstElementChild.classList.add("hours-card-night");
      } else {
        newHour.firstElementChild.classList.remove("hours-card-night");
        newHour.firstElementChild.classList.add("hours-card-day");
      }

      hoursSection.appendChild(newHour);
    }
  }

  /* -> Function to pick the right weather icon */
  function selectWeatherIcon(imageToChange, iconName) {
    switch (iconName) {
      case "clear-day":
        imageToChange.src = "./images/weather-icons/clear-day.png";
        imageToChange.alt = "clear day";
        break;
      case "clear-night":
        imageToChange.src = "./images/weather-icons/clear-night.png";
        imageToChange.alt = "clear night";
        break;
      case "cloudy":
        imageToChange.src = "./images/weather-icons/cloudy.png";
        imageToChange.alt = "cloudy";
        break;
      case "fog":
        imageToChange.src = "./images/weather-icons/fog.png";
        imageToChange.alt = "fog";
        break;
      case "hail":
        imageToChange.src = "./images/weather-icons/hail.png";
        imageToChange.alt = "hail";
        break;
      case "partly-cloudy-day":
        imageToChange.src = "./images/weather-icons/partly-cloudy-day.png";
        imageToChange.alt = "partly cloudy day";
        break;
      case "partly-cloudy-night":
        imageToChange.src = "./images/weather-icons/partly-cloudy-night.png";
        imageToChange.alt = "partly cloudy night";
        break;
      case "rain-snow-showers-day":
        imageToChange.src = "./images/weather-icons/rain-snow-showers-day.png";
        imageToChange.alt = " rain snow showers day";
        break;
      case "rain-snow-showers-night":
        imageToChange.src =
          "./images/weather-icons/rain-snow-showers-night.png";
        imageToChange.alt = " rain snow showers night";
        break;
      case "rain-snow":
        imageToChange.src = "./images/weather-icons/rain-snow.png";
        imageToChange.alt = " rain snow";
        break;
      case "rain":
        imageToChange.src = "./images/weather-icons/rain.png";
        imageToChange.alt = "rain";
        break;
      case "showers-day":
        imageToChange.src = "./images/weather-icons/showers-day.png";
        imageToChange.alt = " showers day";
        break;
      case "showers-night":
        imageToChange.src = "./images/weather-icons/showers-night.png";
        imageToChange.alt = "showers night";
        break;
      case "sleet":
        imageToChange.src = "./images/weather-icons/sleet.png";
        imageToChange.alt = "sleet";
        break;
      case "snow-showers-day":
        imageToChange.src = "./images/weather-icons/snow-showers-day.png";
        imageToChange.alt = "snow showers day";
        break;
      case "snow-showers-night":
        imageToChange.src = "./images/weather-icons/snow-showers-night.png";
        imageToChange.alt = "snow showers night";
        break;
      case "snow":
        imageToChange.src = "./images/weather-icons/snow.png";
        imageToChange.alt = "snow";
        break;
      case "thunder-rain":
        imageToChange.src = "./images/weather-icons/thunder-rain.png";
        imageToChange.alt = "thunder rain";
        break;
      case "thunder-showers-day":
        imageToChange.src = "./images/weather-icons/thunder-showers-day.png";
        imageToChange.alt = "thunder showers day";
        break;
      case "thunder-showers-night":
        imageToChange.src = "./images/weather-icons/thunder-showers-night.png";
        imageToChange.alt = "thunder showers night";
        break;
      case "thunder":
        imageToChange.src = "./images/weather-icons/thunder.png";
        imageToChange.alt = "thunder";
        break;
      case "wind":
        imageToChange.src = "./images/weather-icons/wind.png";
        imageToChange.alt = "wind";
        break;
      default:
        imageToChange.src = "./images/weather-icons/clear-day.png";
        imageToChange.alt = "";
    }
  }

  /* - Show error message for bad weather request */
  function showErrorMsg(error) {
    errorSpan.classList.remove("hidden");
    console.log(error);
  }

  /* - Toggle visibility of daily and hourly forecasts on click */
  function toggleForecasts(currentForecast, otherForecast) {
    if (!currentForecast.classList.contains("forecast-button-active")) {
      const dailySubsection = document.querySelector(".days-subsection");
      const hourlySubsection = document.querySelector(".hours-subsection");

      currentForecast.classList.toggle("forecast-button-active");
      otherForecast.classList.toggle("forecast-button-active"),
        dailySubsection.classList.toggle("hidden");
      hourlySubsection.classList.toggle("hidden");
    }
  }

  /* - Add all event listeners to page */
  function addListeners() {
    const searchBtn = document.querySelector("#search-btn");
    searchBtn.addEventListener("click", (e) => makeWeatherRequest(e));

    const dailyForecastBtn = document.querySelector("#daily-forecast-btn");
    const hourlyForecastBtn = document.querySelector("#hourly-forecast-btn");
    dailyForecastBtn.addEventListener("click", () =>
      toggleForecasts(dailyForecastBtn, hourlyForecastBtn)
    );
    hourlyForecastBtn.addEventListener("click", () =>
      toggleForecasts(hourlyForecastBtn, dailyForecastBtn)
    );
  }

  function subscribe() {
    mediator.subscribe("New organised weather data", updateUi);
    mediator.subscribe("Request error", showErrorMsg);
  }

  return { addListeners, subscribe };
})();

export default uiController;
