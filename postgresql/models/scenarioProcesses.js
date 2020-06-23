const config = require("../../config");
const assert = require("assert");
// Conexión a la BD:
const conn = require("../db");

function insertRecords(records) {
    // Multiples inserts en una misma promesa:
    let cs = new conn.pgp.helpers.ColumnSet(["process_id", "decrease_goal", "weight_goal", "duration_goal", "scenario_id"], {
        table: "txscenarioprocess"
    });
    let query = conn.pgp.helpers.insert(records, cs);

    let promise = conn.db.none(query);

    return promise;
}



function getGetAllScenarioProcById(scenario_id) {
    let promise = conn.db.many("SELECT scenario_process_id, a.process_id,b.name, decrease_goal, weight_goal, duration_goal, scenario_id, c.name as product_name, "+
                             "c.product_id, historical_decrease, theoretical_decrease ,historical_weight ,theoretical_weight, historical_duration , theoretical_duration "+
                             "FROM public.txscenarioprocess a "+
                             "LEFT JOIN public.mdprocess b on a.process_id = b.process_id "+
                             "LEFT JOIN public.mdproduct c on b.product_id = c.product_id "+
                             "WHERE scenario_id = $1 ORDER BY b.process_order ASC;", [scenario_id]);
    return promise;
}

function getScenarioProcById(process_id, scenario_id) {
    return conn.db.many("SELECT * FROM public.txscenarioprocess WHERE process_id = $1 AND scenario_id = $2;", [process_id, scenario_id]);
}

function BDupdateScenarioProcesses(objProcess) {
    var arr = Object.keys(objProcess);
    arr.shift();

    let query = conn.pgp.helpers.update(objProcess, arr, "txscenarioprocess") + " WHERE scenario_process_id = " + objProcess.scenario_process_id;
    let promise = conn.db.none(query);

    return promise;
}


function DBdeleteScenarioProcessByScenario(scenario_id){
    return conn.db.none("DELETE FROM public.txscenarioprocess WHERE scenario_id = $1",[scenario_id]);
}


module.exports = {
    insertRecords,
    getGetAllScenarioProcById,
    getScenarioProcById,
    BDupdateScenarioProcesses,
    DBdeleteScenarioProcessByScenario
};
