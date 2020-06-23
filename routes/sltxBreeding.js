const express = require("express");
const config = require("../config");

const sltxBreedingCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxBreeding") : require("./hcp/controllers/sltxBreeding");

const api_sltxBreeding = express.Router();

api_sltxBreeding.post("/saveBreedingProgrammed", sltxBreedingCtrl.saveBreedingProgrammed);
api_sltxBreeding.post("/findBreedingByFilter", sltxBreedingCtrl.findBreedingByFilter);
api_sltxBreeding.post("/saveProjectionByBreedingProgrammed", sltxBreedingCtrl.saveProjectionByBreedingProgrammed);
api_sltxBreeding.post("/saveProjection", sltxBreedingCtrl.saveProjection);
api_sltxBreeding.post("/saveExecutionsByBreedingProjected", sltxBreedingCtrl.saveExecutionsByBreedingProjected);
api_sltxBreeding.post("/findPostureCurveByBreed", sltxBreedingCtrl.findPostureCurveByBreed);
api_sltxBreeding.post("/findPostureProcessAndCurveByBreed", sltxBreedingCtrl.findPostureProcessAndCurveByBreed);
api_sltxBreeding.post("/existLot", sltxBreedingCtrl.existLot);
api_sltxBreeding.post("/existDemandAndLot", sltxBreedingCtrl.existDemandAndLot);

api_sltxBreeding.post("/saveExecutions", sltxBreedingCtrl.saveExecutions);

module.exports = api_sltxBreeding;