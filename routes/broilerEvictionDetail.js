const express = require("express");
const config = require("../config");

const broilerEvictionDCtrl = config.driver === "postgres" ? require("../postgresql/controllers/broilerEvictionDetail") : require("./hcp/controllers/broilerEvictionDetail");

const api_broilerEviction_detail = express.Router();

// console.log('entro al broiler eviction detail control');

api_broilerEviction_detail.post("/", broilerEvictionDCtrl.addBroilerEvictionDetail);
api_broilerEviction_detail.put("/", broilerEvictionDCtrl.updatebroilerdetail);
api_broilerEviction_detail.put("/updateDisabledBroilerEvictionDetail", broilerEvictionDCtrl.updateDisabledBroilerEvictionDetail);
api_broilerEviction_detail.post("/findBroilerEvictionDetail", broilerEvictionDCtrl.findBroilerEvictionDetail);
api_broilerEviction_detail.post("/findBroilerEvictionDetailById", broilerEvictionDCtrl.findBroilerEvictionDetailById);



module.exports = api_broilerEviction_detail;
