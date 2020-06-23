const express = require("express");
const config = require("../config");

const shedStatusCtrl = config.driver === "postgres" ? require("../postgresql/controllers/shedStatus") : require("./hcp/controllers/Calendar");

const api_shedStatus = express.Router();

api_shedStatus.get("/", shedStatusCtrl.findAllShedStatus);

module.exports = api_shedStatus;
