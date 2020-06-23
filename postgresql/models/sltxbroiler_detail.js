const config = require("../../config");
const conn = require("../db");

// slbroiler_detail_id, farm_id, housing_date, housing_quantity, eviction_date, 
// eviction_quantity, category, age, weightgain, synchronized, lot, order_p, executed, sl_disable, 
// youngmale, oldmale, peasantmale, youngfemale, oldfemale, slbroiler_id

// POr favor recuerda que tienes que calcular eviction_date, eviction_quantity, un lote para cada galpon, modificar la tabla de los galpones para que tengan lote ahi,
// Adicional para calcular todo eso tienes que buscar la clasificacion activa y obtener toda su info
exports.DBfindCenterById = function(shed, farm) {
    return conn.db.one(`select c.center_id, b.farm_id, a.shed_id
                        from osshed a
                        left join osfarm b on a.farm_id = b.farm_id
                        left join oscenter c on a.center_id = c.center_id
                        where a.shed_id = $1 and b.farm_id = $2`, [shed, farm]);
};

exports.DBaddNewBroilerDetail = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["farm_id", "housing_date", "housing_quantity",
    "youngmale", "oldmale", "peasantmale", "youngfemale", "oldfemale", "lot"],
        {table: "sltxbroiler_detail", schema: "public"});
    return conn.db.any(conn.pgp.helpers.insert(records, cs)+ "RETURNING slbroiler_detail_id");

};

exports.DBaddNewBroilerLot = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["slbroiler_detail_id","slbroiler_id", "quantity", "slsellspurchase_id", "gender"],
        {table: "sltxbroiler_lot", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};


exports.DBfindMaxLotBroiler = function() {
    
    let promise = conn.db.one("SELECT MAX(CAST((substring(lot, 2, 10)) AS INTEGER)) FROM sltxbroiler_detail");
    return promise;
};

exports.DBfindMaxRefBroiler = function() {
    
    let promise = conn.db.one("SELECT MAX(lot::integer) FROM sltxbroiler_detail");
    return promise;
};


exports.DBfindBroilerDetailByWeek = function(beginning, ending, gender, scenario_id) {
// slbroiler_detail_id, farm_id, housing_date, housing_quantity, eviction_date, 
// eviction_quantity, category, age, weightgain, synchronized, lot, order_p, executed, sl_disable, 
// youngmale, oldmale, peasantmale, youngfemale, oldfemale, slbroiler_id

    return conn.db.any(`
            SELECT * FROM (SELECT DISTINCT brD.farm_id, brD.housing_date, (SELECT SUM(housing_quantity) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as housing_quantity, brD.eviction_date, TO_CHAR(brD.housing_date, 'DD/MM/YYYY') as h_date, 
            (SELECT DISTINCT SUM(eviction_quantity) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as eviction_quantity, brD.category, brD.age, brD.weightgain, brD.synchronized is true as synchronized, TO_CHAR(brD.eviction_date, 'DD/MM/YYYY') as showdate, sg.name as gender_class,
                    brD.lot, brD.order_p, (brD.eviction_date is not null and brD.eviction_quantity is not null) as executed, brD.sl_disable,(SELECT DISTINCT SUM( youngmale) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as youngmale, (SELECT DISTINCT SUM(oldmale) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as oldmale, 
                    (SELECT DISTINCT SUM(peasantmale) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as peasantmale, (SELECT DISTINCT SUM(youngfemale) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as youngfemale, (SELECT DISTINCT SUM(oldfemale) FROM sltxbroiler_detail fg where brD.lot = fg.lot)::integer as oldfemale, brD.slbroiler_id, f.name as farm,
                    (select distinct gender from sltxbroiler_lot lb where brD.slbroiler_detail_id = lb.slbroiler_detail_id) as gender,
                    CASE WHEN broiler_date IS NOT NULL THEN to_char(broiler_date,'IW-IYYY') ELSE to_char(purchase_date,'IW-IYYY') END AS date_o,
                    CASE WHEN scenario_b IS NOT NULL THEN scenario_b ELSE scenario_p END AS scenario_o
            FROM sltxbroiler_detail brD 
            LEFT JOIN  (SELECT brl.slbroiler_id, brl.quantity, brl.gender, brl.slsellspurchase_id, brl.slbroiler_detail_id, 
                br.scheduled_date as broiler_date, sp.programmed_date as purchase_date, ic.scenario_id as scenario_b, sp.scenario_id as scenario_p   
                        FROM sltxbroiler_lot brl  
                        LEFT JOIN sltxbroiler br on br.slbroiler_id = brl.slbroiler_id
                        LEFT JOIN sltxincubator_detail ind on br.slincubator_detail_id = ind.slincubator_detail_id
                        LEFT JOIN sltxincubator ic on ind.incubator_id = ic.slincubator
                        LEFT JOIN sltxsellspurchase sp on brl.slsellspurchase_id = sp.slsellspurchase_id  
                        WHERE (ic.scenario_id = $4 or sp.scenario_id = $4) and (br.scheduled_date BETWEEN  $1 and $2 OR sp.programmed_date BETWEEN  $1 AND $2) AND brl.gender = $3) hey on brD.slbroiler_detail_id = hey.slbroiler_detail_id
            lEFT JOIN osfarm f on brD.farm_id = f.farm_id
            LEFT JOIN slmdgenderclassification sg on sg.slgenderclassification_id = brD.category
            WHERE brD.sl_disable is not true
            GROUP BY brD.eviction_date, brD.category, brD.farm_id, brD.age, brD.weightgain, brD.synchronized, 
                brD.lot, brD.order_p, brD.sl_disable, brD.housing_date, brD.slbroiler_detail_id, f.name, sg.name, brD.eviction_quantity, hey.broiler_date, hey.purchase_date, hey.scenario_p, hey.scenario_b 
            ORDER BY brD.lot ASC) AS i WHERE scenario_o = $4 and (date_o = to_char($1::date,'IW-IYYY') or date_o = to_char($2::date,'IW-IYYY')) and gender = $3`,
    [beginning, ending, gender, scenario_id]);
    // SELECT DISTINCT brD.farm_id, brD.housing_date, SUM(brD.housing_quantity)::integer as housing_quantity, brD.eviction_date, TO_CHAR(brD.housing_date, 'DD/MM/YYYY') as h_date, 
    //         SUM(brD.eviction_quantity)::integer as eviction_quantity, brD.category, brD.age, brD.weightgain, brD.synchronized is true as synchronized, TO_CHAR(brD.eviction_date, 'DD/MM/YYYY') as showdate, sg.name as gender_class,
    //         brD.lot, brD.order_p, (brD.eviction_date is not null and brD.eviction_quantity is not null) as executed, brD.sl_disable,SUM( brD.youngmale)::integer as youngmale, SUM(brD.oldmale)::integer as oldmale, 
    //         SUM(brD.peasantmale)::integer as peasantmale, SUM(brD.youngfemale)::integer as youngfemale, SUM(brD.oldfemale)::integer as oldfemale, brD.slbroiler_id, f.name as farm
    // FROM sltxbroiler_detail brD 
    // LEFT JOIN  (SELECT * 
    //             FROM sltxbroiler br 
    //             LEFT JOIN sltxbroiler_lot brl on br.slbroiler_id = brl.slbroiler_id
    //             LEFT JOIN sltxsellspurchase sp on brl.slsellspurchase_id = sp.slsellspurchase_id  
    //             WHERE br.scheduled_date BETWEEN  $1 and $2 AND sp.programmed_date BETWEEN  $1 AND $2 AND brl.gender = $3) hey on brD.slbroiler_id = hey.slbroiler_id 
    // lEFT JOIN osfarm f on brD.farm_id = f.farm_id
    // LEFT JOIN slmdgenderclassification sg on sg.slgenderclassification_id = brD.category
    // WHERE brD.sl_disable is not true
    // GROUP BY brD.eviction_date, brD.category, brD.farm_id, brD.age, brD.weightgain, brD.synchronized, 
    //     brD.lot, brD.order_p, brD.sl_disable, brD.housing_date, brD.slbroiler_id, f.name, sg.name, brD.eviction_quantity 
    // ORDER BY brD.lot ASC
    
};

exports.DBexecuteBroilerDetail = function(records){
    cs = conn.pgp.helpers.ColumnSet(["?lot",  {name: 'eviction_date', cast: 'date'}, "eviction_quantity", {name: 'category', cast: 'integer'}, "age", {name: "weightgain", cast: 'double precision'}],
        {table: "sltxbroiler_detail", schema: "public"});
    return conn.db.none(conn.pgp.helpers.update(records, cs)+ 'WHERE v.lot = t.lot ');
};

exports.DBupdateSyncStatus = function(records){
    cs = conn.pgp.helpers.ColumnSet(["?slbroiler_detail_id", "synchronized", "order_p"],
        {table: "sltxbroiler_detail", schema: "public"});
    return conn.db.none(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slbroiler_detail_id = t.slbroiler_detail_id ');
};

exports.getDatesEng = function() {
    return conn.db.any(`		
            SELECT TO_CHAR(min(housing_date)-7, 'DD.MM.YYYY') as min_date, TO_CHAR(max(housing_date)+7, 'DD.MM.YYYY') as max_date  
            FROM sltxbroiler_detail 
            WHERE sl_disable is not true and synchronized is true and executed is not true
    `);
    
};

// exports.DBupdateExecutedLots = function(records){
//     cs = conn.pgp.helpers.ColumnSet(["?lot", "executed"],
//         {table: "sltxbroiler_detail", schema: "public"});
//     return conn.db.none(conn.pgp.helpers.update(records, cs)+ ' FROM (SELECT * FROM sltxbroiler_detail A LEFT JOIN )WHERE v.lot = t.lot ');
// };

exports.DBupdateExecutedLots = function(lot){
    
    return conn.db.none(`UPDATE sltxbroiler_detail  b
      SET executed = TRUE  
      FROM ( SELECT a.slbroiler_detail_id as id 
                       FROM sltxbroiler_detail a 
                       LEFT JOIN sltxbr_shed br on a.slbroiler_detail_id = br.slbroiler_detail_id   
                       WHERE ( br.lot = $1 ) group by(a.slbroiler_detail_id)) as i 
      WHERE i.id = b.slbroiler_detail_id`, [lot]);

};

exports.DBfindELotByDate = function(date, lots, farm_id) {
    return conn.db.any(`		
        SELECT distinct br.lot as e_lot FROM sltxbroiler_detail a 
            LEFT JOIN sltxbr_shed br on a.slbroiler_detail_id = br.slbroiler_detail_id 
        WHERE  a.housing_date between $1::date-7 and $1::date+7 and farm_id = $3 and br.lot NOT IN ($2:csv) and synchronized is true and executed is not true and sl_disable is not true`,
    [date, lots, farm_id]);
    
};