const config = require("../../config");
const conn = require("../db");

exports.DBinsertBreedingProgrammed = function(stage_id, scenario_id, partnership_id,breed_id, farm_id, 
                                        programmed_quantity, housing_date, start_posture_date, lot) {
                                            
    return conn.db.one("INSERT INTO sltxbreeding (stage_id, "+
                        "scenario_id, partnership_id, breed_id, farm_id, programmed_quantity, housing_date, start_posture_date, lot) "+
                        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9) RETURNING slbreeding_id ",
                        [stage_id, scenario_id, partnership_id,breed_id, farm_id, programmed_quantity, housing_date, start_posture_date, lot]);

};

exports.DBfindCenterById = function(shed, farm) {
    return conn.db.one(`select c.center_id, b.farm_id, a.shed_id
                        from osshed a
                        left join osfarm b on a.farm_id = b.farm_id
                        left join oscenter c on a.center_id = c.center_id
                        where a.shed_id = $1 and b.farm_id = $2`, [shed, farm]);
};

exports.DBfindBreedingById = function(id) {
    return conn.db.one(`SELECT a.slbreeding_id, d.name as name_scenario, d.scenario_id, c.name as name_breed, c.breed_id,
                                b.name as name_farm, b.farm_id, 
                                a.programmed_quantity, TO_CHAR(a.housing_date, 'DD/MM/YYYY') as housing_date, 
                                CASE WHEN lf.decrease is not null then CEIL(ROUND(lf.received_birds / (1+ (lf.decrease/100) ) ::NUMERIC,2)) ELSE null end as execution_quantity, 
                                CASE WHEN lf.duration is not null then TO_CHAR(lf.execution_date+lf.duration, 'DD/MM/YYYY') ELSE NULL END as execution_date, 
                                TO_CHAR(a.execution_date, 'DD/MM/YYYY') as ex_date,
                                TO_CHAR(a.start_posture_date, 'DD/MM/YYYY') as post_date, a.start_posture_date, a.lot, a.mortality, 
                                (a.duration is not null and a.decrease is not null) as projected, 
                                (a.execution_date is not null AND a.execution_quantity is not null) AS executed,
                                a.decrease, a.duration
                        FROM sltxbreeding a
                            LEFT JOIN osfarm b on a.farm_id = b.farm_id
                            LEFT JOIN mdbreed c on a.breed_id = c.breed_id
                            LEFT JOIN mdscenario d on a.scenario_id = d.scenario_id
                            LEFT JOIN sltxliftbreeding lf ON a.slbreeding_id = lf.slbreeding_id
                        where a.slbreeding_id = $1`, [id]);
};

exports.DBfindBreedingByFilter = function(farm,breed,date1,date2, partnership_id, scenario_id) {

    return conn.db.any(`SELECT a.slbreeding_id, d.name as name_scenario, d.scenario_id, c.name as name_breed, c.breed_id,
                                b.name as name_farm, b.farm_id, 
                                a.programmed_quantity, TO_CHAR(a.housing_date, 'DD/MM/YYYY') as housing_date, 
                                CASE WHEN lf.decrease is not null then CEIL(ROUND(lf.received_birds * (1- (lf.decrease/100) ) ::NUMERIC,2)) ELSE null end as execution_quantity, 
                                CASE WHEN lf.duration is not null then TO_CHAR(lf.execution_date+lf.duration, 'DD/MM/YYYY') ELSE NULL END as execution_date, 
                                TO_CHAR(a.execution_date, 'DD/MM/YYYY') as ex_date,
                                TO_CHAR(a.start_posture_date, 'DD/MM/YYYY') as post_date, a.start_posture_date, a.lot, a.mortality, 
                                (a.duration is not null and a.decrease is not null) as projected, 
                                (a.execution_date is not null AND a.execution_quantity is not null) AS executed,
                                a.decrease, a.duration
                        FROM sltxbreeding a
                             LEFT JOIN osfarm b on a.farm_id = b.farm_id
                             LEFT JOIN mdbreed c on a.breed_id = c.breed_id
                             LEFT JOIN mdscenario d on a.scenario_id = d.scenario_id
                             LEFT JOIN sltxliftbreeding lf ON a.slbreeding_id = lf.slbreeding_id
                        WHERE a.partnership_id = $5
                              and CASE WHEN $6 is not null THEN a.scenario_id = $6 ELSE TRUE END
                              and CASE WHEN $1 is not null THEN a.farm_id = $1 ELSE TRUE END
                              and CASE WHEN $2 is not null THEN a.breed_id = $2 ELSE TRUE END
                              and CASE WHEN $3 is not null  and $4 is not null THEN a.housing_date BETWEEN $3 and $4 ELSE TRUE END AND a.sl_disable is not true order by a.slbreeding_id asc`,
                        [farm,breed,date1,date2, partnership_id, scenario_id]);

    // return conn.db.any(`select  a.slbreeding_id, d.name as name_scenario, d.scenario_id, c.name as name_breed, c.breed_id,
    //                             b.name as name_farm, b.farm_id, 
    //                             a.programmed_quantity, TO_CHAR(a.housing_date, 'DD/MM/YYYY') as housing_date, a.execution_quantity, TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, TO_CHAR(a.execution_date, 'DD/MM/YYYY') as ex_date,
    //                             TO_CHAR(a.start_posture_date, 'DD/MM/YYYY') as post_date, a.start_posture_date, a.lot, a.mortality, (a.duration is not null and a.decrease is not null) as projected, (CASE WHEN a.executed is null THEN false ELSE a.executed END) AS executed,
    //                             a.decrease, a.duration
    //                     from sltxbreeding a
    //                             left join osfarm b on a.farm_id = b.farm_id
    //                             left join mdbreed c on a.breed_id = c.breed_id
    //                             left join mdscenario d on a.scenario_id = d.scenario_id
    //                     WHERE a.partnership_id = $5
    //                           and CASE WHEN $6 is not null THEN a.scenario_id = $6 ELSE TRUE END
    //                           and CASE WHEN $1 is not null THEN a.farm_id = $1 ELSE TRUE END
    //                           and CASE WHEN $2 is not null THEN a.breed_id = $2 ELSE TRUE END
    //                           and CASE WHEN $3 is not null  and $4 is not null THEN a.housing_date BETWEEN $3 and $4 ELSE TRUE END AND a.sl_disable is not true order by a.slbreeding_id asc`,
    //                     [farm,breed,date1,date2, partnership_id, scenario_id]);
};

exports.DBupdateBreedingExecuted = function(records) {
    
    cs = conn.pgp.helpers.ColumnSet(["?slbreeding_id",  {name: 'execution_date', cast: 'date'},  
                                                        {name: 'execution_quantity', cast: 'integer'}
                                                    ],
                                    {table: "sltxbreeding", schema: "public"});
    
    // cs = conn.pgp.helpers.ColumnSet(["?slbreeding_id",  {name: 'execution_date', cast: 'date'},  
    //                                                     {name: 'execution_quantity', cast: 'integer'},
    //                                                     {name: 'executed', cast: 'boolean'}
    //                                                 ],
    //                                 {table: "sltxbreeding", schema: "public"});

    // console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbreeding_id = t.slbreeding_id')
    // console.log(cs)

    return conn.db.any(conn.pgp.helpers.update(records, cs)+ ' WHERE v.slbreeding_id = t.slbreeding_id RETURNING t.slbreeding_id');

    // slbreeding_id, execution_quantity, execution_date, start_posture_date, lot

    // return conn.db.none(`UPDATE public.sltxbreeding 
    //                         SET execution_quantity = $2, 
    //                             execution_date = $3, 
    //                             start_posture_data = $4, 
    //                             lot = $5  
    //                         WHERE slbreeding_id = $1`, [slbreeding_id, execution_quantity, execution_date, start_posture_data, lot]);
    
        
       
};
exports.DBupdateBreedingProjected = function(records) {
    
    cs = conn.pgp.helpers.ColumnSet(["?slbreeding_id",  {name: 'duration', cast: 'integer'}, 
                                                        {name: 'decrease', cast: 'double precision'}],
                                    {table: "sltxbreeding", schema: "public"});

    console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbreeding_id = t.slbreeding_id')

    return conn.db.none(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbreeding_id = t.slbreeding_id');           
       
};

exports.DBfindPostureCurveByBreed = function(breed_id) {

    return conn.db.any(`SELECT week as weekly_curve, theorical_performance as posture_quantity FROM txposturecurve WHERE breed_id = $1 order by week asc`, [breed_id]);
       
};

exports.DBfindLengthPostureCurveByBreed = function(breed_id) {

    return conn.db.any(`SELECT count(*) FROM txposturecurve WHERE breed_id = $1`, [breed_id]);
       
};

exports.DBexistLot = function(lot) {

    return conn.db.one(`SELECT $1 IN (select lot from sltxbreeding where sl_disable is not true) IS TRUE as exist`, [lot]);
       
};

