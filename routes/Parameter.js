const express = require("express");
const config = require("../config");

const parameterCtrl = config.driver === "postgres" ? require("../postgresql/controllers/Parameter") : require("./hcp/controllers/Parameter");

const api_parameter = express.Router();


api_parameter.get("/findAllParameter", parameterCtrl.findAllParameter);
api_parameter.get("/findParameterByType/:type", parameterCtrl.findParameterByType);
api_parameter.get("/", parameterCtrl.findParameter);
api_parameter.post("/", parameterCtrl.addParameter);
api_parameter.post("/changeName", parameterCtrl.changeName);
api_parameter.put("/", parameterCtrl.updateParameter);
api_parameter.delete("/", parameterCtrl.deleteParameter);
api_parameter.post("/isBeingUsed", parameterCtrl.isBeingUsed);

module.exports = api_parameter;
