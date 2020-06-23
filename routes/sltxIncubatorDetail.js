const express = require("express");
const config = require("../config");

const sltxIncubatorDetailCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxIncubatorDetail") : require("./hcp/controllers/sltxIncubatorDetail");

const api_sltxIncubator_detail = express.Router();

api_sltxIncubator_detail.post("/findProgrammedIncubator", sltxIncubatorDetailCtrl.findProgrammedByIncId);
api_sltxIncubator_detail.post("/findProgrammedByRangeAndPlant", sltxIncubatorDetailCtrl.findProgrammedByRangeAndPlant);
api_sltxIncubator_detail.post("/addNewProgrammed", sltxIncubatorDetailCtrl.addNewProgrammed);
api_sltxIncubator_detail.post("/projectIncubator", sltxIncubatorDetailCtrl.projectIncubator);
api_sltxIncubator_detail.post("/executeIncubator", sltxIncubatorDetailCtrl.executeIncubator);


module.exports = api_sltxIncubator_detail;