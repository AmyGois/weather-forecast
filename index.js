import weatherApp from "./weather-app.js";
import uiController from "./ui.js";

weatherApp.subscribe();
uiController.addListeners();
uiController.subscribe();
