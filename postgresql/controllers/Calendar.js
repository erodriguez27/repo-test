const capaDB = require("../models/Calendar");
const holiday = require("../models/Holiday");
const ctlCalendarDay = require("./calendarDay");
/*
  Este método devuelve todos los calendarios creados en la BD:
*/
function findAllCalendar(req, res, next) {
    capaDB.DBgetAllCalendar()
        .then( function(data) {
            res.status(200).json({ status: 200, data: data });
        })
        .catch( function(err) {
            res.status(500).send(err);
        });
}

function findHolidaysForCalendar(req, res) {
    let obj = {};
    let holidays=[];
    capaDB.DBfindHolidaysForCalendar(req.params.code)
        .then(function(data) {
            return data;
        }).then(function(data) {
            obj.calendar = data;
            // return holiday.DBfindHolidaysForACalendar(data[0].calendar_id);
            return holidays;
        })
        .then(function(data) {
            obj.holiday = data;
            obj.status = "sucess";
            res.status(200).json(obj);
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
}

/*
  A este servicio se le debe mandar por body la siguiente información:
  {
    "description": "Calendario básico de BRAYAN",
    "saturday": "NO Laborable",
    "sunday": "NO Laborable",
    "start_week": "Sunday",
    "code": "trsfg",
    "year_start": 2010,
    "year_end": 2017
  }
*/
async function saveCalendar( req, res, next ) {

    try {
        let isGenerated = await capaDB.isGenerated(req.body.code);

        if( isGenerated ) {
            res.status(200).send( { status: 500, mgs: "Existe" } );
        }
        else {
            let result = await capaDB.saveCalendar(req.body);

            if(result) {
                let calendars= [];
                calendars.push(result);
                let gCalendarDay= ctlCalendarDay.runDays(calendars, []);
                gCalendarDay= capaDB.setToGenerated(result.calendar_id);

                return res.status(200).send( { status: 200, calendarId: result } );
            }
            else{
                res.status(500).send( { statusCode: 500, error: "Error al guaardar calendario", errorCode: 500 } );
            }

            
        }   
    } catch (err) {
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }

}

/*
  A este servicio se le debe mandar por body lo siguiente:
    code: <código del calendario>
*/
async function deleteCalendar (req, res) {
    try {

        let calendar_id = await capaDB.getCalendarByCode( req.body.code );
        //let wasDeletedHoliday = await holiday.DBdeleteAll(calendar_id.calendar_id);
        let wasDeletedCalendar = await capaDB.deleteCalendar( calendar_id.calendar_id );

        return res.status(200).send( { status: 200, mgs: "Registro borrado" } );

    } catch (err) {
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
}

/*
  Este servicio retorna los calendarios según si son generados o no.
  Recibe un parámetro: generated, con posibles valores 1 o 0.
  Si es 1, entonces el servicio debe retornar los generados.
  Si es 0, entonces el servicio debe retornar los NO generados.
*/
function getCalendars (req, res) {
    // Validamos que el parámetro generated haya sido enviado, sino, retorno error 500.
    if (!req.query.generated) return res.status(200).send({ statusCode: 500, error: "Parámetros faltantes" });

    capaDB.findGeneratedOrNot(req.query.generated)
        .then( data => {
            res.status(200).send({ statusCode: 200, calendars: data });
        })
        .catch(err => {
            res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
        });
}

/*
  A este servcio se le debe mandar por body lo siguiente, por ejemplo:
  {
  	"code": "VNL01",
  	"description": "Calendario para Valencia",
  	"saturday": "NO Laborable",
  	"sunday": "NO Laborable",
  	"start_week": "Sunday",
  	"year_start": "2010",
  	"year_end": "2017"
  }
*/
function updateCalendar (req, res) {
    // Validamos que el parámetro generated haya sido enviado, sino, retorno error 500.
    if (!req.body.code) return res.status(200).send({ statusCode: 500, error: "Parámetros faltantes" });

    capaDB.getCalendarByCode(req.body.code)
        .then( data => {
            return capaDB.updateCalendar(req.body);
        } )
        .then( result => {
            return res.status(200).send({ statusCode: 200, msg: "Registro actualizado" });
        })
        .catch( err => {
            res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
        });

}

async function getCalendarScenarioYears(req, res) {
    let results = await capaDB.getCalendScenarioYears();
    try {
        return res.status(200).send({ statusCode: 200,data: results });
    } catch (err){
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }
}

module.exports = {
    findAllCalendar,
    saveCalendar,
    findHolidaysForCalendar,
    deleteCalendar,
    getCalendars,
    updateCalendar,
    getCalendarScenarioYears
};
