const config = require("../../config");
const conn = require("../db");

exports.DBfindAllPostureCurve = function() {
    return conn.db.any("SELECT * " +
                       "FROM txscenarioposturecurve ");
};

exports.DBfindPostureCurveByScenario = function(scenario_id, breed_id) {
    return conn.db.any("SELECT a.scenario_posture_id, a.posture_date, (a.eggs * b.execution_quantity) as eggs, a.scenario_id, a.housingway_detail_id, a.breed_id " +
                       "FROM txscenarioposturecurve a "+
                       "LEFT JOIN txhousingway_detail b on a.housingway_detail_id = b.housingway_detail_id "+
                       "WHERE scenario_id= $1 and breed_id = $2 order by posture_date ASC",
    [scenario_id, breed_id]);
};


function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }

    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBaddPostureCurve = function(records) {
//   console.log("BASA: ", records);
    let promise = conn.db.none("INSERT INTO txscenarioposturecurve (posture_date, "+
                             "eggs, scenario_id, housingway_detail_id, breed_id)  VALUES $1 ",
    Inserts("${posture_date}, ${eggs}, ${scenario_id}, "+
                                     "${housingway_detail_id}, ${breed_id} ", records));
    return promise;
};


exports.DBfindLotByScenario = function(scenario_id, breed_id, year) {
//   console.log("scenario_id, breed_id: ", scenario_id, breed_id);
    let init = year+"-01-01",
        end = year+"-12-31";
    return conn.db.any("SELECT a.scenario_posture_id, a.posture_date, a.eggs, a.scenario_id, "+
                       "a.housingway_detail_id, a.breed_id, b.execution_quantity "+
                       "FROM txscenarioposturecurve a "+
                       "LEFT JOIN txhousingway_detail b on a.housingway_detail_id = b.housingway_detail_id "+
                       "where scenario_id = $1 and breed_id = $2 "+
                       "and posture_date BETWEEN $3 AND $4 "+
                       "order by posture_date ASC", [scenario_id, breed_id, init , end ]);
};

// sum(b.execution_quantity) cambio
exports.DBfindEggByDate = function(scenario_id, init_date, end_date, breed_id,incubator_plant_id) {
    console.log("Llegue a egg by date: ", scenario_id, init_date, end_date, breed_id);
    return conn.db.any("SELECT SUM(a.eggs) as eggs, to_char(a.posture_date, 'YYYY-MM-DD 00:00:00')::TIMESTAMP as posture_date, "+
                         " 0 as goal, sum(b.execution_quantity) as execution_quantity,  b.incubator_plant_id, 0 as available, 0 as proyected, 0 as storage_quantity "+
                         "FROM txscenarioposturecurve a "+
                         "LEFT JOIN txhousingway_detail b on a.housingway_detail_id = b.housingway_detail_id "+
                         "WHERE scenario_id = $1 and posture_date BETWEEN $2 and (Case WHEN $3 <= NOW() THEN $3 ELSE  NOW() END) and breed_id = $4 and incubator_plant_id = $5 "+
                         "group by posture_date, incubator_plant_id "+
                         "order by posture_date ASC ", [scenario_id, init_date, end_date, breed_id,incubator_plant_id]);
};

exports.DBfindLotsByHousingDetail = function(hw) {
//   console.log("hw: ", hw);
    return conn.db.any("SELECT distinct lot " +
                       "FROM txhousingway_detail "+
                       "WHERE housingway_detail_id in ($1:csv) ", [hw]);
};
