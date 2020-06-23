const config = require("../../config");
const conn = require("../db");


exports.DBfindProgrammedByIncId = function(slincubator) {
    return conn.db.any(`SELECT a.slincubator_detail_id, a.identifier, a.incubator_id, a.programmed_date, a.slmachinegroup_id, TO_CHAR(a.programmed_date, 'DD/MM/YYYY') as prog_date, a.programmed_quantity, a.decrease, a.real_decrease, a.duration, 
                            mg.name as incubator_name, ip.name as incubatorplant, ip.incubator_plant_id as incubatorplant_id,
                            (a.duration is not null and a.decrease is not null) as projected, a.real_decrease is not null as executed,
                            case when a.duration is not null then TO_CHAR(a.programmed_date+a.duration, 'YYYY-MM-DD') else TO_CHAR(a.programmed_date, 'YYYY-MM-DD') end as newdate
                        FROM sltxincubator_detail a 
                            LEFT JOIN slmdmachinegroup mg on a.slmachinegroup_id = mg.slmachinegroup_id
                            LEFT JOIN osincubatorplant ip on mg.incubatorplant_id = ip.incubator_plant_id 
                        WHERE a.incubator_id = $1 
                              and a.sl_disable is not true order by a.identifier asc, a.programmed_date asc`, [slincubator]);
};

exports.DBaddNewProgrammed = function(records) {
    console.log("Llego al model de DBaddNewProgrammed");
    console.log(records);
// "incubator_id", "programmed_date", "slmachinegroup_id", "programmed_quantity"
    cs = conn.pgp.helpers.ColumnSet(["incubator_id", "programmed_date", "slmachinegroup_id", "programmed_quantity", "identifier"],
    {table: "sltxincubator_detail", schema: "public"});
    
    return conn.db.any(conn.pgp.helpers.insert(records, cs) + ' RETURNING slincubator_detail_id');

};

exports.DBaddIncubatorLot = function(records) {
    console.log("Llego al model de DBaddIncubatorLot");
    console.log(records);
// "slincubator_detail_id", "slincubator_curve_id", "quantity"
    cs = conn.pgp.helpers.ColumnSet(["slincubator_detail_id", "slincubator_curve_id", "slsellspurchase_id","quantity"],
    {table: "sltxincubator_lot", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};

exports.DBsaveIncubatorDecrease = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slincubator_detail_id", {name: 'decrease', cast: 'double precision'}, "duration"],
        {table: "sltxincubator_detail", schema: "public"});

        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator_detail_id = t.slincubator_detail_id')

    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator_detail_id = t.slincubator_detail_id');

};

exports.DBexecuteIncubator = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slincubator_detail_id", {name: 'real_decrease', cast: 'double precision'}],
        {table: "sltxincubator_detail", schema: "public"});

        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator_detail_id = t.slincubator_detail_id')

    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator_detail_id = t.slincubator_detail_id');

};

exports.DBfindProgrammedByRangeAndPlant = function(slincubator, init_date, end_date, incubator_plant_id) {
    return conn.db.any(`SELECT a.slincubator_detail_id, a.incubator_id, a.programmed_date, a.slmachinegroup_id, TO_CHAR(a.programmed_date, 'DD/MM/YYYY') as prog_date, a.programmed_quantity, a.decrease, a.real_decrease, a.duration, 
                            mg.name as incubator_name, ip.name as incubatorplant, ip.incubator_plant_id as incubatorplant_id,
                            (a.duration is not null and a.decrease is not null) as projected, a.real_decrease is not null as executed,
                            case when a.duration is not null then TO_CHAR(a.programmed_date+a.duration, 'YYYY-MM-DD') else TO_CHAR(a.programmed_date, 'YYYY-MM-DD') end as newdate
                        FROM sltxincubator_detail a 
                            LEFT JOIN slmdmachinegroup mg on a.slmachinegroup_id = mg.slmachinegroup_id
                            LEFT JOIN osincubatorplant ip on mg.incubatorplant_id = ip.incubator_plant_id 
                        WHERE a.incubator_id = $1 and 
                                CASE WHEN $2 is not null  and $3 is not null THEN a.programmed_date BETWEEN $2 and $3 ELSE TRUE END
                                and CASE WHEN $4 is not null THEN ip.incubator_plant_id = $4 ELSE TRUE END
                            and a.sl_disable is not true order by a.programmed_date asc`, [slincubator, init_date, end_date, incubator_plant_id]);
};

exports.DBfindLastIdentifier = function() {
    
    let promise = conn.db.one("SELECT case when MAX(identifier::integer)::integer>0 then MAX(identifier::integer)::integer else 0 end as identifier FROM sltxincubator_detail");
    return promise;
};