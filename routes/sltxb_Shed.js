const express = require("express");
const config = require("../config");

const sltxb_ShedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxb_Shed") : require("./hcp/controllers/sltxb_Shed");

const api_sltxb_Shed = express.Router();

api_sltxb_Shed.post("/saveBreedingShedProgrammed", sltxb_ShedCtrl.saveBreedingShedProgrammed);
api_sltxb_Shed.post("/findShedsByBreedingId", sltxb_ShedCtrl.findShedsByBreedingId);

module.exports = api_sltxb_Shed;