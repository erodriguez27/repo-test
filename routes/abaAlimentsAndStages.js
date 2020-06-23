const express = require("express");
const config = require("../config");

const abaAlimentsAndStagesCtrl = require("../postgresql/controllers/abaAlimentsAndStages");

const apiAbaAlimentsAndStages = express.Router();

apiAbaAlimentsAndStages.get("/", abaAlimentsAndStagesCtrl.findAll);
apiAbaAlimentsAndStages.post("/", abaAlimentsAndStagesCtrl.add);
// apiAbaAlimentsAndStages.post('/loadBatch', abaAlimentsAndStagesCtrl.addAbaElements);
apiAbaAlimentsAndStages.post("/findById", abaAlimentsAndStagesCtrl.findById);
apiAbaAlimentsAndStages.post("/findByCode", abaAlimentsAndStagesCtrl.findByCode);
apiAbaAlimentsAndStages.post("/findByName", abaAlimentsAndStagesCtrl.findByName);
apiAbaAlimentsAndStages.put("/", abaAlimentsAndStagesCtrl.update);
apiAbaAlimentsAndStages.delete("/", abaAlimentsAndStagesCtrl.delete);

module.exports = apiAbaAlimentsAndStages;
