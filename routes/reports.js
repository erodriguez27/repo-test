const express = require("express"); 
const config = require("../config"); 
 
const reportsCtrl = config.driver === "postgres" ? require("../postgresql/controllers/reports") : require("./hcp/controllers/reports"); 
 
const api_reports = express.Router(); 
 
api_reports.post("/findLiftBreeding", reportsCtrl.findLiftBreeding); 
api_reports.post("/breeding", reportsCtrl.findBreeding); 
api_reports.post("/incubator", reportsCtrl.findIncubator); 
api_reports.post("/broiler", reportsCtrl.findBroiler); 
api_reports.post("/broilerEviction", reportsCtrl.findBroilerEviction); 
 
module.exports = api_reports; 