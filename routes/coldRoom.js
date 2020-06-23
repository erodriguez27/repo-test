const express = require("express");
const config = require("../config");

const coldRoomCtrl = config.driver === "postgres" ? require("../postgresql/controllers/coldRoom") : require("./hcp/controllers/coldRoom");

const api_cold_room = express.Router();

// EndPoint que permite obtener todos los calendarios almacenados en la BD:
api_cold_room.post("/findProjectEggs", coldRoomCtrl.findProjectEggs);//busca la proyeccion de huevos actual, agrupadas por plantas incubadoras
api_cold_room.post("/findEntryEggs", coldRoomCtrl.findEntryEggs);//busca las entradas *ejecutadas* de huevos para la planta incubadora seleccionada
api_cold_room.post("/findEntryEggsPlexus", coldRoomCtrl.findEntryEggsPlexus);
api_cold_room.post("/findEntryEggs2", coldRoomCtrl.findEntryEggs2);//busca las entradas *ejecutadas* de huevos para la planta incubadora seleccionada
api_cold_room.post("/addEntryEggs", coldRoomCtrl.addEntryEggs);//actualiza la ejecución de cuarto frío
api_cold_room.post("/addNewEntryEggs", coldRoomCtrl.addNewEntryEggs);//actualiza la ejecución de cuarto frío
api_cold_room.post("/addAdjustEntryEggs", coldRoomCtrl.addAdjustEntryEggs);//actualiza la ejecución de cuarto frío
api_cold_room.post("/addAdjustEgressEggs", coldRoomCtrl.addAdjustEgressEggs);//actualiza la ejecución de cuarto frío
api_cold_room.post("/findProjectIncubator", coldRoomCtrl.findProjectIncubator);//actualiza la ejecución de cuarto frío
api_cold_room.post("/findProjectIncubatorAll", coldRoomCtrl.findProjectIncubatorAll);//actualiza la ejecución de cuarto frío
api_cold_room.post("/getMovementsByEntry", coldRoomCtrl.getMovementsByEntry);//obtiene los egresos de cuarto frío
api_cold_room.post("/getMovementsPlexusByEntry", coldRoomCtrl.getMovementsPlexusByEntry);
api_cold_room.post("/getMovementsByDescription", coldRoomCtrl.getMovementsByDescription);//obtiene los egresos de cuarto frío
api_cold_room.post("/getOutMovementsForDate", coldRoomCtrl.getOutMovementsForDate);//obtiene los egresos de cuarto frío por fechas
api_cold_room.post("/getAllLots", coldRoomCtrl.getAllLots);//obtiene los codigos de lotes correspondiente a la maquina incubadora
api_cold_room.post("/getLots", coldRoomCtrl.getLots);
api_cold_room.post("/findParentLots", coldRoomCtrl.findParentLots);

module.exports = api_cold_room;