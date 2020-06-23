const config = require("../../config");
const assert = require("assert");
// Conexión a la BD:
const conn = require("../db");


function getGetAllScenarioFormById(scenario_id) {
    let promise = conn.db.many("SELECT * FROM public.txscenarioformula WHERE scenario_id = $1;", [scenario_id]);

    return promise;
}

function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }
    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

function addScenarioFormula (results){

    return conn.db.none("INSERT INTO public.txscenarioformula (process_id, measure_id, sign, divider, duration, scenario_id, predecessor_id, parameter_id) VALUES $1",
        Inserts("${process_id}, ${measure_id}, ${sign}, ${divider}, ${duration}, ${scenario_id}, ${predecessor_id}, ${parameter_id}",results));

}

function DBdeleteAllFormula(scenario_id){
    return conn.db.none("DELETE FROM public.txscenarioformula WHERE scenario_id = $1",[scenario_id]);
}


module.exports = {
    getGetAllScenarioFormById,
    addScenarioFormula,
    DBdeleteAllFormula
};
