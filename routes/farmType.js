const express = require("express");
const config = require("../config");

const farmTypeCtrl = config.driver === "postgres" ? require("../postgresql/controllers/farmType") : require("./hcp/controllers/farmType");

const api_farmType = express.Router();

api_farmType.get("/", farmTypeCtrl.findAllFarmType);

module.exports = api_farmType;
