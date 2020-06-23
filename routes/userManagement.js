const express = require("express");
const config = require("../config");

const userManagementCtrl = config.driver === "postgres" ? require("../postgresql/controllers/userManagement") : require("./hcp/controllers/userManagement");

const api_userM = express.Router();

api_userM.get("/", userManagementCtrl.findUsers);
api_userM.post("/", userManagementCtrl.findApps);
api_userM.post("/addUser", userManagementCtrl.addUser);
api_userM.get("/findUserIds", userManagementCtrl.findUserIds);
// api_userM.post('/addUser_app', userManagementCtrl.addUser_app);
api_userM.put("/", userManagementCtrl.editUserType);
api_userM.post("/findUsername", userManagementCtrl.findUsername);

api_userM.get("/findRol", userManagementCtrl.findRol);
api_userM.get("/findApps", userManagementCtrl.findApps);
/*
api_userM.post('/', userManagementCtrl.addUser);
api_userM.put('/', userManagementCtrl.updateUserPermissions);
api_userM.delete('/', userManagementCtrl.deleteUser);
*/

module.exports = api_userM;