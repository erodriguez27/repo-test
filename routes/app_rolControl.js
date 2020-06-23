const express = require("express");
const config = require("../config");


const userApp_RolControlCtrl = config.driver === "postgres" ? require("../postgresql/controllers/app_rolControl") : require("./hcp/controllers/user_appControl");

var api_appRoles = express.Router();

api_appRoles.post("/otbenerApps", userApp_RolControlCtrl.otbenerApps);
api_appRoles.post("/otbenerAppXrol", userApp_RolControlCtrl.otbenerAppXrol);
api_appRoles.post("/otbenerAppXrolEnEspecial", userApp_RolControlCtrl.otbenerAppXrolEnEspecial);
api_appRoles.post("/AddRolXApps", userApp_RolControlCtrl.AddRolXApps);
api_appRoles.post("/GetName", userApp_RolControlCtrl.GetName);
api_appRoles.post("/findRolId", userApp_RolControlCtrl.findRolId);
api_appRoles.post("/updateRole", userApp_RolControlCtrl.updateRole);
api_appRoles.post("/updateRolName", userApp_RolControlCtrl.updateRolName);
api_appRoles.post("/updateAppsXRol", userApp_RolControlCtrl.updateAppsXRol);

module.exports = api_appRoles;