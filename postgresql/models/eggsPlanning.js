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

exports.DBaddPlannedEggs = records => {
    return conn.db.none("INSERT INTO public.txeggs_planning (month_planning, year_planning, scenario_id, planned, breed_id) VALUES $1",
        Inserts("${month_planning},${year_planning},${scenario_id}, ${planned}, ${breed_id}",records));

};


exports.DBtruncatePlannedEggs = function() {

    return conn.db.none("TRUNCATE public.txeggs_planning ");

};



exports.DBfindEggs_planning = function() {
    return conn.db.any("SELECT * FROM public.txeggs_planning where year_planning=2018 order by month_planning ASC");
};


exports.DBfindEggsPlanningByScenarioAndYear = function(scenario_id, year, breed_id) {
    return conn.db.any("SELECT * "+
                       "FROM public.txeggs_planning "+
                       "where scenario_id = $1 and year_planning=$2 and breed_id =$3 "+
                       "order by month_planning ASC", [scenario_id, year, breed_id]);
};

exports.DBdeleteEggsPlanningByScenario = function(scenario_id, breed_id) {

    return conn.db.none("DELETE FROM public.txeggs_planning WHERE scenario_id = $1 and breed_id = $2 ",
        [scenario_id, breed_id]);

    return promise;
};


exports.DBdeleteEggsPlanningByScenarioOnly = function(scenario_id) {
    return conn.db.none("DELETE FROM public.txeggs_planning WHERE scenario_id = $1",[scenario_id]);
};