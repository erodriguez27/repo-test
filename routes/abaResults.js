const express = require("express");
const config = require("../config");

const abaResultsCtrl = require("../postgresql/controllers/abaResults");

const apiAbaResults = express.Router();

apiAbaResults.get("/", abaResultsCtrl.findAll);
apiAbaResults.post("/", abaResultsCtrl.add);
// apiAbaResults.post('/loadBatch', abaResultsCtrl.addAbaElements);
apiAbaResults.post("/findById", abaResultsCtrl.findById);
apiAbaResults.put("/", abaResultsCtrl.update);
apiAbaResults.delete("/", abaResultsCtrl.delete);

module.exports = apiAbaResults;
