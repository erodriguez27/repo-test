const express = require("express");
const config = require("../config");

const scenarioFileExport = config.driver === "postgres" ? require("../postgresql/controllers/file") : require("./hcp/controllers/file");
const api_file_export = express.Router();

api_file_export.get("/fileExport", scenarioFileExport.fileExport);

module.exports = api_file_export;
