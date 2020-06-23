const express = require("express");
const config = require("../config");

const warehouseCtrl = config.driver === "postgres" ? require("../postgresql/controllers/warehouse") : require("./hcp/controllers/warehouse");

const api_warehouse = express.Router();



api_warehouse.get("/", warehouseCtrl.findAllWarehouse);
// api_warehouse.post('/bulk', warehouseCtrl.bulkAddWarehouse);
api_warehouse.post("/", warehouseCtrl.addWarehouse);
api_warehouse.post("/findWarehouseByFarm", warehouseCtrl.findWarehouseByFarm);
api_warehouse.put("/", warehouseCtrl.updateWarehouse);
api_warehouse.delete("/", warehouseCtrl.deleteWarehouse);



module.exports = api_warehouse;
