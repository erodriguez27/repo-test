const express = require("express");
const config = require("../config");

const abaElementsAndConcentrationsCtrl = require("../postgresql/controllers/abaElementsAndConcentrations");

const apiAbaElementsAndConcentrations = express.Router();

apiAbaElementsAndConcentrations.get("/", abaElementsAndConcentrationsCtrl.findAll);
apiAbaElementsAndConcentrations.post("/", abaElementsAndConcentrationsCtrl.add);
// apiAbaElementsAndConcentrations.post('/loadBatch', abaElementsAndConcentrationsCtrl.addAbaElements);
apiAbaElementsAndConcentrations.post("/findById", abaElementsAndConcentrationsCtrl.findById);
apiAbaElementsAndConcentrations.post("/findByFormulationId", abaElementsAndConcentrationsCtrl.findByFormulationId);
apiAbaElementsAndConcentrations.put("/", abaElementsAndConcentrationsCtrl.update);
apiAbaElementsAndConcentrations.delete("/", abaElementsAndConcentrationsCtrl.delete);

module.exports = apiAbaElementsAndConcentrations;
