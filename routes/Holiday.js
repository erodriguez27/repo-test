const express = require("express");
const config = require("../config");

const holidayCtrl = config.driver === "postgres" ? require("../postgresql/controllers/Holiday") : require("./hcp/controllers/Holiday");

const api_holiday = express.Router();



api_holiday.get("/findHolidaysCalendar/:code", holidayCtrl.findHolidaysForACalendar);
api_holiday.post("/addHolidaysCalendar/", holidayCtrl.addHolidaysCalendar2);/*copiar calendario*/
api_holiday.post("/addNewHolidaysCalendar", holidayCtrl.addNewHolidaysCalendar); /*Anadir feriados al calendario dado un array de objectos*/
api_holiday.post("/addHoliday", holidayCtrl.addHoliday);
api_holiday.delete("/deleteHoliday",holidayCtrl.deleteHoliday);


module.exports = api_holiday;
