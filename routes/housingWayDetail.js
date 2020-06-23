const express = require("express");
const config = require("../config");

const housingWaysDCtrl = config.driver === "postgres" ? require("../postgresql/controllers/housingWayDetail") : require("./hcp/controllers/housingWays");

const api_housingWayD = express.Router();

api_housingWayD.get("/syncReproductora", housingWaysDCtrl.findAllDateQuantityFarmProductReproductora);
api_housingWayD.get("/syncLevanteYCria", housingWaysDCtrl.findAllDateQuantityFarmProduct);
api_housingWayD.post("/findHousingWayDetByHw", housingWaysDCtrl.DBfindHousingWayDetByHw);
api_housingWayD.post("/findShedAndFarmProjection", housingWaysDCtrl.findShedAndFarmProjection);
api_housingWayD.post("/findHousingWayDetByHwdId", housingWaysDCtrl.DBfindHousingWayDetByHwdId);
api_housingWayD.post("/findHousingwayDetailByLotSap", housingWaysDCtrl.findHousingwayDetailByLotSap);
api_housingWayD.post("/findHousingwayDetailByLotSapLiftB", housingWaysDCtrl.findHousingwayDetailByLotSapLiftB);
api_housingWayD.post("/findHousingwayDetailByLotSapBreedingP", housingWaysDCtrl.findHousingwayDetailByLotSapBreedingP);
api_housingWayD.post("/", housingWaysDCtrl.addHousingWayDetail);
api_housingWayD.put("/", housingWaysDCtrl.updateHousingWayDetail);
api_housingWayD.put("/updateDisabledHousingWayDetail", housingWaysDCtrl.updateDisabledHousingWayDetail);
api_housingWayD.delete("/", housingWaysDCtrl.deleteHousingWayDetail);
api_housingWayD.post("/findPredecesorLot", housingWaysDCtrl.findPredecesorLot);

module.exports = api_housingWayD;
