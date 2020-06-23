const express = require("express");
const config = require("../config");

const sltxbr_shedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxbr_shed") : require("./hcp/controllers/sltxbr_shed");

const api_sltxbr_shed = express.Router();

api_sltxbr_shed.post("/findShedsByLotProg", sltxbr_shedCtrl.findShedsByLotProg);

module.exports = api_sltxbr_shed;