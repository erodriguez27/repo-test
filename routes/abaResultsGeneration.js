const express = require("express");
const config = require("../config");

const abaResultsGenerationCtrl = require("../postgresql/controllers/abaResultsGeneration");

const apiAbaResultsGeneration = express.Router();

apiAbaResultsGeneration.post("/", abaResultsGenerationCtrl.generateResults);


module.exports = apiAbaResultsGeneration;
