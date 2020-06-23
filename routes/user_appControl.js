const express = require("express");
const config = require("../config");

const userappControlCtrl = config.driver === "postgres" ? require("../postgresql/controllers/user_appControl") : require("./hcp/controllers/user_appControl");

const api_userapps = express.Router();

api_userapps.post("/", userappControlCtrl.findUserApps);
//api_userapps.post('/', userappControlCtrl.addUserApp);
api_userapps.delete("/", userappControlCtrl.deleteUserApp);


module.exports = api_userapps;
