const express = require("express");
const config = require("../config");

const lotCtrl = config.driver === "postgres" ? require("../postgresql/controllers/lot") : require("./hcp/controllers/lot");

const api_lot = express.Router();

api_lot.post("/findLotByFarm", lotCtrl.findLotByFarm);
api_lot.put("/updateLots", lotCtrl.updateLots);
api_lot.post("/", lotCtrl.addlots);


module.exports = api_lot;
