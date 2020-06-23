const express = require("express");
const config = require("../config");

const abaConsumptionAndMortalityCtrl = require("../postgresql/controllers/abaConsumptionAndMortality");

const apiAbaConsumptionAndMortality = express.Router();

apiAbaConsumptionAndMortality.get("/", abaConsumptionAndMortalityCtrl.findAll);
apiAbaConsumptionAndMortality.post("/", abaConsumptionAndMortalityCtrl.add);
apiAbaConsumptionAndMortality.post("/addConsAndMort", abaConsumptionAndMortalityCtrl.addConsAndMort);
apiAbaConsumptionAndMortality.get("/withTimes", abaConsumptionAndMortalityCtrl.findAllWithTimes);
// apiAbaConsumptionAndMortality.post('/loadBatch', abaConsumptionAndMortalityCtrl.addAbaElements);
apiAbaConsumptionAndMortality.post("/findById", abaConsumptionAndMortalityCtrl.findById);
apiAbaConsumptionAndMortality.post("/findByCode", abaConsumptionAndMortalityCtrl.findByCode);
apiAbaConsumptionAndMortality.post("/findByName", abaConsumptionAndMortalityCtrl.findByName);
apiAbaConsumptionAndMortality.put("/", abaConsumptionAndMortalityCtrl.update);
apiAbaConsumptionAndMortality.put("/updateConsAndMort", abaConsumptionAndMortalityCtrl.updateConsAndMort);
apiAbaConsumptionAndMortality.delete("/", abaConsumptionAndMortalityCtrl.delete);

module.exports = apiAbaConsumptionAndMortality;
