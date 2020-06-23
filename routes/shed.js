const express = require("express");
const config = require("../config");

const shedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/shed") : require("./hcp/controllers/shed");
const api_shed = express.Router();

api_shed.post("/automatedScheduling", shedCtrl.automatedScheduling); 

api_shed.get("/", shedCtrl.findAllShed);
api_shed.post("/", shedCtrl.addShed);
api_shed.post("/findShedByCenter", shedCtrl.findShedByCenter);
api_shed.post("/findShedByCenter2", shedCtrl.findShedByCenter2);
api_shed.post("/findShedByCenter3", shedCtrl.findShedByCenter3);
api_shed.post("/findShedsByFarms", shedCtrl.findShedsByFarms);
api_shed.post("/findShedsByFarms2", shedCtrl.findShedsByFarms2);
api_shed.post("/findShedsByFarmForReprod", shedCtrl.findShedsByFarmForReprod);
api_shed.post("/findShedsByCenterForReprod", shedCtrl.findShedsByCenterForReprod);
api_shed.post("/findShedsByFarm", shedCtrl.findShedsByFarm);
api_shed.post("/findShedsByFarm2", shedCtrl.findShedsByFarm2);
api_shed.post("/isBeingUsed", shedCtrl.isBeingUsed);
api_shed.put("/", shedCtrl.updateShed);
api_shed.put("/updateRotationDays", shedCtrl.updateRotationDays);
api_shed.put("/updateShedOrder", shedCtrl.updateShedOrder);
api_shed.put("/updateRehousingShed", shedCtrl.updateRehousingShed);
// api_shed.post('/bulk', shedCtrl.bulkAddShed);
api_shed.delete("/", shedCtrl.deleteShed);

module.exports = api_shed;
