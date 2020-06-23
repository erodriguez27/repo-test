const express = require("express");
const config = require("../config");

const measureCtrl = config.driver === "postgres" ? require("../postgresql/controllers/measure") : require("./hcp/controllers/measure");

const api_measure = express.Router();

// **** Inicio ConfTenica ****
api_measure.get("/", measureCtrl.findAllMeasure);
api_measure.post("/", measureCtrl.addMeasure);
api_measure.post("/changeName", measureCtrl.changeName);
api_measure.post("/changeAbrev", measureCtrl.changeAbrev);
api_measure.put("/", measureCtrl.updateMeasure);
api_measure.delete("/", measureCtrl.deleteMeasure);

// **** Fin ConfTenica ****

module.exports = api_measure;
