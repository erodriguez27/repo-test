const express = require("express");
const config = require("../config");

const abaConsumptionAndMortalityDetailCtrl = require("../postgresql/controllers/abaConsumptionAndMortalityDetail");

const apiAbaConsumptionAndMortalityDetail = express.Router();

apiAbaConsumptionAndMortalityDetail.get("/", abaConsumptionAndMortalityDetailCtrl.findAll);
apiAbaConsumptionAndMortalityDetail.post("/", abaConsumptionAndMortalityDetailCtrl.add);
// apiAbaConsumptionAndMortalityDetail.post('/loadBatch', abaConsumptionAndMortalityDetailCtrl.addAbaElements);
apiAbaConsumptionAndMortalityDetail.post("/findById", abaConsumptionAndMortalityDetailCtrl.findById);
apiAbaConsumptionAndMortalityDetail.post("/findByConsumptionAndMortalityId", abaConsumptionAndMortalityDetailCtrl.findByConsumptionAndMortalityId);
apiAbaConsumptionAndMortalityDetail.put("/", abaConsumptionAndMortalityDetailCtrl.update);
apiAbaConsumptionAndMortalityDetail.delete("/", abaConsumptionAndMortalityDetailCtrl.delete);

module.exports = apiAbaConsumptionAndMortalityDetail;
