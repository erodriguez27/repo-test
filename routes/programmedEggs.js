const express = require("express");
const config = require("../config");

const programmedEggsCtrl = config.driver === "postgres" ? require("../postgresql/controllers/programmedEggs") : require("./hcp/controllers/programmedEggs");

const api_programmed_eggs = express.Router();

api_programmed_eggs.get("/syncIncubadora", programmedEggsCtrl.findAllDateQuantityFarmProduct);
api_programmed_eggs.post("/", programmedEggsCtrl.addProgrammed);
api_programmed_eggs.post("/findProgrammedEggs", programmedEggsCtrl.findProgrammedEggs);
api_programmed_eggs.post("/findProgrammedEggsByLotSap", programmedEggsCtrl.findProgrammedEggsByLotSap);
api_programmed_eggs.put("/", programmedEggsCtrl.updateProgrammedEggs);
api_programmed_eggs.delete("/", programmedEggsCtrl.deleteStorageByLot);
api_programmed_eggs.post("/findColdRoomsLotByProgramming", programmedEggsCtrl.findColdRoomsLotByProgramming);
api_programmed_eggs.post("/findExecutionByProgrammedId", programmedEggsCtrl.findExecutionByProgrammedId);
api_programmed_eggs.put("/updateExecutedQuantity", programmedEggsCtrl.updateExecutedQuantity);
api_programmed_eggs.put("/updateDisabledProgrammedEggs", programmedEggsCtrl.updateDisabledProgrammedEggs);
module.exports = api_programmed_eggs;
