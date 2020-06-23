const express = require("express");
const config = require("../config");

const breedCtrl = config.driver === "postgres" ? require("../postgresql/controllers/breed") : require("./hcp/controllers/Calendar");

const api_breed = express.Router();

//  **** Inicio ConfTecnica 

api_breed.get("/", breedCtrl.findAllBreed);
api_breed.post("/", breedCtrl.addBreed);
api_breed.post("/isBeingUsed", breedCtrl.isBeingUsed);
api_breed.put("/", breedCtrl.updateBreed);
api_breed.delete("/", breedCtrl.deleteBreed);
api_breed.get("/findBreedByCurve", breedCtrl.findBreedByCurve);
api_breed.get("/findAllBreedWP", breedCtrl.findAllBreedWP);

// **** Fin ConfTecnica

api_breed.get("/findBreedByCode/:code", breedCtrl.findBreedByCode);

module.exports = api_breed;
