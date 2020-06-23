const express = require("express");
const config = require("../config");

const dailyMonitorCtrl = config.driver === "postgres" ? require("../postgresql/controllers/dailyMonitor") : require("./hcp/controllers/housingWays");

const api_dailyMonitor = express.Router();

// console.log("monitor. llego a la ruta");

api_dailyMonitor.post("/findLiftBreedingMonitor", dailyMonitorCtrl.findLiftBreedingMonitor);
api_dailyMonitor.post("/findBreedingMonitor", dailyMonitorCtrl.findBreedingMonitor);
api_dailyMonitor.post("/findColdRoom", dailyMonitorCtrl.findColdRoom);
api_dailyMonitor.post("/findIncubatorMonitor", dailyMonitorCtrl.findIncubatorMonitor);
api_dailyMonitor.post("/findBroilerMonitor", dailyMonitorCtrl.findBroilerMonitor);
api_dailyMonitor.post("/findBroilerEvictionMonitor", dailyMonitorCtrl.findBroilerEvictionMonitor);

module.exports = api_dailyMonitor;
