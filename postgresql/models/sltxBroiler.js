const config = require("../../config");
const conn = require("../db");



exports.DBaddNewBroiler = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["scheduled_date", "scheduled_quantity", "incubatorplant_id", "gender", "slincubator_detail_id"],
        {table: "sltxbroiler", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};

exports.DBupdateBroilerQuantity = function(records){
    cs = conn.pgp.helpers.ColumnSet(["?slbroiler_id","scheduled_quantity"],
        {table: "sltxbroiler", schema: "public"});
    return conn.db.none(conn.pgp.helpers.update(records, cs)+ ' WHERE v.slbroiler_id  = t.slbroiler_id ');
};

exports.DBfindBroilerByDate = function(date) {
    return conn.db.any(`SELECT slbroiler_id, scheduled_date, scheduled_quantity, 
                            CASE WHEN real_quantity IS NULL THEN 0 ELSE real_quantity END, gender, incubatorplant_id
                      FROM sltxbroiler WHERE scheduled_date = $1 and sl_disable is not true`,
    [date]);
    
};


exports.DBupdateBroilerRealQuantity = function(records){
    cs = conn.pgp.helpers.ColumnSet(["?slincubator_detail_id","real_quantity"],
        {table: "sltxbroiler", schema: "public"});
    return conn.db.none(conn.pgp.helpers.update(records, cs)+ ' WHERE v.slincubator_detail_id  = t.slincubator_detail_id ');
};

exports.DBfindBroilerDailyLots = function(beginning, ending, gender, scenario_id) {
    return conn.db.any(`	
    (SELECT 
        date_, lot, slbroiler_id, scheduled_quantity - (case when residueb is not null then residueb else 0 end)::integer as quantity, null as slsellspurchase_id, 0 as residue
            
    FROM (
        
        SELECT DISTINCT TO_CHAR(br.scheduled_date, 'DD/MM/YYYY') as date_, CONCAT('I',ind.identifier) as lot, br.slbroiler_id, CASE WHEN br.real_quantity is not null then br.real_quantity else br.scheduled_quantity end as scheduled_quantity, br.scheduled_date,
              (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end FROM (SELECT DISTINCT lt.slbroiler_id, lt.quantity, v.lot from sltxbroiler_lot lt left join sltxbroiler_detail  v on lt.slbroiler_detail_id = v.slbroiler_detail_id WHERE lt.slbroiler_id = br.slbroiler_id and lt.sl_disable is not true) as bf) as residueB                
        FROM sltxbroiler br 
        LEFT JOIN sltxincubator_detail ind on br.slincubator_detail_id = ind.slincubator_detail_id 
        LEFT JOIN sltxincubator ic on ind.incubator_id = ic.slincubator
        WHERE ic.scenario_id = $4 and br.scheduled_date BETWEEN $1 and $2 and br.sl_disable is not true and br.gender = $3
        group by br.slbroiler_id,br.scheduled_date,br.scheduled_quantity,br.gender, ind.identifier ORDER BY scheduled_date
        
    ) as h)
    
    UNION ALL
    
    (
        SELECT date_, lot, null as slbroiler_id, CEIL(((quantity/2)- lot_quantity))as quantity, slsellspurchase_id, residue
            
        FROM(
            SELECT date_, lot, quantity, slsellspurchase_id, residue,            
                (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END 
                FROM sltxbroiler_lot ba 
                WHERE p.slsellspurchase_id = ba.slsellspurchase_id and ba.sl_disable is not true)AS lot_quantity
                                                
            FROM(
                SELECT TO_CHAR(programmed_date, 'DD/MM/YYYY') as date_, lot, quantity, slsellspurchase_id, 0 as residue
                FROM sltxsellspurchase sp
                WHERE scenario_id = $4 and programmed_date  BETWEEN $1 and $2 and sl_disable is not true and sp.type = 'Pollito de un día' and concept = 'Compra'
            ) as p
        )as rs
        WHERE (quantity/2- lot_quantity) > 0 order by date_ asc
    
    )                       
       `, [beginning, ending, gender, scenario_id]);
    // return conn.db.any(`	
    // SELECT date, slbroiler_id, scheduled_quantity+(purchases/2)-(sales/2) as quantity,  scheduled_quantity,(purchases/2) as purchases,(sales/2) as sales, (case when residueb is not null then residueb else 0 end) as residue
    // FROM (SELECT DISTINCT TO_CHAR(br.scheduled_date, 'DD/MM/YYYY') as date, br.slbroiler_id, br.scheduled_quantity, br.scheduled_date,
    //                                 (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end FROM sltxsellspurchase ic WHERE ic.programmed_date = br.scheduled_date and type = 'Pollito de un día' and concept = 'Venta' and ic.sl_disable is not true) as sales,
    //                                 (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end FROM sltxsellspurchase ic WHERE ic.programmed_date = br.scheduled_date and type = 'Pollito de un día' and concept = 'Compra' and ic.sl_disable is not true) as purchases,
    //                                 (SELECT case when sum(housing_quantity)> 0 then sum(housing_quantity) else 0 end FROM sltxbroiler_detail bf WHERE bf.slbroiler_id = br.slbroiler_id and bf.sl_disable is not true) as residueB              
    //                         FROM sltxbroiler br 
    //                         WHERE scheduled_date  BETWEEN $1 and $2 and br.sl_disable is not true and br.gender = $3
    //                             group by br.slbroiler_id,br.scheduled_date,br.scheduled_quantity,br.gender ORDER BY scheduled_date) as h                       
    //    `, [beginning, ending, gender]);
    
};

exports.DBfindBroilerByDateRange = function(beginning, ending, scenario_id) {
    return conn.db.any(`
    SELECT week_number, init_date, week, end_date, gender, scheduled_quantity, real_quantity, residue, balance_quantity
           FROM
           (SELECT DISTINCT to_char(br.scheduled_date, 'IW')::integer as week_number, (date_trunc('week', br.scheduled_date::timestamp)::date) as init_date,  TO_CHAR((date_trunc('week', br.scheduled_date::timestamp)::date), 'DD/MM/YYYY')  as week,
           (date_trunc('week', br.scheduled_date::timestamp)+ '6 days'::interval)::date as end_date,br.gender, (SELECT SUM(f.scheduled_quantity) FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW-YYYY') = to_char(br.scheduled_date, 'IW-YYYY') and f.gender = br.gender and f.sl_disable is not true)::integer as scheduled_quantity, 
           (SELECT SUM(f.real_quantity) FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW-YYYY') = to_char(br.scheduled_date, 'IW-YYYY') and f.gender = br.gender)::integer as real_quantity, 
			(SELECT SUM(su) FROM (SELECT  SUM(CASE WHEN f.real_quantity is not null THEN f.real_quantity ELSE f.scheduled_quantity END) as su FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW-YYYY') = to_char(br.scheduled_date, 'IW-YYYY') and f.gender = br.gender and f.sl_disable is not true group by f.real_quantity) as ma)::integer as balance_quantity, 
               (SELECT CASE WHEN SUM( bfd.housing_quantity) IS NOT NULL THEN SUM( bfd.housing_quantity) ELSE 0 END 
               FROM (  SELECT DISTINCT bf.slbroiler_detail_id, bf.housing_quantity, CASE WHEN bb2.scheduled_date IS NOT NULL THEN to_char(bb2.scheduled_date, 'IW-YYYY') ELSE to_char(sp.programmed_date, 'IW-YYYY') END as date 
                       FROM sltxbroiler_detail bf 
                           left join sltxbroiler_lot bb on bf.slbroiler_detail_id = bb.slbroiler_detail_id and bb.gender = br.gender 
                           left join sltxbroiler bb2 on bb.slbroiler_id = bb2.slbroiler_id 
                           LEFT JOIN sltxsellspurchase sp on bb.slsellspurchase_id = sp.slsellspurchase_id
                                       WHERE bf.sl_disable is not true) as bfd    
               WHERE to_char(br.scheduled_date, 'IW-YYYY') = bfd.date)::integer as residue
           FROM sltxbroiler as br 
                LEFT JOIN sltxincubator_detail ind on br.slincubator_detail_id = ind.slincubator_detail_id
                LEFT JOIN sltxincubator ic on ind.incubator_id = ic.slincubator

           WHERE ic.scenario_id = $3 and br.scheduled_date BETWEEN $1 and $2 and br.sl_disable is not true 
               group by week_number,br.scheduled_date,br.scheduled_quantity,br.gender order by week_number asc
           ) as h
            ORDER BY h.init_date desc                       
            `, [beginning, ending, scenario_id]);
    // return conn.db.any(`	
    // SELECT week_number, init_date, week, end_date, gender, scheduled_quantity, real_quantity, residue
    //        FROM
    //        (SELECT DISTINCT to_char(br.scheduled_date, 'IW')::integer as week_number, (date_trunc('week', br.scheduled_date::timestamp)::date) as init_date,  TO_CHAR((date_trunc('week', br.scheduled_date::timestamp)::date), 'DD/MM/YYYY')  as week,
    //        (date_trunc('week', br.scheduled_date::timestamp)+ '6 days'::interval)::date as end_date,br.gender, (SELECT SUM(f.scheduled_quantity) FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW') = to_char(br.scheduled_date, 'IW') and f.gender = br.gender)::integer as scheduled_quantity, 
    //        (SELECT SUM(f.real_quantity) FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW') = to_char(br.scheduled_date, 'IW') and f.gender = br.gender) as real_quantity, 
    //            (SELECT CASE WHEN SUM( bfd.housing_quantity) IS NOT NULL THEN SUM( bfd.housing_quantity)	ELSE 0 END FROM (SELECT bf.housing_quantity, bb.scheduled_date as date FROM sltxbroiler_detail bf left join sltxbroiler bb on bf.slbroiler_id = bb.slbroiler_id and bb.gender = br.gender and bf.sl_disable is not true) as bfd    WHERE to_char(br.scheduled_date, 'IW') = to_char(bfd.date, 'IW')	)::integer as residue
    //        FROM sltxbroiler as br         
    //            WHERE scheduled_date  BETWEEN $1 and $2 and br.sl_disable is not true 
    //            group by week_number,br.scheduled_date,br.scheduled_quantity,br.gender order by week_number asc
    //        ) as h
    //         ORDER BY h.init_date desc                        
    //    `, [beginning, ending]);
    //         SELECT week_number, init_date, week, end_date, gender, scheduled_quantity, real_quantity, residue, 
    //             (scheduled_quantity - (SELECT DISTINCT (CASE WHEN sum(quantity)>0 then sum(quantity) else 0 end) FROM sltxsellspurchase ic WHERE (ic.programmed_date between h.init_date and h.end_date) and concept = 'Venta' and type = 'Pollito de un dia' and ic.sl_disable is not true group by concept)/2 + (SELECT DISTINCT (CASE WHEN sum(quantity)>0 then sum(quantity) else 0 end) FROM sltxsellspurchase ic WHERE (ic.programmed_date between h.init_date and h.end_date) and concept = 'Compra' and type = 'Pollito de un dia' and ic.sl_disable is not true group by concept)/2
    //             ) as quantity
    //             FROM
    //             (SELECT DISTINCT to_char(br.scheduled_date, 'IW') as week_number, (date_trunc('week', br.scheduled_date::timestamp)::date) as init_date,  TO_CHAR((date_trunc('week', br.scheduled_date::timestamp)::date), 'DD/MM/YYYY')  as week,
    //             (date_trunc('week', br.scheduled_date::timestamp)+ '6 days'::interval)::date as end_date,br.gender, (SELECT SUM(f.scheduled_quantity) FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW') = to_char(br.scheduled_date, 'IW') and f.gender = br.gender) as scheduled_quantity, 
    //             (SELECT SUM(f.real_quantity) FROM sltxbroiler f WHERE to_char(f.scheduled_date, 'IW') = to_char(br.scheduled_date, 'IW') and f.gender = br.gender) as real_quantity, 
    //                 (SELECT CASE WHEN SUM( bfd.housing_quantity) IS NOT NULL THEN SUM( bfd.housing_quantity)	ELSE 0 END FROM (SELECT bf.housing_quantity, bb.scheduled_date as date FROM sltxbroiler_detail bf left join sltxbroiler bb on bf.slbroiler_id = bb.slbroiler_id and bb.gender = br.gender and bf.sl_disable is not true) as bfd    WHERE to_char(br.scheduled_date, 'IW') = to_char(bfd.date, 'IW')	) as residue
    //             FROM sltxbroiler as br         
    //                 WHERE scheduled_date  BETWEEN $1 and $2 and br.sl_disable is not true 
    //                 group by week_number,br.scheduled_date,br.scheduled_quantity,br.gender order by week_number asc
    //             ) as h                        
    //    `, [beginning, ending]);
    
};
