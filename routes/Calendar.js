const express = require("express");
const config = require("../config");

const calendarCtrl = config.driver === "postgres" ? require("../postgresql/controllers/Calendar") : require("./hcp/controllers/Calendar");

const api_calendar = express.Router();

// EndPoint que permite obtener todos los calendarios almacenados en la BD:
api_calendar.get("/getAllCalendar", calendarCtrl.findAllCalendar);
api_calendar.get("/getCalendars", calendarCtrl.getCalendars);
api_calendar.post("/", calendarCtrl.saveCalendar);
api_calendar.get("/findHolidaysForCalendar/:code", calendarCtrl.findHolidaysForCalendar);
api_calendar.delete("/", calendarCtrl.deleteCalendar);
api_calendar.put("/", calendarCtrl.updateCalendar);
api_calendar.get("/getCalendarScenarioYears", calendarCtrl.getCalendarScenarioYears);


module.exports = api_calendar;
