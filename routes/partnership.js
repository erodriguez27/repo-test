const express = require("express");
const config = require("../config");

const partnershipCtrl = config.driver === "postgres" ? require("../postgresql/controllers/partnership") : require("./hcp/controllers/partnership");

const api_partnership = express.Router();

api_partnership.get("/", partnershipCtrl.findAllPartnership);
api_partnership.post("/", partnershipCtrl.addPartnership);
api_partnership.post("/findPartnershipByFarmType", partnershipCtrl.findPartnershipByFarmType);
api_partnership.post("/findFarmByPartnership", partnershipCtrl.findFarmByPartnership);
api_partnership.post("/findIdByCode", partnershipCtrl.findIdByCode);
api_partnership.post("/isBeingUsed", partnershipCtrl.isBeingUsed);
api_partnership.put("/", partnershipCtrl.updatePartnership);
api_partnership.delete("/", partnershipCtrl.deletePartnership);
// api_partnership.post('/bulk', partnershipCtrl.bulkAddPartnership);

module.exports = api_partnership;
