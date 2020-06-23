const express = require("express");
const config = require("../config");

const scenarioPostureCurveCTRL = config.driver === "postgres" ? require("../postgresql/controllers/scenarioPostureCurve") : require("./hcp/controllers/scenarioProcess");

const api_scenario_posture_curve = express.Router();


api_scenario_posture_curve.post("/findLotByScenario", scenarioPostureCurveCTRL.findLotByScenario);
//api_scenario_posture_curve.put('/updateScenarioProcesses', scenarioPostureCurveCTRL.updateScenarioProcesses);


module.exports = api_scenario_posture_curve;
