const config = require("../../config");
const assert = require("assert");
// Conexión a la BD:
const conn = require("../db");

// Funciones:
// Devuelve todos los calendarios almacenados en la BD:
module.exports.DBgetAllCalendar = () => {
    let promise = conn.db.any("select * from txcalendar;");

    return promise;
};

// Devuelve el calendario que haga match con el Id suministrado a la función:
module.exports.getCalendarById = async cId => {
    let promise = await conn.db.any("SELECT * FROM public.txcalendar WHERE calendar_id = $1;", [cId]);

    return promise;
};

/*ATENCIÓN: MOVER ESTA FUNCIÓN AL MÓDULO HOLIDAYS*/
module.exports.getHolidaysForACalendar = cId => {
    let promise = conn.db.any("SELECT * FROM public.txholiday WHERE calendar_id = $1;", [cId]);

    return promise;
};

module.exports.DBfindHolidaysForCalendar = (code) =>{
    // console.log(code);
    let promise = conn.db.any("select * from txcalendar where code = $1;",[code]);

    return promise;
};

module.exports.isGenerated = code => {
    let promise = conn.db.oneOrNone("SELECT calendar_id FROM public.txcalendar WHERE code = $1 AND generated = 0", [code]);

    return promise;
};

module.exports.saveCalendar = calendar => {
    let promise = conn.db.one("INSERT INTO public.txcalendar(description, saturday, sunday, week_start, code, year_start, year_end, generated) values($1, $2, $3, $4, $5, $6, $7, $8) RETURNING * ;",
        [calendar.description, calendar.saturday, calendar.sunday, calendar.week_start, calendar.code.trim(), calendar.year_start, calendar.year_end, 0]);
    return promise;

};

module.exports.getCalendarByCode = code => {
    let promise = conn.db.one("SELECT calendar_id, year_start, year_end FROM public.txcalendar WHERE code = $1", [code]);

    return promise;
};

module.exports.deleteCalendar = cId => {
    let promise = conn.db.none("DELETE FROM public.txcalendar WHERE calendar_id = $1",[cId]);

    return promise;
};

module.exports.findGeneratedOrNot = generated => {
    let condition = generated == 0 ? 0 : 1;

    let promise = conn.db.any("SELECT * FROM public.txcalendar where generated = $1", [condition]);

    return promise;
};

module.exports.updateCalendar = calendar => {

    let promise = conn.db.none("UPDATE public.txcalendar SET description=$1, saturday=$2, sunday=$3, week_start=$4, year_start=$5, year_end=$6 WHERE code=$7;",
        [calendar.description, calendar.saturday, calendar.sunday, calendar.week_start, calendar.year_start, calendar.year_end, calendar.code]);

    return promise;
};

module.exports.setToGenerated = cId => {

    let promise = conn.db.none("UPDATE public.txcalendar SET generated=1 WHERE calendar_id=$1;",[cId]);

    return promise;
};

module.exports.getCalendScenarioYears = () => {
    console.log("le here")
    return  promise = conn.db.manyOrNone("SELECT a.calendar_id, b.code, b.description, b.year_start, b.year_end FROM public.mdprocess a " +
                                  "LEFT JOIN public.txcalendar b on a.calendar_id = b.calendar_id " +
                                  "GROUP BY a.calendar_id, b.code, b.description, b.year_start, b.year_end");
};
