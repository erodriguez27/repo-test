const config = require("../../config");
const conn = require("../db");


exports.DBfindAllLotEggs = function() {
    return conn.db.any("SELECT lot_eggs_id, theorical_performance, TO_CHAR(week_date,'DD/MM/YYYY') as week_date, week FROM txlot_eggs order by week  ASC ");
};

exports.DBupdateAllLotEggs = (records) => {
    let query = conn.pgp.helpers.update(records, ["?lot_eggs_id", "theorical_performance"], "txlot_eggs") + " WHERE v.lot_eggs_id = t.lot_eggs_id";
    let promise = conn.db.none(query);

    return promise;

};
