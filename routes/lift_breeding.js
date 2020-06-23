const express = require("express");
const config = require("../config");

const liftBreedingCtrl = config.driver === "postgres" ? require("../postgresql/controllers/lift_breeding") : require("./hcp/controllers/lot");

const api_liftBreeding = express.Router();

api_liftBreeding.post("/findLotByFarm", liftBreedingCtrl.findLotByFarm);
//api_lot.put('/updateLots', lotCtrl.updateLots);
api_liftBreeding.post("/", liftBreedingCtrl.addLiftBreedinglots);


module.exports = api_liftBreeding;
