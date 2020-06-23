const express = require("express");
const config = require("../config");

const siloCtrl = config.driver === "postgres" ? require("../postgresql/controllers/silo") : require("./hcp/controllers/silo");

const api_silo = express.Router();

api_silo.get("/", siloCtrl.findAllSilo);
api_silo.post("/", siloCtrl.addSilo);
api_silo.post("/findSiloByCenter", siloCtrl.findSiloByCenter);
api_silo.post("/findShedBySilo", siloCtrl.findShedBySilo);
api_silo.put("/", siloCtrl.updateSilo);
api_silo.delete("/", siloCtrl.deleteSilo);

module.exports = api_silo;
