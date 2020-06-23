const express = require("express");
const config = require("../config");

const higherLyDCtrl = config.driver === "postgres" ? require("../postgresql/controllers/higherLayer") : require("./hcp/controllers/higherLayer");

const api_higher_layer = express.Router();

// Funciones de uso generico
api_higher_layer.post("/findScenarioBreedAndFarms", higherLyDCtrl.findScenarioBreedAndFarms);
api_higher_layer.post("/findShedsByFarmAndAvailability", higherLyDCtrl.findShedsByFarmAndAvailability);
api_higher_layer.post("/findIncPlantByPartnership", higherLyDCtrl.findIncPlantByPartnership);
api_higher_layer.get("/findBreed", higherLyDCtrl.findBreed);
api_higher_layer.get("/findBreedForGenderClass", higherLyDCtrl.findBreedForGenderClass);
api_higher_layer.post("/findAllScenariosProgrammedByStage", higherLyDCtrl.findAllScenariosProgrammedByStage);

// Rutas para servicios de la tabla slmdprocess
api_higher_layer.get("/findStageByBreedAvailable", higherLyDCtrl.findStageByBreedAvailable);
api_higher_layer.post("/findBreedByStageid", higherLyDCtrl.findBreedByStageid);
api_higher_layer.get("/findAllProcess", higherLyDCtrl.findAllProcess);
api_higher_layer.post("/findProcessByStageAndBreed", higherLyDCtrl.findProcessByStageAndBreed);
api_higher_layer.post("/findProcessByIncStage", higherLyDCtrl.findProcessByIncStage);
api_higher_layer.post("/addProcess", higherLyDCtrl.addProcess);
api_higher_layer.put("/updateProcess", higherLyDCtrl.updateProcess);
api_higher_layer.put("/updateDeletedProcess", higherLyDCtrl.updateDeletedProcess);


// Rutas para servicios de la tabla slmdmachinegroup
api_higher_layer.post("/findAllMachineGroup", higherLyDCtrl.findAllMachineGroup);
api_higher_layer.post("/findMachineGroupByDayOfWork", higherLyDCtrl.findMachineGroupByDayOfWork);
api_higher_layer.post("/addMachineGroup", higherLyDCtrl.addMachineGroup);
api_higher_layer.put("/updateMachineGroup", higherLyDCtrl.updateMachineGroup);
api_higher_layer.put("/updateDeletedMachineGroup", higherLyDCtrl.updateDeletedMachineGroup);

// Rutas para servicios de la tabla slmdgenderclassification
api_higher_layer.get("/findAllGenderCl", higherLyDCtrl.findAllGenderCl);
api_higher_layer.post("/addGenderCl", higherLyDCtrl.addGenderCl);
api_higher_layer.put("/updateGenderCl", higherLyDCtrl.updateGenderCl);
api_higher_layer.put("/updateDeletedGenderCl", higherLyDCtrl.updateDeletedGenderCl);

// Rutas para servicios de la tabla slmdevictionpartition  
api_higher_layer.get("/findAllEvictionPartition", higherLyDCtrl.findAllEvictionPartition);
api_higher_layer.post("/addEvictionPartition", higherLyDCtrl.addEvictionPartition);
api_higher_layer.put("/updateEvictionPartition", higherLyDCtrl.updateEvictionPartition);
api_higher_layer.put("/updateDeletedEvictionPartition", higherLyDCtrl.updateDeletedEvictionPartition);
api_higher_layer.put("/updateActiveEvictionPartition", higherLyDCtrl.updateActiveEvictionPartition);

// Eliminaciones en cascada de las etapas
api_higher_layer.delete("/", higherLyDCtrl.deleteByStage);

module.exports = api_higher_layer;
