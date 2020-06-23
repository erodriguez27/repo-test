const express = require("express");
const config = require("../config");

const sltxIncubatorCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxIncubator") : require("./hcp/controllers/sltxIncubator");

const api_sltxIncubator = express.Router();

api_sltxIncubator.post("/findIncubator", sltxIncubatorCtrl.findIncubator);
api_sltxIncubator.post("/findLotProduction", sltxIncubatorCtrl.findLotProduction); 


module.exports = api_sltxIncubator;