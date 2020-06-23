const config = require("../../config");

// Conexión a la BD:
const conn = require("../db");

exports.DBaddScenario = function(req, res) {
    console.log("insert:: ");
    console.log(req.body.description, req.body.date_start, req.body.date_end, req.body.name,  req.body.status);
    let promise = conn.db.one("INSERT INTO public.mdscenario(description, date_start, date_end, name, status) VALUES ($1, $2, $3, $4,$5) RETURNING scenario_id",[req.body.description, req.body.date_start, req.body.date_end, req.body.name,  req.body.status]);
    return promise;
};

exports.DBfindAllScenario = function(req, res) {
    let promise = conn.db.any("select * from mdscenario order by status DESC;");

    return promise;
};

exports.DBfindIdScenario = function(req, res) {
    let promise = conn.db.any("SELECT * FROM public.mdscenario WHERE scenario_id = $1;", [req.body.scenario_id]);

    return promise;
};

exports.findById = function(sId) {
    let promise = conn.db.oneOrNone("SELECT * FROM public.mdscenario WHERE scenario_id = $1;", [sId]);

    return promise;
};

exports.findByStatus = function(status){

    let promise = conn.db.oneOrNone("SELECT * FROM public.mdscenario WHERE status = $1;", [status]);

    return promise;
};

exports.findByName = function(name){

    let promise = conn.db.oneOrNone("SELECT * FROM public.mdscenario WHERE name = $1;", [name]);

    return promise;
};

exports.getEscenario = function ( id ) {
    let promise = conn.db.any("SELECT * FROM public.mdscenario WHERE mdscenario.scenario_id = $1", [id]);

    return promise;
};

exports.updateScenario = data => {
    let promise = conn.db.none("UPDATE public.mdscenario SET description = $1, date_start = $2, date_end = $3, name = $4 WHERE scenario_id = $5 ",[data.description, data.date_start, data.date_end, data.name, data.scenario_id]);

    return promise;
};

exports.updateStatus = (scenario_id, status) => {
    // console.log('Actualizar scenario_id : '+scenario_id+' status: '+status);
    let promise = conn.db.none("UPDATE public.mdscenario SET status = $1 WHERE scenario_id = $2",[status,scenario_id]);

    return promise;
};


exports.deleteScenario = scenarioId => {
    let promise = conn.db.none("DELETE FROM public.mdscenario WHERE scenario_id = $1",[scenarioId]);

    return promise;
};

exports.findLargerYear = () => {
    let promise = conn.db.one("SELECT MAX(year_start) FROM public.mdprocess LEFT JOIN public.txcalendar ON txcalendar.calendar_id = mdprocess.calendar_id;");

    return promise;
};

exports.findSmallerYear = () => {
    let promise = conn.db.one("SELECT MIN(year_end) FROM public.mdprocess LEFT JOIN public.txcalendar ON txcalendar.calendar_id = mdprocess.calendar_id;");

    return promise;
};

exports.DBactiveScenario = () =>{
    // console.log("Holas");
    let promise = conn.db.one("SELECT scenario_id, description, to_char(date_start, 'DD/MM/YYYY') as date_start, "+
                                "to_char(date_end, 'DD/MM/YYYY') as date_end, name "+
                                "FROM public.mdscenario "+
                                "WHERE status = 1");

    return promise;
};


exports.DBgetScenarioName = function ( name, excep ) {
    let promise = conn.db.manyOrNone("SELECT scenario_id FROM public.mdscenario WHERE mdscenario.name = $1 and  mdscenario.name <> $2 limit 1", [name, excep]);
    return promise;
};

exports.DBScenarioActive = function () {
    let promise = conn.db.any("SELECT distinct  1 FROM public.mdscenario WHERE mdscenario.status = 1");
    return promise;
};

exports.DBcheckDeletable = function (scenario_id) {

    let promise = conn.db.one(`
    SELECT DISTINCT housing_way_id is null and slbreeding_id is null as deletable 
    FROM mdscenario sc 
        LEFT JOIN txhousingway hw on sc.scenario_id = hw.scenario_id
        LEFT JOIN sltxbreeding br on sc.scenario_id = br.scenario_id
    WHERE sc.scenario_id = $1`, [scenario_id]);

    return promise;
};
