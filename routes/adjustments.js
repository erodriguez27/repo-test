const express = require("express");
const config = require("../config");

const adjustmentsCtrl = config.driver === "postgres" ? require("../postgresql/controllers/adjustments") : require("./hcp/controllers/adjustments");

const api_adjustments = express.Router();

//BUSQUEDAS DE INFORMACION POR LOTES
api_adjustments.post("/findLiftBreedingAndBreedingByLot", adjustmentsCtrl.findLiftBreedingAndBreedingByLot);
api_adjustments.post("/findColdRoomByLot", adjustmentsCtrl.findColdRoomByLot);
api_adjustments.post("/findBroilerByLot", adjustmentsCtrl.findBroilerByLot);
api_adjustments.post("/findAdjustmentsByLot", adjustmentsCtrl.findAdjustmentsByLot);
api_adjustments.post("/findEvictionLotData", adjustmentsCtrl.findLotData);
api_adjustments.put("/updateEvictionedStage", adjustmentsCtrl.updateEvictionedStage);

//cria y levante y produccion
api_adjustments.post("/updateHousingWayDetailExecutionQuantityByLot", adjustmentsCtrl.updateHousingWayDetailExecutionQuantityByLot);
// engorde
api_adjustments.post("/updateBroilerDetailExecutionQuantityByLot", adjustmentsCtrl.updateBroilerDetailExecutionQuantityByLot);
// Almacen de Huevo Fertil
api_adjustments.post("/updateColdRoomAdjustmentsByLot", adjustmentsCtrl.updateColdRoomAdjustmentsByLot);






module.exports = api_adjustments;
