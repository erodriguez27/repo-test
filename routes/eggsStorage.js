const express = require("express");
const config = require("../config");

const eggsStorageCtrl = config.driver === "postgres" ? require("../postgresql/controllers/eggsStorage") : require("./hcp/controllers/eggsStorage");

const api_eggsStorage = express.Router();


api_eggsStorage.post("/findInventoryByPartnership", eggsStorageCtrl.findInventoryByPartnership);
api_eggsStorage.post("/findEggsStorageByDateDetail", eggsStorageCtrl.findEggsStorageByDateDetail);
api_eggsStorage.post("/findAllEggsStorage", eggsStorageCtrl.findAllEggsStorage);
api_eggsStorage.post("/findEggsStorageByLotAndDate", eggsStorageCtrl.findEggsStorageByLotAndDate);
api_eggsStorage.post("/findEggsStorageDataReport", eggsStorageCtrl.findEggsStorageDataReport);
api_eggsStorage.post("/findEggsStorageDataReportNew", eggsStorageCtrl.findEggsStorageDataReportNew)

api_eggsStorage.post("/findAllEggsStorageView", eggsStorageCtrl.findAllEggsStorageView);
api_eggsStorage.post("/findEggsStorageByWeek", eggsStorageCtrl.findEggsStorageByWeek);
api_eggsStorage.post("/findEggsStorageLots", eggsStorageCtrl.findEggsStorageLots);
api_eggsStorage.post("/findEggsStorageLotsFather", eggsStorageCtrl.findEggsStorageLotsFather);
api_eggsStorage.post("/findEggsStorageLotsChilds", eggsStorageCtrl.findEggsStorageLotsChilds);
api_eggsStorage.post("/findEggsStorageByYearBreedLot", eggsStorageCtrl.findEggsStorageByYearBreedLot);
api_eggsStorage.post("/findEggsStorageByYearBreedLotAllChilds", eggsStorageCtrl.findEggsStorageByYearBreedLotAllChilds);
api_eggsStorage.post("/findEggsStorageDetailByYearWeekBreedLot", eggsStorageCtrl.findEggsStorageDetailByYearWeekBreedLot);
api_eggsStorage.get("/getEggsStorageYears", eggsStorageCtrl.findEggsStorageYears);

api_eggsStorage.post("/updateEggsExecuted", eggsStorageCtrl.updateExecutedEggs);

api_eggsStorage.get("/syncReproductora", eggsStorageCtrl.findAllDateQuantityFarmProductReproductora);


module.exports = api_eggsStorage;
