const config = require("../../config");
const conn = require("../db");

/*
Funcion que añade un dia feriado a un calendario
*/

exports.DBaddHoliday = function(calendar_id, year, month, day, description) {

    return conn.db.one("INSERT INTO public.txholiday(calendar_id, year, month, day, description) VALUES ($1, $2, $3, $4, $5) RETURNING holiday_id", [calendar_id, year, month, day, description]);

};

// exports.DBfindHolidaysForACalendar = function(calendar_id) {

//     return conn.db.any('SELECT * FROM public.txholiday WHERE calendar_id = $1;', [calendar_id]);

// };

function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }

    this._rawDBType = true;
    this.formatDBType = function() {
        //console.log(data.map(d => '(' + conn.pgp.as.format(template, d) + ')').join(','));
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBaddHolidaysCalendar = function(req, res) {
    exports.DBfindHolidaysForACalendar(req.body.calendar_id)
        .then(function(data) {
            var results = [];

            for (var i = 0; i < data.length; i++) {
                let obj = {};
                obj.calendar_id = parseInt(req.body.calendar_id2);
                obj.year = data[i].year;
                obj.month = data[i].month;
                obj.day = data[i].day;
                obj.description = data[i].description;
                results.push(obj);
            }

            let promise = conn.db.none("INSERT INTO txholiday (calendar_id, year, month, day, description) VALUES $1",
                Inserts("${calendar_id}, ${year}, ${month}, ${day}, ${description}", results));
            return promise;

        })
        .catch(function(err) {
            // console.log("Malo");
            return promise;

        });
};

/*exports.DBfindHolidayDate = function(obj) {

    conn.pg.connect(conn.connectionString, (err, client) => {
        // Handle connection errors
        if (err) {
            // console.log(err);
            return 2;
        }
        // SQL Query > Select Data
        const query = client.query('SELECT * FROM items WHERE calendar_id=' + obj.calendar_id + ' AND day =' + obj.day + ' month=' + obj.month + ' AND year=' + obj.year);
        // Stream results back one row at a time
        query.on('row', (row) => {
            results.push(row);
        });
        // After all data is returned, close connection and return results
        query.on('end', () => {
            done();
            return results.length;
        });
    });
};*/
/*
  Funcion que retorna la cantidad de dias heliados dado un calendario, mes y anio
*/
/*exports.DBsumHolidaybyMonth = function(calendar_id, month, year){

  return conn.db.any('SELECT sum(working_day) as days FROM public.txcalendarday WHERE calendar_id = $1 and use_month = $2 and use_year = $3;', [calendar_id, month, year]);

};*/

exports.DBfindHolidaybyMonth = function(calendar_id, month, year){
    // return conn.db.any("SELECT calendar_day_id as id, use_day as day, use_month as month, use_year as year, "+
    //                 " use_week at time zone 'America/Caracas' as week, week_day, working_day, sequence, use_date "+
    //                 " FROM public.txcalendarday "+
    //                 " WHERE calendar_id = $1 and use_month = $2 and use_year = $3 and working_day=1;", [calendar_id, month, year]);

    return conn.db.any("SELECT calendar_day_id as id, use_day as day, use_month as month, use_year as year, "+
                    " use_week as week, week_day, working_day, sequence, use_date "+
                    " FROM public.txcalendarday "+
                    " WHERE calendar_id = $1 and use_month = $2 and use_year = $3 and working_day=1;", [calendar_id, month, year]);

};
/*
exports.DBaddHolidaysCalendar2 = function(holidays) {
    if (holidays.length === 0) {
        return Promise.resolve(true);
    }
    return promise = conn.db.none('INSERT INTO txholiday (calendar_id, year, month, day, description) VALUES $1',
        Inserts('${calendar_id}, ${year}, ${month}, ${day}, ${description}', holidays));

};

exports.DBdeleteHoliday = function(req, res) {

    let promise = conn.db.none('DELETE FROM txholiday WHERE calendar_id=$1 AND year=$2 AND month=$3 AND day=$4', [req.body.calendar_id, req.body.year, req.body.month, req.body.day]);

    return promise;
};

exports.DBdeleteHolidayS = function(calendar_id, recurrent) {
    let v_recurrent = '!=0';
    if (recurrent == 1) {
        v_recurrent = '=0';
    }

    return conn.db.none('DELETE FROM txholiday WHERE calendar_id=$1 AND year' + v_recurrent, [calendar_id])

};

exports.DBdeleteAll = cId => {

    let promise = conn.db.none('DELETE FROM public.txholiday WHERE calendar_id = $1', [cId]);

    return promise;
};
*/