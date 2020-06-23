const DBlayer = require("../models/Holiday");
const calendar = require("../models/Calendar");
/*
  Funcion POST : Se encarga de insertar un dia feriado a la DB
  Param: calendar_id Se envia en el cuerpo
*/
exports.addHoliday = function(req, res) {

    res.status(200).json({
        statusCode: 200,
        data: data
    });
    // DBlayer.DBaddHoliday(req.body.calendar_id, req.body.year, req.body.month, req.body.day, req.body.description)
    //     .then(function(data) {
    //         res.status(200).json({
    //             statusCode: 200,
    //             holiday_id: data.holiday_id
    //         });
    //     })
    //     .catch(function(err) {
    //         res.status(500).send(err);
    //     });
};
/*
  Funcion que devuele todos los feriados dado un calendario
*/
exports.findHolidaysForACalendar = function(req, res) {
    let holidays=[];
    calendar.getCalendarByCode(req.params.code)
        .then(function(data) {
            // return DBlayer.DBfindHolidaysForACalendar(data.calendar_id);
            return holidays;
        })
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

/*
  Funcion POST: Se encarga de copiar los dias feriado de un calendario a otro
  Param: calendar_id  Calendario a copiar los dias feriados
          Code        Codigo del calendario a copiar los dias feriados
*/
// exports.addHolidaysCalendar = function(req, res) {

//     DBlayer.DBaddHolidaysCalendar(req, res)
//         .then(function(data) {
//             res.status(200)
//                 .json({
//                     statusCode: 200,
//                     data: data
//                 });
//         })
//         .catch(function(err) {

//             res.status(500).send(err);

//         });
// };

// function verifyHolidaysWithoutCalendar(data, req_array) {
//     let results = [];
//     //console.log(data);
//     //console.log(req_array);
//     //let req_array = req.body.data;
//     let res = req_array.filter(obj => {

//         const exists = data.some(obj2 => (obj2.day == obj.day && obj2.year == obj.year && obj2.month == obj.month));

//         if (!exists) {
//             console.log(exists);
//             results.push(obj);
//         } else console.log(exists);
//     });
//     return results;
// }

exports.addHolidaysCalendar2 = function(req, res) {
    let holidays=[];

    calendar.getCalendarByCode(req.body.codeD)
        .then(function(data) {
            req.body.calendarD = data.calendar_id;
            req.body.year_startD = data.year_start;
            req.body.year_endD = data.year_end;
            return holidays;
            // return calendar.getCalendarByCode(req.body.codeO);
        })
        .then(function(data) {
            req.body.calendarO = data.calendar_id;
            req.body.year_startO = data.year_start;
            req.body.year_endO = data.year_end;
            // return DBlayer.DBfindHolidaysForACalendar(data.calendar_id);
            return holidays;

        })
        .then(function(data) {
            var results = [];

            for (var i in data) {
                let obj = {};
                obj.calendar_id = req.body.calendarD;
                obj.year = data[i].year;
                obj.month = data[i].month;
                obj.day = data[i].day;
                obj.description = data[i].description;

                if(((obj.year!==0) && (req.body.year_startD<= obj.year) && (obj.year<=req.body.year_endD)) || (obj.year===0)){
                    results.push(obj);
                }
            }
            req.body.resultO = results;
            return holidays;
            // return DBlayer.DBfindHolidaysForACalendar(req.body.calendarD);
        })
        .then(function(data) {
            if (data.length == 0) {
                // return DBlayer.DBaddHolidaysCalendar2(req.body.resultO);
                return true;
            }
            let results = [];
            for (var i in data) {
                let obj = {};
                obj.calendar_id = req.body.calendarD;
                obj.year = data[i].year;
                obj.month = data[i].month;
                obj.day = data[i].day;
                obj.description = data[i].description;
                results.push(obj);
            }
            req.body.resultD = results;
            // let records = verifyHolidaysWithoutCalendar(req.body.resultD, req.body.resultO);
            // return DBlayer.DBaddHolidaysCalendar2(records);
            return true;
        })
        .then(function(recordsD) {
            console.log(recordsD);
            if (!recordsD) return res.status(200).json({
                statusCode: 200
            });

            res.status(200).send({
                statusCode: 500,
                error: "No existen elementos a insertar"
            });

        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);

        });
};

// function verifyHolidays(data, req_array) {
//     let results = [];
//     //let req_array = req.body.data;
//     let res = req_array.filter(obj => {

//         const exists = data.some(obj2 => (obj2.day == obj.day && obj2.year == obj.year && obj2.calendar_id == obj.calendar_id && obj2.month == obj.month));

//         if (!exists) {
//             results.push(obj);
//         }
//     });
//     return results;
// }


//Añade nuevos feriados a un calendario
exports.addNewHolidaysCalendar = function(req, res) {
    let holidays= [];
    let recurrent = 1;
    if (req.body.data[0].year !== 0) recurrent = 0;

    res.status(200).json({statusCode: 200 });

    // DBlayer.DBdeleteHolidayS(req.body.data[0].calendar_id, recurrent)
    //     .then(function(data) {
    //         return DBlayer.DBfindHolidaysForACalendar(req.body.data[0].calendar_id);
    //     })
    //     .then(function(data) {

    //         let results = verifyHolidays(data, req.body.data);
    //         return DBlayer.DBaddHolidaysCalendar2(results);
    //     })
    //     .then(function() {
    //         res.status(200)
    //             .json({
    //                 statusCode: 200
    //             });
    //     })
    //     .catch(function(err) {
    //         res.status(500).send(err);
    //     });
};

exports.deleteHoliday = function(req, res) {

    res.status(200).json({
        statusCode: 200,
        data: data
    });
    
    // for (let i = 0; i < req.body.holidays.length; i++) {

    //     req.body.day = req.body.holidays[i].day;
    //     req.body.month = req.body.holidays[i].month;
    //     req.body.year = req.body.holidays[i].year;

    //     DBlayer.DBdeleteHolidayS(req, res)
    //         .then(function() {

    //         })
    //         .catch(function() {
    //             res.status(500).send(err);

    //         });
    // }
    // res.status(200)
    //     .json({
    //         status: 'success'
    //     });

};

// exports.deleteHoliday = function(req, res) {

//     calendar.getCalendarByCode(req.body.code)
//         .then(function(data) {
//             return DBlayer.DBdeleteHolidayS(data.calendar_id, req.body.recurrent);
//         })
//         .then(function() {
//             res.status(200)
//                 .json({
//                     statusCode: 200
//                 });
//         })
//         .catch(function() {
//             res.status(500).send(err);

//         });
// };
