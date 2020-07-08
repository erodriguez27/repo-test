const express = require("express");
const config = require("../config");

const housingWaysCtrl = config.driver === "postgres" ? require("../postgresql/controllers/housingWay") : require("./hcp/controllers/housingWays");

const api_housingWay = express.Router();


api_housingWay.get("/", housingWaysCtrl.findAllHousingWay);
api_housingWay.post("/", housingWaysCtrl.addHousingWay);
api_housingWay.post("/findGroupByPartnership", housingWaysCtrl.findGroupByPartnership);
api_housingWay.delete("/", housingWaysCtrl.deleteHousingWay);
api_housingWay.post("/deleteHousingWayById", housingWaysCtrl.deleteHousingWayById);
api_housingWay.post("/findHousingWByPartnership", housingWaysCtrl.findHousingWByPartnership);
api_housingWay.post("/findHousingByStage", housingWaysCtrl.findHousingByStage);
api_housingWay.post("/returns2", housingWaysCtrl.returns2);
api_housingWay.post("/findHousingByFilters", housingWaysCtrl.findHousingByFilters);


module.exports = api_housingWay;
