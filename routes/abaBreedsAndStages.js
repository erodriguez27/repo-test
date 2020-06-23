const express = require("express");
const config = require("../config");

const abaBreedsAndStagesCtrl = require("../postgresql/controllers/abaBreedsAndStages");

const apiAbaBreedsAndStages = express.Router();

apiAbaBreedsAndStages.get("/", abaBreedsAndStagesCtrl.findAll);
apiAbaBreedsAndStages.get("/withProcessInfo", abaBreedsAndStagesCtrl.findAllWithProcessInfo);
apiAbaBreedsAndStages.post("/", abaBreedsAndStagesCtrl.add);
apiAbaBreedsAndStages.post("/addBreedsAndStageWithStages", abaBreedsAndStagesCtrl.addBreedsAndStageWithStages);
// apiAbaBreedsAndStages.post('/loadBatch', abaBreedsAndStagesCtrl.addAbaElements);
apiAbaBreedsAndStages.post("/findById", abaBreedsAndStagesCtrl.findById);
apiAbaBreedsAndStages.post("/findByCode", abaBreedsAndStagesCtrl.findByCode);
apiAbaBreedsAndStages.post("/findByName", abaBreedsAndStagesCtrl.findByName);
apiAbaBreedsAndStages.put("/", abaBreedsAndStagesCtrl.update);
apiAbaBreedsAndStages.put("/updateBreedsAndStageWithStages", abaBreedsAndStagesCtrl.updateBreedsAndStageWithStages);
apiAbaBreedsAndStages.delete("/", abaBreedsAndStagesCtrl.delete);

module.exports = apiAbaBreedsAndStages;
