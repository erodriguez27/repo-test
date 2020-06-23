const express = require("express");
const config = require("../config");

const salesCtrl = config.driver === "postgres" ? require("../postgresql/controllers/incubatorSales") : require("./hcp/controllers/incubatorSales");

const api_sales = express.Router();

api_sales.post("/addNewSales", salesCtrl.addNewSales);
api_sales.post("/findIncubatorSales", salesCtrl.findIncubatorSales);
api_sales.post("/findSaleById", salesCtrl.findSaleById);
api_sales.put("/updateDeletedIncubatorSales", salesCtrl.updateDeletedIncubatorSales);

module.exports = api_sales;