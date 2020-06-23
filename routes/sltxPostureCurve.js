const express = require("express");
const config = require("../config");

const sltxPostureCurveCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxPostureCurve") : require("./hcp/controllers/sltxPostureCurve");

const api_sltxPostureCurve = express.Router();

api_sltxPostureCurve.post("/savePostureCurve", sltxPostureCurveCtrl.savePostureCurve);
api_sltxPostureCurve.post("/findPostureCurve", sltxPostureCurveCtrl.findPostureCurve);
api_sltxPostureCurve.post("/findPostureCurveLot", sltxPostureCurveCtrl.findPostureCurveLot);

module.exports = api_sltxPostureCurve;