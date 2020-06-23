const express = require("express");
const config = require("../config");

const availabilityShedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/availabilityShed") : require("./hcp/controllers/Calendar");

const api_availabilityShed = express.Router();

api_availabilityShed.post("/findDateRange", availabilityShedCtrl.findDateRange);
api_availabilityShed.post("/", availabilityShedCtrl.addAvailabilityShed);

module.exports = api_availabilityShed;
