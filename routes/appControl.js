const express = require("express");
const config = require("../config");

const appControlCtrl = config.driver === "postgres" ? require("../postgresql/controllers/appControl") : require("./hcp/controllers/appControl");

const api_apps = express.Router();

api_apps.post("/", appControlCtrl.findApp);
//api_apps.post('/', appControlCtrl.addApp);
api_apps.put("/", appControlCtrl.updateApp);
api_apps.delete("/", appControlCtrl.deleteApp);


module.exports = api_apps;
