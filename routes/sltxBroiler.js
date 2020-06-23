const express = require("express");
const config = require("../config");

const sltxBroilerCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxBroiler") : require("./hcp/controllers/sltxBroiler");

const api_sltxBroiler = express.Router();

api_sltxBroiler.post("/findBroilerByDateRange", sltxBroilerCtrl.findBroilerByDateRange);
api_sltxBroiler.post("/findBroilerDailyLot", sltxBroilerCtrl.findBroilerDailyLot);


module.exports = api_sltxBroiler;