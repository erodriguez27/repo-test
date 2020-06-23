const express = require("express");
const config = require("../config");
// Controlador para calendarDay según el driver:
const calendarDayCtrl = config.driver === "postgres" ? require("../postgresql/controllers/calendarDay") : require("./hcp/controllers/calendarDay");
// Instancia del Router de express:
const api_calendarDay = express.Router();

/* EndPoints: */
/*
  EndPoint que permite generar los días para un calendario creado, basándonos en los días feriados.
  Debe enviarse por parámetro:
    -ID del calendario a generar.
*/
api_calendarDay.post("/generateDays", calendarDayCtrl.generateCalendarDays );
api_calendarDay.post("/findDateBySequence", calendarDayCtrl.findDateBySequence );

/* Exports */
module.exports = api_calendarDay;
