const config = require("../../config");
const assert = require("assert");
// Conexión a la BD:
const conn = require("../db");

function insertDay ( day, cId ) {

    let promise = conn.db.none(`INSERT INTO public.txcalendarday(calendar_id, use_date,
                        use_year, use_month, use_day, use_week, week_day, sequence, working_day)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [cId, day.date, day.year, day.month, day.day, day.week, day.week_day, day.sequence, day.working_day]);
    return promise;
}

function BDfindWeeksbyCalendar (calendar_id){

    // let promise = conn.db.many("SELECT use_date as date , use_year as year, use_month as month, use_day as day, use_week at time zone 'America/Caracas' as week, week_day FROM txcalendarday "+
    //                          "WHERE calendar_id = $1 and week_day in (1,7)  "+
    //                          "ORDER BY year, month, day ASC" , [calendar_id]);
    // return promise;

    let promise = conn.db.many("SELECT use_date as date , use_year as year, use_month as month, use_day as day, use_week as week, week_day FROM txcalendarday "+
                             "WHERE calendar_id = $1 and week_day in (1,7)  "+
                             "ORDER BY year, month, day ASC" , [calendar_id]);
    return promise;

}

function BDfindDateBySequence (sequence, calendar_id){

    let promise = conn.db.many("SELECT use_year as year, use_month as month, use_day as day, use_week at time zone 'America/Caracas' as week FROM txcalendarday "+
                             "WHERE sequence = $1 and calendar_id = $2 ", [sequence, calendar_id]);
    return promise;

    // let promise = conn.db.many("SELECT use_year as year, use_month as month, use_day as day, use_week as week FROM txcalendarday "+
    //                          "WHERE sequence = $1 and calendar_id = $2 ", [sequence, calendar_id]);
    // return promise;

}


module.exports = {
    insertDay,
    BDfindWeeksbyCalendar,
    BDfindDateBySequence
};
