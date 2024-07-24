import mediator from "./mediator.js";

const getWeather = (chosenLocation, isCelsius) => {
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
      console.log(weatherData); /* Temporary */
      mediator.publish("New raw weather data", weatherData);
    })
    .catch((error) => console.log("Error: " + error));
};
