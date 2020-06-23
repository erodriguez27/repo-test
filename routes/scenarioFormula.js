const express = require("express");
const config = require("../config");

const scenarioFormulaCTRL = config.driver === "postgres" ? require("../postgresql/controllers/scenarioFormula") : require("./hcp/controllers/scenarioFormula");

const api_scenario_formula = express.Router();


api_scenario_formula.post("/getScenariosFormula", scenarioFormulaCTRL.getScenariosFormula);
api_scenario_formula.delete("/deleteAllFormula", scenarioFormulaCTRL.deleteAllFormula);

module.exports = api_scenario_formula;
