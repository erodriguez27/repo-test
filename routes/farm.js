const express = require("express");
const config = require("../config");

const farmCtrl = config.driver === "postgres" ? require("../postgresql/controllers/farm") : require("./hcp/controllers/farm");

const api_farm = express.Router();

api_farm.get("/", farmCtrl.findAllFarm);
api_farm.get("/erp", farmCtrl.erp);
// api_farm.post("/bulk", farmCtrl.bulkAddFarm);
api_farm.post("/findFarmByPartnetship", farmCtrl.findFarmByPartnetship);
api_farm.post("/findFarmByPartnetship2", farmCtrl.findFarmByPartnetship2);
api_farm.post("/findShedByFarm", farmCtrl.findShedByFarm);
api_farm.post("/findFarmByPartAndStatus", farmCtrl.findFarmByPartAndStatus);
api_farm.post("/findFarmByPartAndStatus2", farmCtrl.findFarmByPartAndStatus2);
api_farm.post("/findIdByCode", farmCtrl.findIdByCode);
api_farm.post("/isBeingUsed", farmCtrl.isBeingUsed);
api_farm.post("/findPartnershipIdByCode", farmCtrl.findPartnershipIdByCode);
api_farm.post("/", farmCtrl.addFarm);
api_farm.put("/", farmCtrl.updateFarm);
api_farm.delete("/", farmCtrl.deleteFarm);
api_farm.put("/updateFarmOrder", farmCtrl.updateFarmOrder);

module.exports = api_farm;
