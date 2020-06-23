const express = require("express");
const config = require("../config");

const eggsMovementsCtrl = config.driver === "postgres" ? require("../postgresql/controllers/eggsMovements") : require("./hcp/controllers/eggsMovements");

const api_eggsMovements = express.Router();

api_eggsMovements.post("/addEggsMovements", eggsMovementsCtrl.addEggsMovements); 
api_eggsMovements.post("/findInventoryRealByPartnership", eggsMovementsCtrl.findInventoryRealByPartnership);
api_eggsMovements.post("/addMovementOriginal", eggsMovementsCtrl.addMovementOriginal);
api_eggsMovements.post("/updateEggsMovements", eggsMovementsCtrl.updateEggsMovements);
api_eggsMovements.post("/findIngresoOfEgresoDate", eggsMovementsCtrl.findIngresoOfEgresoDate);
api_eggsMovements.post("/ajusteMovement", eggsMovementsCtrl.ajusteMovement);

api_eggsMovements.get("/veriInventaOri", eggsMovementsCtrl.veriInventaOri);
api_eggsMovements.get("/totalRecord", eggsMovementsCtrl.totalRecord);


module.exports = api_eggsMovements;
