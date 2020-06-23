const express = require("express");
const config = require("../config");

const productCtrl = config.driver === "postgres" ? require("../postgresql/controllers/product") : require("./hcp/controllers/product");

const api_product = express.Router();


api_product.get("/", productCtrl.findAllProduct);
api_product.post("/", productCtrl.addProduct);
api_product.post("/findProductsByBreed", productCtrl.findProductsByBreed);
api_product.post("/findProductsByBreedAndStage", productCtrl.findProductsByBreedAndStage);
api_product.post("/isBeingUsed", productCtrl.isBeingUsed);
api_product.put("/", productCtrl.updateProduct);
api_product.delete("/", productCtrl.deleteProduct);



module.exports = api_product;
