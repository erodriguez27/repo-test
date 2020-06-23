const express = require("express");
const config = require("../config");

const incubatorCtrl = config.driver === "postgres" ? require("../postgresql/controllers/incubator") : require("./hcp/controllers/incubator");

const api_incubator = express.Router();

api_incubator.post("/", incubatorCtrl.addIncubator);
api_incubator.post("/findIncubatorByPlant", incubatorCtrl.findIncubatorByPlant);
api_incubator.post("/findIncubatorByPlant2", incubatorCtrl.findIncubatorByPlant2);
api_incubator.post("/findIncubatorByDay", incubatorCtrl.findIncubatorByDay);
api_incubator.post("/findIncubatorByDate", incubatorCtrl.findIncubatorByDate);
api_incubator.delete("/", incubatorCtrl.deleteIncubator);
api_incubator.put("/", incubatorCtrl.updateIncubator);
api_incubator.post("/calculateIncubator", incubatorCtrl.calculateIncubator);
api_incubator.post("/isBeingUsed", incubatorCtrl.isBeingUsed);
// api_incubator.post('/bulk', incubatorCtrl.bulkAddIncubator);

module.exports = api_incubator;
