const express = require("express");
const config = require("../config");

const sltxLiftBreedingCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxLiftBreeding") : require("./hcp/controllers/sltxLiftBreeding");

const api_sltxLiftBreeding = express.Router();

api_sltxLiftBreeding.post("/findLiftBreedingProgrammed", sltxLiftBreedingCtrl.findLiftBreedingProgrammed);
api_sltxLiftBreeding.post("/projectLiftBreeding", sltxLiftBreedingCtrl.projectLiftBreeding);

api_sltxLiftBreeding.put("/executeLiftBreeding", sltxLiftBreedingCtrl.executeLiftBreeding);

// api_sltxLiftBreeding.post("/saveBreedingProgrammed", sltxLiftBreedingCtrl.saveBreedingProgrammed);

module.exports = api_sltxLiftBreeding;