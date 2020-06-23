const express = require("express");
const config = require("../config");

const abaElementsPropertiesCtrl = require("../postgresql/controllers/abaElementsProperties");

const apiAbaElementsProperties = express.Router();

apiAbaElementsProperties.get("/", abaElementsPropertiesCtrl.findAll);
apiAbaElementsProperties.post("/", abaElementsPropertiesCtrl.add);
// apiAbaElements.post('/loadBatch', abaElementsPropertiesCtrl.addAbaElements);
apiAbaElementsProperties.post("/findById", abaElementsPropertiesCtrl.findById);
apiAbaElementsProperties.post("/findByCode", abaElementsPropertiesCtrl.findByCode);
apiAbaElementsProperties.post("/findByName", abaElementsPropertiesCtrl.findByName);
apiAbaElementsProperties.put("/", abaElementsPropertiesCtrl.update);
apiAbaElementsProperties.delete("/", abaElementsPropertiesCtrl.delete);

module.exports = apiAbaElementsProperties;
