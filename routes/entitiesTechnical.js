const express = require("express");
const entitiesCtrl = require("../postgresql/controllers/entities");
const apiEntities = express.Router();

apiEntities.get("/", entitiesCtrl.getAll);

module.exports = apiEntities;