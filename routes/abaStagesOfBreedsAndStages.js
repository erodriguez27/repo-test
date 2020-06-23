const express = require("express");
const config = require("../config");

const abaStagesOfBreedsAndStagesCtrl = require("../postgresql/controllers/abaStagesOfBreedsAndStages");

const apiAbaStagesOfBreedsAndStages = express.Router();

apiAbaStagesOfBreedsAndStages.get("/", abaStagesOfBreedsAndStagesCtrl.findAll);
apiAbaStagesOfBreedsAndStages.post("/", abaStagesOfBreedsAndStagesCtrl.add);
// apiAbaStagesOfBreedsAndStages.post('/loadBatch', abaStagesOfBreedsAndStagesCtrl.addAbaElements);
apiAbaStagesOfBreedsAndStages.post("/findById", abaStagesOfBreedsAndStagesCtrl.findById);
apiAbaStagesOfBreedsAndStages.post("/findByName", abaStagesOfBreedsAndStagesCtrl.findByName);
apiAbaStagesOfBreedsAndStages.post("/findByIdBreedsAndStages", abaStagesOfBreedsAndStagesCtrl.findByIdBreedsAndStages);
apiAbaStagesOfBreedsAndStages.put("/", abaStagesOfBreedsAndStagesCtrl.update);
apiAbaStagesOfBreedsAndStages.delete("/", abaStagesOfBreedsAndStagesCtrl.delete);

module.exports = apiAbaStagesOfBreedsAndStages;
