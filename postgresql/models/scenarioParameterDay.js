const config = require("../../config");
const conn = require("../db");

function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }
    this._rawDBType = true;
    this.formatDBType = function() {
        //let fy = data.map(d => '(' + conn.pgp.as.format(template, d) + ')').join(',');
        //console.log(fy);
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBaddScenarioParameterDay = records => {
//   console.log("INSERT PARAMETER DAY");
    return conn.db.none("INSERT INTO public.txscenarioparameterday (use_day, parameter_id, units_day, scenario_id, sequence, use_month, use_year, week_day, use_week) VALUES $1",
        Inserts("${day}, ${parameter_id}, ${units_day}, ${scenario_id}, ${sequence}, ${month}, ${year}, ${week_day}, ${week}",records));

};

exports.DBdeleteScenarioParameterDay = (parameter_id,scenario_id,month,year) => {
    // console.log("DELETESE PARAMETER DAY");
    let promise = conn.db.none("DELETE FROM public.txscenarioparameterday WHERE parameter_id = $1 and scenario_id = $2 and use_month = $3 and use_year = $4 ", [parameter_id,scenario_id, month, year]);

    return promise;
};

/*
* Borrar todos los escenario asociados a un mismo Mes,Anio y Escenario
*/
exports.DBdeleteAllScenariosByMYS = (scenario_id,month,year) => {

    let promise = conn.db.none("DELETE FROM public.txscenarioparameterday WHERE scenario_id = $1 and use_month = $2 and use_year = $3 ", [scenario_id, month, year]);

    return promise;
};



exports.DBdeleteScenarioParameterDayByScenario = (scenario_id) => {
    return conn.db.none("DELETE FROM public.txscenarioparameterday WHERE scenario_id = $1",[scenario_id]);
};


exports.BDdeleteDays4ScenarioId = (id) => {
    return conn.db.none("DELETE FROM public.txscenarioparameterday WHERE scenario_id = $1",[id]);
};

