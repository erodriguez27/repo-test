const express = require("express");
const config = require("../config");

const scenarioProcssCTRL = config.driver === "postgres" ? require("../postgresql/controllers/scenarioProcess") : require("./hcp/controllers/scenarioProcess");

const api_scenario_process = express.Router();


api_scenario_process.post("/getScenariosProcess", scenarioProcssCTRL.getScenariosProcess);
api_scenario_process.put("/updateScenarioProcesses", scenarioProcssCTRL.updateScenarioProcesses);


module.exports = api_scenario_process;
