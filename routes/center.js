const express = require("express");
const config = require("../config");

const centerCtrl = config.driver === "postgres" ? require("../postgresql/controllers/center") : require("./hcp/controllers/center");

const api_center = express.Router();

api_center.get("/", centerCtrl.findAllCenter);
api_center.post("/", centerCtrl.addCenter);
// api_center.post("/bulk", centerCtrl.bulkAddCenter);
api_center.post("/findCenterByFarm", centerCtrl.findCenterByFarm);
api_center.post("/findCenterByFarm2", centerCtrl.findCenterByFarm2);
api_center.post("/findWarehouseByCenter", centerCtrl.findWarehouseByCenter);
api_center.post("/findIdByCode", centerCtrl.findIdByCode);
api_center.post("/isBeingUsed", centerCtrl.isBeingUsed);
api_center.put("/", centerCtrl.updateCenter);
api_center.put("/updateCenterOrder", centerCtrl.updateCenterOrder);
api_center.delete("/", centerCtrl.deleteCenter);

module.exports = api_center;
