const express = require("express");
const config = require("../config");
// Controlador para calendarDay según el driver:
const processCtrl = config.driver === "postgres" ? require("../postgresql/controllers/process") : require("./hcp/controllers/process");
// Instancia del Router de express:
const api_process = express.Router();

api_process.post("/recalculateGoals", processCtrl.recalculateGoals);
/* Endpoints */
api_process.get("/", processCtrl.getAllProcess);
api_process.get("/AllProcessJ", processCtrl.getAllProcessJ);
api_process.post("/", processCtrl.addProcess);
api_process.put("/", processCtrl.updateProcess);
api_process.delete("/", processCtrl.deleteProcess);
api_process.post("/findProcessByStage", processCtrl.findProcessByStage);
api_process.post("/findProcessBreedByStage", processCtrl.findProcessBreedByStage);
api_process.post("/findProcessByStageBreed", processCtrl.findProcessByStageBreed);
api_process.post("/findProcessPredecessors", processCtrl.findProcessPredecessors);
api_process.post("/isBeingUsed", processCtrl.isBeingUsed);

module.exports = api_process;
