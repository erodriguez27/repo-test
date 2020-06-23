const express = require("express");
const config = require("../config");

const scenarioPCtrl = config.driver === "postgres" ? require("../postgresql/controllers/scenarioParameter") : require("./hcp/controllers/scenarioParameter");

const api_scenario_parameter = express.Router();


//api_scenario_parameter.post('/generatedEcParameter', scenarioPCtrl.generatedEcParameter);
api_scenario_parameter.post("/getScenariosParameters", scenarioPCtrl.getScenariosParameters);
api_scenario_parameter.put("/updateScenariosParameters", scenarioPCtrl.updateScenariosParameters);
api_scenario_parameter.post("/getParameterGoal", scenarioPCtrl.getParameterGoal);
api_scenario_parameter.post("/getParameterInByScenario", scenarioPCtrl.getParameterInByScenario);

//Servicios para el plugin de excel PowerQuery
//api_scenario_parameter.get('/pParameterGoal/:code', scenarioPCtrl.pParameterGoal);
api_scenario_parameter.get("/reportParameterGoal/:code", scenarioPCtrl.reportParameterGoal);
api_scenario_parameter.get("/reportParameterGoalDetail/:code", scenarioPCtrl.reportParameterGoalDetail);
api_scenario_parameter.post("/calculateProgressive", scenarioPCtrl.calculateProgressive);
api_scenario_parameter.post("/getMaxDemandEggs", scenarioPCtrl.getMaxDemandEggs);
api_scenario_parameter.post("/thereGoals", scenarioPCtrl.thereGoals);

api_scenario_parameter.get("/getStages", scenarioPCtrl.getStages);
api_scenario_parameter.get("/getBreeds", scenarioPCtrl.getBreeds);

//Progresiva incubadora
api_scenario_parameter.get("/brooderReport", scenarioPCtrl.brooderReport);

//Sincronizacion con el ERP
api_scenario_parameter.post("/syncToERP", scenarioPCtrl.syncToERP);
api_scenario_parameter.post("/isSyncToERP", scenarioPCtrl.isSyncToERP);
api_scenario_parameter.get("/getGoalsResults", scenarioPCtrl.getGoalsResults);
api_scenario_parameter.get("/getGoalsResultsDemandSum", scenarioPCtrl.getGoalsResultsDemandSum);
api_scenario_parameter.post("/getGoalsResultsByScenario", scenarioPCtrl.getGoalsResultsByScenario);

module.exports = api_scenario_parameter;
