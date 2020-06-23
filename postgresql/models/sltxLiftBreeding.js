const config = require("../../config");
const conn = require("../db");


exports.DBfindLiftBreedingProgrammed = function(init_date, end_date, breed_id, farm_id, partnership_id, scenario_id) {
    return conn.db.any(`SELECT a.slliftbreeding_id, a.breed_id, a.farm_id, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date,
    TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.demand_birds, a.received_birds, a.associated, a.decrease, a.duration, a.slbreeding_id, p.programmed_quantity, 
    (a.execution_date is not null and a.received_birds is not null and a.demand_birds is not null ) as executed, (a.decrease is not null and a.duration is not null) as projected,
    c.name as farm_name, b.name as breed_name
                        FROM sltxliftbreeding a 
                        LEFT JOIN osfarm c on a.farm_id = c.farm_id 
                        LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
                        LEFT JOIN sltxbreeding p on a.slbreeding_id = p.slbreeding_id
                        WHERE a.partnership_id = $5 
                              and CASE WHEN $1 is not null  and $2 is not null THEN a.scheduled_date BETWEEN $1 and $2 ELSE TRUE END
                              and CASE WHEN $3 is not null THEN a.breed_id = $3 ELSE TRUE END
                              and CASE WHEN $4 is not null THEN a.farm_id = $4 ELSE TRUE END 
                              and a.scenario_id = $6
                              and a.sl_disable is not true order by a.slliftbreeding_id asc`, [init_date, end_date, breed_id, farm_id, partnership_id, scenario_id]);
};

exports.DBexecuteLiftBreeding = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slliftbreeding_id", {name: 'scheduled_date', cast: 'date'}, {name: 'execution_date', cast: 'date'}, {name: 'demand_birds', cast: 'integer'}, {name: 'received_birds', cast: 'integer'}],
        {table: "sltxliftbreeding", schema: "public"});

        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slliftbreeding_id = t.slliftbreeding_id')

    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slliftbreeding_id = t.slliftbreeding_id');

};

exports.DBsaveLiftBreedingDecrease = function(records) { 

    cs = conn.pgp.helpers.ColumnSet(["?slliftbreeding_id", {name: 'decrease', cast: 'double precision'}, {name:'duration', cast:'integer'}],
        {table: "sltxliftbreeding", schema: "public"});

        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slliftbreeding_id = t.slliftbreeding_id')

    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slliftbreeding_id = t.slliftbreeding_id');

};

exports.DBprojectIntoBreeding = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slbreeding_id", "mortality"],
        {table: "sltxbreeding", schema: "public"});


    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbreeding_id = t.slbreeding_id');

    // cs = conn.pgp.helpers.ColumnSet(["?slbreeding_id", {name: 'execution_date', cast: 'date'}, {name: 'execution_quantity', cast: 'integer'}, "mortality"],
    //     {table: "sltxbreeding", schema: "public"});

    //     console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbreeding_id = t.slbreeding_id')

    // return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbreeding_id = t.slbreeding_id');

};

exports.DBinsertProjectionByBreedingProgrammed = function(stage_id, scenario_id, partnership_id,
    breed_id, farm_id, demand_birds, scheduled_date,slbreeding_id) {

    return conn.db.one("INSERT INTO sltxliftbreeding (stage_id, "+
                        "scenario_id, partnership_id, breed_id, farm_id, demand_birds, scheduled_date ,slbreeding_id) "+
                        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING slliftbreeding_id ",
                        [stage_id, scenario_id, partnership_id,
                        breed_id, farm_id, demand_birds, scheduled_date, slbreeding_id]);

};
