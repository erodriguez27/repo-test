// Utilities:
const assert = require("assert");

// Modelos intermedios:
const capaDBCalendarDay = require("../models/calendarDay");
const capaDBCalendar = require("../models/Calendar");

// Funciones privadas:

/* Función generadora de días: */
async function runDays(calendar, holidays) {
    calendar[0].year_start= calendar[0].year_start-1;
    let startDate = new Date(`${calendar[0].year_start}/01/01`);
    let endDate = new Date(`${calendar[0].year_end}/12/31`);
    let cId = calendar[0].calendar_id;
    let actualDate = startDate;
    let sequencer = 1;
    let stop = false;
    let result;
    let day = {};
    let isHoliday = null;
    let week = new Date(startDate);

    // sábados laborables?
    let workingSat = calendar[0].saturday === "Laborable"? true : false;
    // Domingos laborables?
    let workingSund = calendar[0].sunday === "Laborable"? true: false;
    let errorObj = null;

    /*Verificar cuando comienza la semana del anio*/
    let initWeekN = calendar[0].week_start;//Inicio de semana para el calendario

    let initWeek = 0;
    if(initWeekN === "Monday"){
        initWeek = 1;
    }
    let dayWeek =  diaSemana(week.getDate(),week.getMonth() + 1,week.getFullYear());

    if(initWeek===dayWeek){
        //El dia que inicia el anio corresponde con el inicio de semana
        //week = new Date(startDate);
        let day  = week.getDate();
        let anio = week.getFullYear();
        let month = week.getMonth() + 1;
        week = new Date(anio+"/"+month+"/"+day);

    }else if( diaSemana(week.getDate()+1,week.getMonth() + 1,week.getFullYear()) == initWeek){
        //El siguiente dia de anio corresponde con el inicio de semana
        let day  = week.getDate()+1;
        let anio = week.getFullYear();
        let month = week.getMonth() + 1;
        week = new Date(anio+"/"+month+"/"+day);
    }else if(initWeek == 0){
        //La semana empieza un domingo
        let day  = (31-dayWeek)+1;
        let anio = week.getFullYear()-1;
        week = new Date(anio+"/12/"+day);
    }else{
        //La semana comienza un lunes
        let day  = (31-dayWeek)+2;
        let anio = week.getFullYear()-1;
        week = new Date(anio+"/12/"+day);
    }
    actualDate = new Date(week);
    /**/
    while( !stop ) {

        if ( actualDate.getFullYear() === endDate.getFullYear() && actualDate.getMonth() + 1 === 12 && actualDate.getDate() === 31 ) {
            stop = true;
        }

        // Creamos el objeto a insertar en BD:
        day.date = actualDate;
        day.year = actualDate.getFullYear();
        day.month = actualDate.getMonth() + 1;
        day.day = actualDate.getDate();
        if (!actualDate.getDay()) 
    		day.week_day = 7;
        else
    		day.week_day = actualDate.getDay();
        day.week = week;
        

        // Determinar que la fecha actual es feriada:
        isHoliday = holidays.find( day => {
            if( (day.year === 0 && day.day === actualDate.getDate() && day.month === actualDate.getMonth() + 1) ||
                (day.year === actualDate.getFullYear() && day.day === actualDate.getDate() && day.month === actualDate.getMonth() + 1) ) {
                return true;
            } else {
                return false;
            }
        });

        if ( isHoliday ) {
            day.working_day = 0;
            day.sequence = 0;
        } else {
            if ( actualDate.getDay() === 0 && !workingSund ) {
                day.working_day = 0;
                day.sequence = 0;
            } else if ( actualDate.getDay() === 6 && !workingSat ) {
                day.working_day = 0;
                day.sequence = 0;
            } else {
                day.working_day = 1;
                day.sequence = sequencer;
                sequencer++;
            }
        }
        result = await capaDBCalendarDay.insertDay( day, cId );

        // Generamos el siguiente día:
        actualDate.setDate( actualDate.getDate() + 1 );

        // Se hace el cambio de semana cuando sea el último día de la semana:
        if ( day.week_day === 7 ) {
            week = new Date(actualDate);
        }

        // Limpiamos el objeto auxiliar:
        day = {};
    }
}

function diaSemana(dia,mes,anio){
    var dt = new Date(mes+"/"+dia+"/"+anio);
    //var dt = new Date(dia, mes, anio);
    return dt.getUTCDay();
}

// Funciones públicas:

async function generateCalendarDays(req, res) {
    let calendarId = req.body.calendarId;
    let runResult;

    try {
        // Calendario:
        let calendar = await capaDBCalendar.getCalendarById(calendarId);

        // Feriados para el calendario:
        // let holidays = await capaDBCalendar.getHolidaysForACalendar(calendarId);

        if (calendar.length !== 0) {
            // runResult = runDays(calendar, holidays);
            runResult = runDays(calendar, []);
            // Marcamos como generado el calendario:
            let toGenerated = capaDBCalendar.setToGenerated(calendarId);

            res.status(200).send({
                statusCode: 200,
                message: "Días generados"
            });
        } else {
            res.status(200).send({
                statusCode: 404,
                message: "Calendario no encontrado"
            });
        }
    } catch (err) {
        console.log(err);
        let errObj = {
            pgErrorCode: err.code,
            statusCode: 500
        };
        res.status(500).send(errObj);
    }
}



async function findDateBySequence(req, res){
    try {
        let columns = await DBlayer.DBfindDateBySequence(req.body.sequence, req.body.calendar_id);
        res.status(200).send({
            statusCode: 200,
            msg: "success",
            data: columns
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }

}


// Exports:
module.exports = {
    generateCalendarDays,
    findDateBySequence,
    runDays
};
