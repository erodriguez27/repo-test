const express = require("express");
const config = require("../config");

const sltxSellsPurchaseCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxSellsPurchase") : require("./hcp/controllers/sltxSellsPurchase");

const api_sltxSellsPurchase = express.Router();

api_sltxSellsPurchase.post("/saveOperation", sltxSellsPurchaseCtrl.saveOperation);
api_sltxSellsPurchase.post("/findOperationsByFilter", sltxSellsPurchaseCtrl.findOperationsByFilter);
api_sltxSellsPurchase.post("/saveDeleted", sltxSellsPurchaseCtrl.saveDeleted);

module.exports = api_sltxSellsPurchase;