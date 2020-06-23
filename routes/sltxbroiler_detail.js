const express = require("express");
const config = require("../config");

const sltxbroiler_detailCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxbroiler_detail") : require("./hcp/controllers/sltxbroiler_detail");

const api_sltxbroiler_detail = express.Router();

api_sltxbroiler_detail.post("/checkForPartitionAndProcess", sltxbroiler_detailCtrl.checkForPartitionAndProcess);
api_sltxbroiler_detail.post("/addNewBroilerDetail", sltxbroiler_detailCtrl.addNewBroilerDetail);
api_sltxbroiler_detail.post("/findBroilerDetail", sltxbroiler_detailCtrl.findBroilerDetail);
api_sltxbroiler_detail.post("/findELotByDate", sltxbroiler_detailCtrl.findELotByDate);
api_sltxbroiler_detail.put("/executeBroilerDetail", sltxbroiler_detailCtrl.executeBroilerDetail);

module.exports = api_sltxbroiler_detail;