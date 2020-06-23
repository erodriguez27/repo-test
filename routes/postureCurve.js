const express = require("express");
const config = require("../config");

const postureCurveCtrl = config.driver === "postgres" ? require("../postgresql/controllers/postureCurve") : require("./hcp/controllers/Calendar");

const api_postureCurve = express.Router();

api_postureCurve.get("/", postureCurveCtrl.findAllPostureCurve);
api_postureCurve.post("/findCurveByBreed", postureCurveCtrl.findCurveByBreed);
api_postureCurve.post("/", postureCurveCtrl.addPostureCurve);
api_postureCurve.delete("/", postureCurveCtrl.deletePostureCurveByBreed);
api_postureCurve.put("/", postureCurveCtrl.updatePostureCurve); 

module.exports = api_postureCurve;
