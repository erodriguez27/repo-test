const express = require("express");
const config = require("../config");

const broilerDCtrl = config.driver === "postgres" ? require("../postgresql/controllers/broilerDetail") : require("./hcp/controllers/broilerDetail");

const api_broiler_detail = express.Router();

api_broiler_detail.get("/syncEngorde", broilerDCtrl.findAllDateQuantityFarmProduct);
api_broiler_detail.post("/", broilerDCtrl.addbroilerdetail);
api_broiler_detail.put("/", broilerDCtrl.updatebroilerdetail);
api_broiler_detail.put("/updateDisabledbroilerdetail", broilerDCtrl.updateDisabledbroilerdetail);
api_broiler_detail.post("/findbroilerdetail", broilerDCtrl.findbroilerdetail);
api_broiler_detail.post("/findBroilerDetailByLotSap", broilerDCtrl.findBroilerDetailByLotSap);
api_broiler_detail.post("/findbroilerdetailById", broilerDCtrl.findbroilerdetailById);
api_broiler_detail.delete("/", broilerDCtrl.findbroilerdetail);
api_broiler_detail.post("/findIncubatorLotByBroilerLot", broilerDCtrl.findIncubatorLotByBroilerLot);


module.exports = api_broiler_detail;
