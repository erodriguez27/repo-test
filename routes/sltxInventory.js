const express = require("express");
const config = require("../config");

const sltxInventoryCtrl = config.driver === "postgres" ? require("../postgresql/controllers/sltxInventory") : require("./hcp/controllers/sltxInventory");

const api_sltxInventory = express.Router();
 
api_sltxInventory.post("/findInventoryByFilter", sltxInventoryCtrl.findInventoryByFilter);
api_sltxInventory.post("/executeInventory", sltxInventoryCtrl.executeInventory);

module.exports = api_sltxInventory;