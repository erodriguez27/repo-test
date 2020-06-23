const express = require("express");
const config = require("../config");

const   ave_simulatorResult = require("../postgresql/controllers/ave_simulator");

const apiAve_simulator = express.Router();

apiAve_simulator.get("/",ave_simulatorResult.generateSimulator);
apiAve_simulator.post("/",ave_simulatorResult.generateSimulator);
apiAve_simulator.get("/findParameter",ave_simulatorResult.findparameter);
apiAve_simulator.put("/changeActive",    ave_simulatorResult.changeActive);
apiAve_simulator.post("/DeleteParameter",    ave_simulatorResult.deleteparameter);
apiAve_simulator.post("/updateParameter",    ave_simulatorResult.updateparameter);
apiAve_simulator.post("/insertParameter",    ave_simulatorResult.insertparameter);
apiAve_simulator.post("/findParameterByscenari",    ave_simulatorResult.findbreedByscenari);
module.exports = apiAve_simulator;
