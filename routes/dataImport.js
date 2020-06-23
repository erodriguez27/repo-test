const express = require("express");
const config = require("../config");

const postureCurveCtrl = config.driver === "postgres" ? require("../postgresql/controllers/postureCurve") : require("./hcp/controllers/Calendar");
const partnershipCtrl = config.driver === "postgres" ? require("../postgresql/controllers/partnership") : require("./hcp/controllers/partnership");
const centerCtrl = config.driver === "postgres" ? require("../postgresql/controllers/center") : require("./hcp/controllers/center");
const farmCtrl = config.driver === "postgres" ? require("../postgresql/controllers/farm") : require("./hcp/controllers/farm");
const warehouseCtrl = config.driver === "postgres" ? require("../postgresql/controllers/warehouse") : require("./hcp/controllers/warehouse");
const shedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/shed") : require("./hcp/controllers/shed");
const incPlantCtrl = config.driver === "postgres" ? require("../postgresql/controllers/incubatorPlant") : require("./hcp/controllers/incubatorPlant");
const incubatorCtrl = config.driver === "postgres" ? require("../postgresql/controllers/incubator") : require("./hcp/controllers/incubator");
const productCtrl = config.driver === "postgres" ? require("../postgresql/controllers/product") : require("./hcp/controllers/product");
const measureCtrl = config.driver === "postgres" ? require("../postgresql/controllers/measure") : require("./hcp/controllers/measure");
const parameterCtrl = config.driver === "postgres" ? require("../postgresql/controllers/Parameter") : require("./hcp/controllers/Parameter");

var api_dataImport = express.Router();

api_dataImport.post("/posture_curve", postureCurveCtrl.bulkAddPostureCurve2); 
api_dataImport.post("/partnership", partnershipCtrl.bulkAddPartnership2); 
api_dataImport.post("/center", centerCtrl.bulkAddCenter2); 
api_dataImport.post("/farm", farmCtrl.bulkAddFarm2); 
api_dataImport.post("/warehouse", warehouseCtrl.bulkAddWarehouse2);
api_dataImport.post("/shed", shedCtrl.bulkAddShed2);
api_dataImport.post("/incubator_plant", incPlantCtrl.bulkAddIncubatorPlant2);
api_dataImport.post("/incubator", incubatorCtrl.bulkAddIncubator2);
api_dataImport.post("/product", productCtrl.bulkAddProduct);
api_dataImport.post("/measure", measureCtrl.bulkAddMeasure);
api_dataImport.post("/parameter", parameterCtrl.bulkAddParameter);

api_dataImport.post("/encontramosAlgo", farmCtrl.encontramosAlgo);

module.exports = api_dataImport;