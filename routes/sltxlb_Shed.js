const express = require("express");
const config = require("../config");

const sltxlb_ShedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxlb_Shed") : require("./hcp/controllers/sltxlb_Shed");

const api_sltxlb_Shed = express.Router();

api_sltxlb_Shed.post("/saveShedsByLiftBreeding", sltxlb_ShedCtrl.saveShedsByLiftBreeding);
api_sltxlb_Shed.post("/findShedsByLiftBreedingId", sltxlb_ShedCtrl.findShedsByLiftBreedingId);
//api_sltxlb_Shed.post("/findShedsByBreedingId", sltxlb_ShedCtrl.findShedsByBreedingId);

module.exports = api_sltxlb_Shed;