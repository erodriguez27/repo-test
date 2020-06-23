const express = require("express");
const config = require("../config");

const incPlantCtrl = config.driver === "postgres" ? require("../postgresql/controllers/incubatorPlant") : require("./hcp/controllers/incubatorPlant");

const api_incPlant = express.Router();

api_incPlant.post("/", incPlantCtrl.addIncubatorPlant);
api_incPlant.post("/findIncPlantByPartnetship", incPlantCtrl.findIncPlantByPartnetship);
api_incPlant.post("/incubatorStatus", incPlantCtrl.incubatorStatus);
api_incPlant.delete("/", incPlantCtrl.deleteIncubatorPlant);
api_incPlant.put("/", incPlantCtrl.updateIncubatorPlant);
api_incPlant.post("/isBeingUsed", incPlantCtrl.isBeingUsed);
// api_incPlant.post('/bulk', incPlantCtrl.bulkAddIncubatorPlant);

module.exports = api_incPlant;
