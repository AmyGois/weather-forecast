import weatherApp from "./weather-app.js";
import uiController from "./ui.js";

uiController.addListeners();
uiController.subscribe();
weatherApp.subscribe();
weatherApp.init();
