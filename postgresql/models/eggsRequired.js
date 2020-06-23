const config = require("../../config");
const conn = require("../db");

function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }

    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBaddEggsRequired = records => {
    return conn.db.none("INSERT INTO public.txeggs_required (use_month, use_year, scenario_id, required, breed_id) "+
                      "VALUES $1", Inserts("${_month},${_year},${scenario_id}, ${required}, ${breed_id}",records));

};

exports.DBDeleteEggsRequired = function(scenario_id, breed_id) {
    return conn.db.none("DELETE FROM public.txeggs_required WHERE scenario_id = $1 and breed_id = $2 ",
        [scenario_id, breed_id]);
};


exports.DBfindEggsRequiredByScenarioAndYear = function(scenario_id, year, breed_id) {
    return conn.db.any("SELECT use_month as _month, use_year as _year, scenario_id, required, breed_id "+
                       "FROM public.txeggs_required "+
                       "where scenario_id = $1 and _year=$2 and breed_id =$3 "+
                       "order by _month ASC", [scenario_id, year, breed_id]);
};


exports.DBdeleteEggsRequiredByScenario = function(scenario_id, breed_id) {
    return conn.db.none("DELETE FROM public.txeggs_required WHERE scenario_id = $1",[scenario_id]);
};