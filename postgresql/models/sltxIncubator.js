const config = require("../../config");
const conn = require("../db");


exports.DBfindIncubator = function(init_date, end_date, scenario_id) {
    return conn.db.any(`	
    SELECT slincubator, s_date, scheduled_date, (CASE WHEN scheduled_quantity> 0 THEN (scheduled_quantity+purchase-sell)::integer ELSE (curve_quantity+purchase-sell)::integer END) as scheduled_quantity, residue, eggsrequired, curve_quantity>0 as proy,
        purchase::integer, sell::integer
    FROM
    (SELECT inc.slincubator, inc.scheduled_date as s_date, TO_CHAR(inc.scheduled_date, 'DD/MM/YYYY') as scheduled_date , inc.eggsrequired,
            inc.scheduled_quantity,
            (CASE WHEN SUM(pc.posture_quantity)>0 THEN SUM(pc.posture_quantity) ELSE 0 END) AS curve_quantity,
            (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxsellspurchase ba WHERE ba.scenario_id = $3 and to_char(inc.scheduled_date, 'IW')=to_char(ba.programmed_date, 'IW') and to_char(inc.scheduled_date, 'YYYY')=to_char(ba.programmed_date, 'YYYY') and ba.concept='Compra' and ba.type = 'Huevo Fértil' and ba.sl_disable is not true) AS purchase,
            (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxsellspurchase ba WHERE ba.scenario_id = $3 and to_char(inc.scheduled_date, 'IW')=to_char(ba.programmed_date, 'IW') and to_char(inc.scheduled_date, 'YYYY')=to_char(ba.programmed_date, 'YYYY') and ba.concept='Venta' and ba.type = 'Huevo Fértil' and ba.sl_disable is not true) AS sell,
            (SELECT CASE WHEN SUM(ba.programmed_quantity) >0 THEN SUM(ba.programmed_quantity) ELSE 0 END FROM sltxincubator_detail ba WHERE inc.slincubator = ba.incubator_id and ba.sl_disable is not true) as residue
    FROM sltxincubator inc
        LEFT JOIN sltxincubator_curve ic on inc.slincubator = ic.slincubator_id and ic.sl_disable is not true
        LEFT JOIN sltxposturecurve pc on ic.slposturecurve_id = pc.slposturecurve_id
    WHERE inc.scheduled_date BETWEEN $1 and $2 and inc.scenario_id = $3 and inc.eggsrequired is not null and inc.sl_disable is not true 
    GROUP BY inc.slincubator) as i ORDER BY s_date ASC`, [init_date, end_date, scenario_id]);
    // return conn.db.any(`	
    // SELECT slincubator, s_date, scheduled_date, scheduled_quantity+purchase-sell as scheduled_quantity, residue, eggsrequired, (scheduled_quantity is not null and scheduled_quantity>0) as proy
    // FROM
    // (SELECT inc.slincubator, inc.scheduled_date as s_date, TO_CHAR(inc.scheduled_date, 'DD/MM/YYYY') as scheduled_date , inc.eggsrequired,
    //         (CASE WHEN inc.scheduled_quantity != 0 then inc.scheduled_quantity else (SELECT CASE WHEN SUM(ba.scheduled_quantity)>0 THEN SUM(ba.scheduled_quantity) ELSE 0 END FROM sltxincubator ba WHERE ba.scenario_id = $3 and to_char(inc.scheduled_date, 'IW')=to_char(ba.scheduled_date, 'IW') and to_char(inc.scheduled_date, 'YYYY')=to_char(ba.scheduled_date, 'YYYY') and ba.posturecurve_id is not null and ba.sl_disable is not true) end) AS scheduled_quantity,
    //         (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxsellspurchase ba WHERE ba.scenario_id = $3 and to_char(inc.scheduled_date, 'IW')=to_char(ba.programmed_date, 'IW') and to_char(inc.scheduled_date, 'YYYY')=to_char(ba.programmed_date, 'YYYY') and ba.concept='Compra' and ba.type = 'Huevo Fértil' and ba.sl_disable is not true) AS purchase,
    //         (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxsellspurchase ba WHERE ba.scenario_id = $3 and to_char(inc.scheduled_date, 'IW')=to_char(ba.programmed_date, 'IW') and to_char(inc.scheduled_date, 'YYYY')=to_char(ba.programmed_date, 'YYYY') and ba.concept='Venta' and ba.type = 'Huevo Fértil' and ba.sl_disable is not true) AS sell,
    //         SUM(id.programmed_quantity) as residue
    // FROM sltxincubator inc
    //     LEFT JOIN sltxincubator_detail id on inc.slincubator = id.incubator_id and id.sl_disable is not true
    // WHERE inc.scheduled_date BETWEEN $1 and $2 and inc.scenario_id = $3 and inc.eggsrequired is not null and inc.posturecurve_id is null and inc.sl_disable is not true 
    // GROUP BY inc.slincubator) as i ORDER BY s_date ASC`, [init_date, end_date, scenario_id]);
    // return conn.db.any(`SELECT a.slincubator, a.scenario_id, a.incubatorplant_id, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, a.eggsrequired,
    //                             ip.name as incplant, sc.name as scenario, SUM(id.programmed_quantity)::integer as residue
    //                     FROM sltxincubator a 
    //                     LEFT JOIN osincubatorplant ip on a.incubatorplant_id = ip.incubator_plant_id
    //                     LEFT JOIN mdscenario sc on a.scenario_id = sc.scenario_id
    //                     LEFT JOIN sltxincubator_detail id on a.slincubator = id.incubator_id and id.sl_disable is not true
    //                     WHERE a.scheduled_date BETWEEN $1 and $2 
    //                           and a.sl_disable is not true group by a.slincubator, ip.name, sc.name order by a.scheduled_date asc`, [init_date, end_date]);
};

// exports.DBfindEggProducts = function() {

//     return conn.db.any(` SELECT product_id, code, name
//                         FROM public.mdproduct 
//                         WHERE substring(name, 1, 12) = 'Huevo fertil'`);

// };
exports.DBfindEggProducts = function(data) {
    // value: '4',
    // code: undefined,
    // product_id: 0,
    // _date: '2018-11-19',
    // scenario_id: 6,
    // confirm: 0
    // scenario_id: item.scenario_id,
    //             eggsrequired: item.value,
    //             scheduled_date: item._date
    /**
     * 
breed_id:3
capacity:275000
fecha:"28/10/2019"
halign:"Right"
mes:"Octubre"
product_id:5
residue:273402
textalign:"End"
value:1598
     */
    return conn.db.any(` select a.scenario_id, a.value as eggsrequired, to_char(a.fecha, 'YYYY-MM-DD') as scheduled_date from 
    (select * from json_populate_recordset(null::record, $1) as (scenario_id integer, value integer, fecha date,
        product_id integer) ) as a where a.product_id IN (SELECT product_id
            FROM public.mdproduct 
            WHERE substring(name, 1, 12) = 'Huevo fertil');

    
    
    `, [data]);

};

exports.DBfindEggfinal = function(data) {
    // scenario_id: rst.scenario_id,
    // eggsrequired: acum,
    // scheduled_date: rst.scheduled_date,
    // scheduled_quantity: 0
    return conn.db.any(` SELECT DISTINCT a.scenario_id, a.scheduled_date, 0 as scheduled_quantity,
    (select sum(b.eggsrequired)::integer from (select * from json_populate_recordset(null::record, $1) as 
    (scenario_id integer, eggsrequired integer, scheduled_date character varying)) as b where b.scheduled_date = a.scheduled_date) AS eggsrequired
    FROM (select * from json_populate_recordset(null::record, $1) as 
    (scenario_id integer, eggsrequired integer, scheduled_date character varying) ) as a
    `, [data]);

};

exports.DBfindProjectionByDateAndScenario = function(date, scenario_id) {
    return conn.db.any(`SELECT slincubator, scenario_id, incubatorplant_id, scheduled_date, scheduled_quantity, eggsrequired
                      FROM sltxincubator WHERE scenario_id = $2 and scheduled_date = $1 and sl_disable is not true`,
    [date, scenario_id]);
    
};
exports.DBfindProjectionByDateAndScenario2 = function(date, scenario_id) {
    return conn.db.any(`SELECT slincubator, scenario_id, incubatorplant_id, scheduled_date, scheduled_quantity, eggsrequired
                      FROM sltxincubator WHERE scenario_id = $2 and to_char(scheduled_date, 'IYYY-IW') = to_char($1::date+1, 'IYYY-IW') and sl_disable is not true`, //si se da;a modifique aqui y fue para comparar con el a;o
    [date, scenario_id]);
    
};
exports.DBfindProjectionByDateAndScenarioForCurve = function(date, scenario_id) {
    return conn.db.any(`SELECT slincubator, scenario_id, incubatorplant_id, scheduled_date, scheduled_quantity, eggsrequired
                      FROM sltxincubator WHERE scenario_id = $2 and to_char(scheduled_date, 'IYYY-IW') = to_char($1::date, 'IYYY-IW') and sl_disable is not true`,
    [date, scenario_id]);
    
};

exports.DBupdateIncProjections = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slincubator", "eggsrequired"],
        {table: "sltxincubator", schema: "public"});


    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator = t.slincubator');

};
exports.DBupdateScheduledQuantity = function(scheduled_date, scheduled_quantity, scenario_id) {
    console.log('En el model:::: ', scheduled_date, scheduled_quantity, scenario_id)
    return conn.db.none(`UPDATE sltxincubator 
                        SET scheduled_quantity = scheduled_quantity + $2::integer
                        WHERE to_char(scheduled_date, 'IW') = to_char($1::date, 'IW') and to_char($1::date, 'YYYY') = to_char(a.scheduled_date::date, 'YYYY') and scenario_id = $3`, [scheduled_date, scheduled_quantity, scenario_id]);

};

exports.DBaddNewIncProjections = function(records) {
    
    cs = conn.pgp.helpers.ColumnSet(["scenario_id", "scheduled_date", "eggsrequired", "scheduled_quantity"], 
    {table: "sltxincubator", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};

exports.DBaddNewIncubatorP = function(records) {
    
    cs = conn.pgp.helpers.ColumnSet(["scenario_id", "scheduled_date", "eggsrequired", "scheduled_quantity", "posturecurve_id"], 
    {table: "sltxincubator", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};

exports.DBupdateProjectionsQuantity = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slincubator", "scheduled_quantity"],
        {table: "sltxincubator", schema: "public"});


    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slincubator = t.slincubator');

};

exports.DBfindLotProduction = function(date, scenario_id) {
    return conn.db.any(`SELECT  slincubator_curve_id, scheduled_date, (quantity - lot_quantity)::integer as quantity, lot, NULL as slsellspurchase_id  
    FROM ( SELECT slincubator_curve_id, scheduled_date, quantity, lot,
			(SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxincubator_lot ba WHERE i.slincubator_curve_id = ba.slincubator_curve_id and ba.sl_disable is not true) AS lot_quantity
			FROM (SELECT  ic.slincubator_curve_id, a.scheduled_date, CASE WHEN ic.quantity >0 then ic.quantity else b.posture_quantity end::integer  AS quantity, c.lot
            
            FROM sltxincubator a
                LEFT JOIN sltxincubator_curve ic on a.slincubator = ic.slincubator_id 
                LEFT JOIN sltxposturecurve b on ic.slposturecurve_id = b.slposturecurve_id 
                LEFT JOIN sltxbreeding c on b.slbreeding_id = c.slbreeding_id 
                LEFT JOIN sltxincubator_lot d on ic.slincubator_curve_id = d.slincubator_curve_id 
            WHERE a.scenario_id = $2 and (to_char($1::date, 'IW') = to_char(a.scheduled_date::date, 'IW') and to_char($1::date, 'YYYY') = to_char(a.scheduled_date::date, 'YYYY')) and a.sl_disable is not true
            GROUP BY ic.slincubator_curve_id, a.scheduled_date, c.lot, b.posture_quantity, ic.quantity
        ) as i) AS ii ORDER BY lot::INTEGER ASC`,

    [date, scenario_id]); 
    // return conn.db.any(`
    // SELECT  slincubator, scheduled_date, (quantity - lot_quantity)::integer as quantity, lot  
    // FROM (SELECT  a.slincubator, a.scheduled_date, CASE WHEN ic.quantity >0 then ic.quantity else b.posture_quantity end::integer  AS quantity, c.lot,
    //         (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxincubator_lot ba WHERE a.slincubator = ba.slincubator_id and ba.sl_disable is not true) AS lot_quantity
    //         FROM sltxincubator a
    //             LEFT JOIN sltxincubator_curve ic on a.slincubator = ic.slincubator_id 
    //             LEFT JOIN sltxposturecurve b on ic.slposturecurve_id = b.slposturecurve_id 
    //             LEFT JOIN sltxbreeding c on b.slbreeding_id = c.slbreeding_id 
    //             LEFT JOIN sltxincubator_lot d on a.slincubator = d.slincubator_id 
    //         WHERE a.scenario_id = $2 and (to_char($1::date, 'IW') = to_char(a.scheduled_date::date, 'IW') and to_char($1::date, 'YYYY') = to_char(a.scheduled_date::date, 'YYYY')) and a.sl_disable is not true
    //         GROUP BY a.slincubator, c.lot, b.posture_quantity, ic.quantity
    //     ) AS i ORDER BY lot::INTEGER ASC`,

    // [date, scenario_id]); 
    
};

exports.DBfindLotPurchase = function(date, scenario_id) {
    return conn.db.any(`SELECT slsellspurchase_id, programmed_date, quantity-residue-lot_quantity as quantity, lot, 0 as residue, NULL as slincubator_curve_id
    FROM (SELECT slsellspurchase_id, programmed_date, quantity, 
            (SELECT CASE WHEN SUM(quantity)>0 then SUM(quantity) else 0 end FROM sltxsellspurchase ps WHERE cc.programmed_date = ps.programmed_date AND ps.concept = 'Venta' AND cc.breed_id = ps.breed_id AND ps.scenario_id = $2) as residue, 
            lot,
            ((SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxincubator_lot ba WHERE cc.slsellspurchase_id = ba.slsellspurchase_id and ba.sl_disable is not true) )AS lot_quantity 
    FROM sltxsellspurchase cc
    WHERE scenario_id = $2 and (to_char($1::date, 'IW') = to_char(programmed_date::date, 'IW') 
                            and to_char($1::date, 'YYYY') = to_char(programmed_date::date, 'YYYY')) 
                            and concept = 'Compra'
                            and type = 'Huevo Fértil'
                            and sl_disable is not true) AS i WHERE quantity > 0 ORDER BY substring(lot, 2, 10)::INTEGER ASC`,

    [date, scenario_id]); 
    
};
exports.DBfindLotPurchase = function(date, scenario_id) {
    return conn.db.any(`SELECT slsellspurchase_id, programmed_date, quantity-residue-lot_quantity as quantity, lot, 0 as residue, NULL as slincubator_curve_id
    FROM (SELECT slsellspurchase_id, programmed_date, quantity, 
            (SELECT CASE WHEN SUM(quantity)>0 then SUM(quantity) else 0 end FROM sltxsellspurchase ps WHERE cc.programmed_date = ps.programmed_date AND ps.concept = 'Venta' AND cc.breed_id = ps.breed_id AND ps.scenario_id = $2) as residue, 
            lot,
            ((SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxincubator_lot ba WHERE cc.slsellspurchase_id = ba.slsellspurchase_id and ba.sl_disable is not true) )AS lot_quantity 
    FROM sltxsellspurchase cc
    WHERE scenario_id = $2 and (to_char($1::date, 'IW') = to_char(programmed_date::date, 'IW') 
                            and to_char($1::date, 'YYYY') = to_char(programmed_date::date, 'YYYY')) 
                            and concept = 'Compra'
                            and type = 'Huevo Fértil'
                            and sl_disable is not true) AS i WHERE quantity > 0 ORDER BY substring(lot, 2, 10)::INTEGER ASC`,

    [date, scenario_id]); 
    
};

exports.DBfindLotProductionPurchase = function(date, scenario_id) {

    return conn.db.any(`(
        SELECT  slincubator_curve_id, NULL as slsellspurchase_id, scheduled_date, (quantity - lot_quantity)::integer as quantity, lot, 0 as residue  
            FROM ( SELECT slincubator_curve_id, scheduled_date, quantity, lot,
                    (SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxincubator_lot ba WHERE i.slincubator_curve_id = ba.slincubator_curve_id and ba.sl_disable is not true) AS lot_quantity
                    FROM (SELECT  ic.slincubator_curve_id, a.scheduled_date, CASE WHEN ic.quantity >0 then ic.quantity else b.posture_quantity end::integer  AS quantity, c.lot
                    
                    FROM sltxincubator a
                        LEFT JOIN sltxincubator_curve ic on a.slincubator = ic.slincubator_id and ic.sl_disable is not true
                        LEFT JOIN sltxposturecurve b on ic.slposturecurve_id = b.slposturecurve_id 
                        LEFT JOIN sltxbreeding c on b.slbreeding_id = c.slbreeding_id 
                        LEFT JOIN sltxincubator_lot d on ic.slincubator_curve_id = d.slincubator_curve_id 
                    WHERE a.scenario_id = $2 and to_char($1::date, 'IYYY-IW') = to_char(a.scheduled_date, 'IYYY-IW') and a.sl_disable is not true
                    GROUP BY ic.slincubator_curve_id, a.scheduled_date, c.lot, b.posture_quantity, ic.quantity
                ) as i) AS ii WHERE quantity is not null and lot is not null ORDER BY lot::BIGINT ASC
        )
            
            UNION ALL
            
            (
                SELECT NULL as slincubator_curve_id, slsellspurchase_id, programmed_date as scheduled_date, quantity-(residue/cant_comp)-lot_quantity as quantity, lot, 0 as residue 
            FROM (SELECT slsellspurchase_id, programmed_date, quantity, 
                    (SELECT CASE WHEN SUM(quantity)>0 then SUM(quantity) else 0 end FROM sltxsellspurchase ps WHERE cc.programmed_date = ps.programmed_date AND ps.concept = 'Venta' AND type = 'Huevo Fértil' AND cc.breed_id = ps.breed_id AND ps.scenario_id = $2) as residue,
                    (SELECT CASE WHEN COUNT(*) > 0 THEN COUNT(*)  ELSE 1 END  FROM sltxsellspurchase ps WHERE cc.programmed_date = ps.programmed_date AND ps.concept = 'Compra' and type = 'Huevo Fértil' AND cc.breed_id = ps.breed_id AND ps.scenario_id = $2) as cant_comp, 
                    lot,
                    ((SELECT CASE WHEN SUM(ba.quantity) >0 THEN SUM(ba.quantity) ELSE 0 END FROM sltxincubator_lot ba WHERE cc.slsellspurchase_id = ba.slsellspurchase_id and ba.sl_disable is not true) )AS lot_quantity 
            FROM sltxsellspurchase cc
            WHERE scenario_id = $2 and to_char($1::date, 'IYYY-IW') = to_char(programmed_date, 'IYYY-IW') 
                                    and concept = 'Compra'
                                    and type = 'Huevo Fértil'
                                    and sl_disable is not true) AS i WHERE quantity-(residue/cant_comp)-lot_quantity > 0 ORDER BY substring(lot, 2, 10)::BIGINT ASC
            
            )  `,

    [date, scenario_id]); 
    
};