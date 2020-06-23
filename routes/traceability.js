const express = require("express");
const config = require("../config");

const traceabilityCtrl = config.driver === "postgres" ? require("../postgresql/controllers/traceability") : require("./hcp/controllers/traceability");

const api_traceability = express.Router();
api_traceability.post("/", traceabilityCtrl.findTraceability);
api_traceability.post("/findLotLocation", traceabilityCtrl.getLotLocation);




// api_traceability.get('/syncReproductora', traceabilityCtrl.findAllDateQuantityFarmProductReproductora);
// api_traceability.get('/syncLevanteYCria', traceabilityCtrl.findAllDateQuantityFarmProduct);
// api_traceability.post('/findHousingWayDetByHw', traceabilityCtrl.DBfindHousingWayDetByHw);
// api_traceability.post('/findHousingWayDetByHwdId', traceabilityCtrl.DBfindHousingWayDetByHwdId);
// api_traceability.put('/', traceabilityCtrl.updateHousingWayDetail);
// api_traceability.put('/updateDisabledHousingWayDetail', traceabilityCtrl.updateDisabledHousingWayDetail);
// api_traceability.delete('/', traceabilityCtrl.deleteHousingWayDetail);


module.exports = api_traceability;
