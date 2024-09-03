/* ***********************************************************************
Contents:
	- Send form data to make new API request
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

  function updateUi(data) {
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
  }

  function updateNightMode(isNight) {
    const body = document.querySelector("body");

    if (isNight === true) {
      body.classList.add("night");
    } else {
      body.classList.remove("night");
    }
  }

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
