const express = require("express");
const config = require("../config");

const broilerCtrl = config.driver === "postgres" ? require("../postgresql/controllers/broiler") : require("./hcp/controllers/broiler");

const api_broiler = express.Router();

api_broiler.post("/findprojectedbroiler", broilerCtrl.findprojectedbroiler);
api_broiler.post("/findBroilerLot", broilerCtrl.findBroilerLot);

module.exports = api_broiler;
