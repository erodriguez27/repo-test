const express = require("express");
const config = require("../config");

const abaTimeUnitPropertiesCtrl = require("../postgresql/controllers/abaTimeUnit");

const apiAbaTimeUnit = express.Router();

apiAbaTimeUnit.get("/", abaTimeUnitPropertiesCtrl.findAll);

module.exports = apiAbaTimeUnit;
