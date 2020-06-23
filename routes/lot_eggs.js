const express = require("express");
const config = require("../config");

const lotEggsCtrl = config.driver === "postgres" ? require("../postgresql/controllers/lot_eggs") : require("./hcp/controllers/lot");

const api_lotEggs = express.Router();

api_lotEggs.get("/", lotEggsCtrl.findAllLotEggs);
api_lotEggs.put("/", lotEggsCtrl.updateAllLotEggs);


module.exports = api_lotEggs;
