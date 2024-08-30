import mediator from "./mediator.js";

const uiController = (() => {
  function makeWeatherRequest(e) {
    e.preventDefault();
    const measurement = document.querySelector("#search-measurement").value;
    const data = {
      location: document.querySelector("#search-location").value,
      isCelcius: "",
    };

    if (measurement === "celcius") {
      data.isCelcius = true;
    } else if (measurement === "farenheit") {
      data.isCelcius = false;
    }

    mediator.publish("New weather request", data);
  }

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

  function subscribe() {}

  return { addListeners, subscribe };
})();

export default uiController;
