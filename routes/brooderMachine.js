const express = require("express");
const config = require("../config");

const brooderMachineCtrl = config.driver === "postgres" ? require("../postgresql/controllers/brooderMachine") : require("./hcp/controllers/brooderMachine");

const api_brooder_machine = express.Router();


api_brooder_machine.post("/", brooderMachineCtrl.addBrooderMachine);
api_brooder_machine.post("/findMachineByPartnership", brooderMachineCtrl.findMachineByPartnership);
//api_breed.put('/', breedCtrl.updateBreed);


module.exports = api_brooder_machine;
