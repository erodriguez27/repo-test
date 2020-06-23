const express = require("express");
const config = require("../config");

const stageCtrl = config.driver === "postgres" ? require("../postgresql/controllers/stage") : require("./hcp/controllers/stage");

const api_stage = express.Router();



api_stage.get("/", stageCtrl.findAllStage);
api_stage.post("/", stageCtrl.addStage);
api_stage.put("/", stageCtrl.updateStage);
api_stage.delete("/", stageCtrl.deleteStage);



module.exports = api_stage;
