const express = require("express"); 
const config = require("../config");

const broilerevictionCtrl = config.driver === "postgres" ? require("../postgresql/controllers/broilereviction") : require("./hcp/controllers/broilereviction");

// console.log('entro al broiler eviction --- control');


const api_broilereviction = express.Router();
// console.log("aquimismo");
api_broilereviction.post("/findprojectedbroilereviction", broilerevictionCtrl.findprojectedbroilereviction);
// console.log("aquimismo");
api_broilereviction.post("/findBroilerEvictionLot", broilerevictionCtrl.findBroilerEvictionLot);
api_broilereviction.post("/findBroilerEvictionFarmAndProduct", broilerevictionCtrl.findBroilerEvictionFarmAndProduct);

module.exports = api_broilereviction;
