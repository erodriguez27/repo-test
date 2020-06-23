const express = require("express");
const config = require("../config");

const scenarioCtrl = config.driver === "postgres" ? require("../postgresql/controllers/Scenario") : require("./hcp/controllers/Scenario");

const api_scenario = express.Router();


api_scenario.post("/addScenario", scenarioCtrl.addScenario);
api_scenario.post("/validate", scenarioCtrl.validateScenario);
api_scenario.get("/findAllScenario", scenarioCtrl.findAllScenario);
api_scenario.post("/findIdScenario", scenarioCtrl.findIdScenario);
api_scenario.post("/generate", scenarioCtrl.generateEscenarioProcesses);
api_scenario.post("/generateFormulaI", scenarioCtrl.generateScenarioFormulaI);
api_scenario.post("/generateFormulaO", scenarioCtrl.generateScenarioFormulaO);
// api_scenario.put('/', scenarioCtrl.updateScenario);
api_scenario.post("/updateScenario", scenarioCtrl.updateScenario);
api_scenario.put("/updateStatus", scenarioCtrl.updateStatus);
api_scenario.delete("/", scenarioCtrl.deleteScenario);
api_scenario.get("/activeScenario", scenarioCtrl.activeScenario);

api_scenario.post("/getScenarioName", scenarioCtrl.getScenarioName);

module.exports = api_scenario;
