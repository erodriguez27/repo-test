const config = require("../../config");
const conn = require("../db");

exports.DBinsertPostureCurve = function(posturecurve) {
        
    cs = conn.pgp.helpers.ColumnSet(["scenario_id", "breed_id","slbreeding_id", "weekly_curve", "posture_date", "posture_quantity"],
        {table: "sltxposturecurve", schema: "public"});
    return conn.db.any(conn.pgp.helpers.insert(posturecurve, cs)+"RETURNING slposturecurve_id");

};

exports.DBfindCurveByDateRangeSumQuantity = function() {
    
    return conn.db.any(`
            SELECT pc.scenario_id, pc.breed_id, pc.weekly_curve, pc.posture_date, sum(distinct pp.posture_quantity), pc.sl_disable,
                r.name as breed, s.name as scenario
            FROM sltxposturecurve pc
            left join (SELECT DISTINCT slposturecurve_id, scenario_id, breed_id, slbreeding_id, 
                weekly_curve, posture_date, posture_quantity, associated, sl_disable
                FROM sltxposturecurve ORDER BY posture_date) pp on pc.posture_date = pp.posture_date
            left join mdbreed r on pc.breed_id = r.breed_id
            left join mdscenario s on pc.scenario_id = s.scenario_id
            WHERE pc.posture_date between '2019-07-10' and '2019-07-20' and pc.sl_disable is not true  
            GROUP BY pc.scenario_id, pc.breed_id, pc.weekly_curve, pc.posture_date, pc.sl_disable, breed, scenario 
            ORDER BY pc.posture_date
            `);

};

exports.DBfindPostureCurve = function(init_date, end_date, breed_id, farm_id, partnership_id, scenario_id, lot) {
    
    return conn.db.any(`
    SELECT pc.slposturecurve_id, pc.scenario_id, pc.breed_id, pc.slbreeding_id, pc.weekly_curve, 
        TO_CHAR(pc.posture_date, 'DD/MM/YYYY') as posture_date, pc.posture_quantity, pc.associated, pc.sl_disable, br.lot,
		r.name as breed, s.name as scenario, f.name as farm
	FROM sltxposturecurve pc
        LEFT JOIN sltxbreeding br on pc.slbreeding_id = br.slbreeding_id
        LEFT JOIN osfarm f on br.farm_id = f.farm_id
        LEFT JOIN mdbreed r on pc.breed_id = r.breed_id
        LEFT JOIN mdscenario s on pc.scenario_id = s.scenario_id
    WHERE br.partnership_id = $5
        and CASE WHEN $6 is not null  THEN pc.scenario_id = $6 ELSE TRUE END
        and CASE WHEN $1 is not null  and $2 is not null THEN pc.posture_date BETWEEN $1 and $2 ELSE TRUE END
        and CASE WHEN $3 is not null THEN pc.breed_id = $3 ELSE TRUE END
        and CASE WHEN $7 is not null THEN br.lot = $7 ELSE TRUE END
        and CASE WHEN $4 is not null THEN br.farm_id = $4 ELSE TRUE END and pc.sl_disable is not true order by pc.posture_date asc
            `,[init_date, end_date, breed_id, farm_id, partnership_id, scenario_id, lot]);

};

exports.DBfindPostureCurveLot = function(scenario_id, breed_id, farm_id) {
    
    return conn.db.any(`
    SELECT DISTINCT lot::integer, (SELECT MIN(posture_date) FROM sltxposturecurve cur WHERE cur.slbreeding_id = br.slbreeding_id) as min_date,
		(SELECT MAX(posture_date) FROM sltxposturecurve cur WHERE cur.slbreeding_id = br.slbreeding_id) as max_date
    FROM sltxposturecurve pc
        LEFT JOIN sltxbreeding br on pc.slbreeding_id = br.slbreeding_id 
    WHERE CASE WHEN $1 is not null  THEN pc.scenario_id = $1 ELSE TRUE END
        AND CASE WHEN $2 is not null THEN pc.breed_id = $2 ELSE TRUE END
        AND CASE WHEN $3 is not null THEN br.farm_id = $3 ELSE TRUE END 
        AND pc.sl_disable is not true order by lot asc
            `,[scenario_id, breed_id, farm_id]);

};