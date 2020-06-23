const config = require("../../config");
const conn = require("../db");


exports.DBfindMaxLotComp = function() {
    let promise = conn.db.one("select MAX(CAST((substring(lot, 2, 10)) AS INTEGER)) from sltxsellspurchase where concept = 'Compra'");
    return (promise);
};

exports.DBinsertOperation = function(operation) {
        
    cs = conn.pgp.helpers.ColumnSet(["scenario_id", "programmed_date", "concept", "quantity", "type", "breed_id", "description", "lot" ],
        {table: "sltxsellspurchase", schema: "public"});
    return conn.db.any(conn.pgp.helpers.insert(operation, cs)+"RETURNING slsellspurchase_id");

};

exports.DBfindOperationById = function(id) {
    return conn.db.one(`select a.slsellspurchase_id, a.scenario_id, b.name as name_breed,
                        TO_CHAR(a.programmed_date, 'DD/MM/YYYY') as programmed_date, a.concept, a.quantity, a.type, a.description,
                        CASE WHEN a.concept = 'Venta' THEN '-' ELSE a.lot END as lot
                        from sltxsellspurchase a
                        left join mdbreed b on a.breed_id = b.breed_id
                        where a.slsellspurchase_id = $1`, [id]);
};

exports.DBfindOperationsByFilter = function(concept,type,breed_id,date1,date2,scenario_id) {
    console.log("DB",concept,type,breed_id,date1,date2)
    return conn.db.any(`select  a.slsellspurchase_id, a.scenario_id, b.name as name_breed,
                        TO_CHAR(a.programmed_date, 'DD/MM/YYYY') as programmed_date, a.concept, a.quantity, a.type, a.description,
                        CASE WHEN a.concept = 'Venta' THEN '-' ELSE a.lot END as lot
                        from sltxsellspurchase a
                                left join mdbreed b on a.breed_id = b.breed_id
                        WHERE CASE WHEN $1 is not null THEN a.concept = $1 ELSE TRUE END
                              and CASE WHEN $2 is not null THEN a.type = $2 ELSE TRUE END
                              and CASE WHEN $3 is not null THEN a.breed_id = $3 ELSE TRUE END
                              and CASE WHEN $4 is not null  and $5 is not null THEN a.programmed_date BETWEEN $4 and $5 ELSE TRUE END
                              AND a.scenario_id = $6 
                              AND a.sl_disable is not true 
                              order by a.programmed_date asc`,
                        [concept,type,breed_id,date1,date2,scenario_id]);
};

exports.DBupdateStatus = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["?slsellspurchase_id", {name: 'sl_disable', cast: 'boolean'}],
        {table: "sltxsellspurchase", schema: "public"});

        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slsellspurchase_id = t.slsellspurchase_id')

    return conn.db.one(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slsellspurchase_id = t.slsellspurchase_id RETURNING TRUE as deleted');

};

exports.DBgetSalesAndPurchasesByWeek = function(beginning, ending, scenario_id) {

    return conn.db.any(`
            SELECT DISTINCT to_char(br.programmed_date, 'IW')::integer as week_number, 
                    (date_trunc('week', br.programmed_date::timestamp)::date) as init_date,  
                    TO_CHAR((date_trunc('week', br.programmed_date::timestamp)::date), 'DD/MM/YYYY')  as week,
                    (date_trunc('week', br.programmed_date::timestamp)+ '6 days'::interval)::date as end_date,
                    ceil((SELECT DISTINCT (CASE WHEN sum(ic.quantity)>0 then sum(ic.quantity) else 0 end) FROM sltxsellspurchase ic WHERE ic.scenario_id = $3 and to_char(ic.programmed_date, 'IW') = to_char(br.programmed_date, 'IW') and concept = 'Venta' and type = 'Pollito de un día' and ic.sl_disable is not true group by concept)::double precision/2)::integer as sales, 
                    ceil((SELECT DISTINCT (CASE WHEN sum(ic.quantity)>0 then sum(ic.quantity) else 0 end) FROM sltxsellspurchase ic WHERE ic.scenario_id = $3 and to_char(ic.programmed_date, 'IW') = to_char(br.programmed_date, 'IW') and concept = 'Compra' and type = 'Pollito de un día' and ic.sl_disable is not true group by concept)::double precision/2)::integer as purchases          
            FROM sltxsellspurchase br         
            WHERE br.scenario_id = $3 and br.programmed_date  BETWEEN $1 and $2 and type = 'Pollito de un día' and br.sl_disable is not true 
                group by week_number,br.programmed_date,br.quantity order by week_number asc`,
    [beginning, ending, scenario_id]);

};

exports.DBgetSalesByWeek = function(beginning, ending, scenario_id) {

    return conn.db.any(`
            SELECT (CASE WHEN SUM(quantity) > 0 THEN CEIL(SUM(quantity)/2) ELSE 0 END )::integer AS quantity
            FROM sltxsellspurchase br         
            WHERE br.scenario_id = $3 and br.programmed_date  BETWEEN $1 and $2 and br.sl_disable is not true and concept = 'Venta' and type = 'Pollito de un día'
            `,
    [beginning, ending, scenario_id]);

};

exports.DBgetResiduePurchaseByWeek = function(week_number, gender, scenario_id) {

    return conn.db.one(`
    SELECT (SELECT CASE WHEN SUM( bfd.housing_quantity) IS NOT NULL THEN SUM( bfd.housing_quantity) ELSE 0 END 
    FROM (  SELECT DISTINCT bf.slbroiler_detail_id, bb.quantity as housing_quantity, to_char(sp.programmed_date, 'IW') as date 
            FROM sltxbroiler_detail bf 
                left join sltxbroiler_lot bb on bf.slbroiler_detail_id = bb.slbroiler_detail_id and bb.gender = $2 
                 LEFT JOIN sltxsellspurchase sp on bb.slsellspurchase_id = sp.slsellspurchase_id
                            WHERE bf.sl_disable is not true and sp.scenario_id = $3
              ) as bfd    
    WHERE $1 = bfd.date::integer)::integer as residue
            `,
    [week_number, gender, scenario_id]);

};