/* ***********************************************************************
Contents:
	- Send form data to make new API request
	- Toggle visibility of daily and hourly forecasts on click
	- Add all event listeners to page
*********************************************************************** */
import mediator from "./mediator.js";

const uiController = (() => {
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

  function showErrorMsg(error) {
    const errorSpan = document.querySelector("#search-error");
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
    mediator.subscribe("Request error", showErrorMsg);
  }

  return { addListeners, subscribe };
})();

export default uiController;
