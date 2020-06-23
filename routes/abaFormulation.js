const express = require("express");
const config = require("../config");

const abaFormulationCtrl = require("../postgresql/controllers/abaFormulation");

const apiAbaFormulation = express.Router();

apiAbaFormulation.get("/", abaFormulationCtrl.findAll);
apiAbaFormulation.post("/", abaFormulationCtrl.add);
apiAbaFormulation.post("/addFormula", abaFormulationCtrl.addFormula);
// apiAbaFormulation.post('/loadBatch', abaFormulationCtrl.addAbaElements);
apiAbaFormulation.post("/findById", abaFormulationCtrl.findById);
apiAbaFormulation.post("/findByCode", abaFormulationCtrl.findByCode);
apiAbaFormulation.post("/findByName", abaFormulationCtrl.findByName);
// apiAbaFormulation.post('/findByName', abaFormulationCtrl.findByName);
apiAbaFormulation.put("/", abaFormulationCtrl.update);
apiAbaFormulation.put("/updateFormula", abaFormulationCtrl.updateFormula);
apiAbaFormulation.delete("/", abaFormulationCtrl.delete);

module.exports = apiAbaFormulation;
