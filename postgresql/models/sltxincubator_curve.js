const config = require("../../config");
const conn = require("../db");

exports.DBinsertIncubatorPosture = function(records) {
        
    cs = conn.pgp.helpers.ColumnSet(["slposturecurve_id","slincubator_id","quantity"],
        {table: "sltxincubator_curve", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};

exports.DBUpdateIncubatorCurveQuantity = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slincubator_curve_id", {name: 'quantity', cast: 'integer'}],
        {table: "sltxincubator_curve", schema: "public"});


    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator_curve_id = t.slincubator_curve_id');

};

exports.DBfindRecordsByIncubatorId = function(slincubator_id) {

    return conn.db.any(`
            SELECT slincubator_curve_id
            FROM sltxincubator_curve          
            WHERE slincubator_id = $1 and sl_disable is not true`,
    [slincubator_id]);

};