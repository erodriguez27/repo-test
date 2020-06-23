const express = require("express");
const config = require("../config");

const broilerProductCtrl = config.driver === "postgres" ? require("../postgresql/controllers/broilerProduct") : require("./hcp/controllers/broilerProduct");

const api_broiler_product = express.Router();

api_broiler_product.get("/", broilerProductCtrl.findAllBroilerProduct);
api_broiler_product.post("/", broilerProductCtrl.addBroilerProduct);
api_broiler_product.post("/isBeingUsed", broilerProductCtrl.isBeingUsed);
api_broiler_product.post("/findLightProductByBreed", broilerProductCtrl.findLightProductByBreed);
api_broiler_product.put("/", broilerProductCtrl.updateBroilerProduct);
api_broiler_product.delete("/", broilerProductCtrl.deleteBroilerProduct);

module.exports = api_broiler_product;
