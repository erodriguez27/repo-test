const express = require("express");
const config = require("../config");

const abaElementsCtrl = require("../postgresql/controllers/abaElements");

const apiAbaElements = express.Router();

apiAbaElements.get("/", abaElementsCtrl.findAll);
apiAbaElements.post("/", abaElementsCtrl.add);
// apiAbaElements.post('/loadBatch', abaElementsCtrl.addAbaElements);
apiAbaElements.post("/findById", abaElementsCtrl.findById);
apiAbaElements.post("/findByCode", abaElementsCtrl.findByCode);
apiAbaElements.post("/findByName", abaElementsCtrl.findByName);
apiAbaElements.put("/", abaElementsCtrl.update);
apiAbaElements.delete("/", abaElementsCtrl.delete);

module.exports = apiAbaElements;
