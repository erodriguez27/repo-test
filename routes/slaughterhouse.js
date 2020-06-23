const express = require("express");
const config = require("../config");

const slaughterhouseCtrl = config.driver === "postgres" ? require("../postgresql/controllers/slaughterhouse") : require("./hcp/controllers/slaughterhouse");

const api_slaughterhouse = express.Router();

/*api_slaughterhouse.get('/', slaughterhouseCtrl.findAllPartnership);
api_slaughterhouse.post('/', slaughterhouseCtrl.addPartnership);
api_slaughterhouse.post('/findFarmByPartnership', slaughterhouseCtrl.findFarmByPartnership);
api_slaughterhouse.put('/', slaughterhouseCtrl.updatePartnership);
api_slaughterhouse.delete('/', slaughterhouseCtrl.deletePartnership);*/

api_slaughterhouse.post("/", slaughterhouseCtrl.addSlaughterhouse);
api_slaughterhouse.get("/", slaughterhouseCtrl.findAllSlaughterhouse);
api_slaughterhouse.put("/", slaughterhouseCtrl.updateslaughterhouse);
api_slaughterhouse.delete("/", slaughterhouseCtrl.deleteslaughterhouse);
module.exports = api_slaughterhouse;
