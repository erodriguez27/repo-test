const express = require("express");
const config = require("../config");

const syncCtrl = config.driver === "postgres" ? require("../postgresql/controllers/synchronization") : require("./hcp/controllers/syncronization");

const api_sync = express.Router();

api_sync.get("/", syncCtrl.mainSync);
api_sync.get("/syncLevanteYCria", syncCtrl.syncLevanteYCria);
api_sync.get("/syncReproductora", syncCtrl.syncReproductora);
api_sync.get("/syncIncubadora", syncCtrl.syncIncubadora);
api_sync.get("/syncEngorde", syncCtrl.syncEngorde);

api_sync.get("/syncGetDateQuantityFramProductReproductora", syncCtrl.findAllDateQuantityFarmProductReproductora);
api_sync.get("/syncGetAllDateQuantityFarmProductLevanteYCria", syncCtrl.findAllDateQuantityFarmProduct);
api_sync.get("/syncGetAllDateQuantityFarmProduct", syncCtrl.findAllDateQuantityFarmProduct);
api_sync.get("/syncGetAllDateQuantityFarmProductIncubator", syncCtrl.findAllDateQuantityFarmProductIncubator);
api_sync.get("/syncGetAllDateQuantityFarmProductBroiler", syncCtrl.findAllDateQuantityFarmProductBroiler);

module.exports = api_sync;
