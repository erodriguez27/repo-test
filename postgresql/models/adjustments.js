const config = require("../../config");
const conn = require("../db");

exports.DBInsertAdjustmentsControl = function(user, adjustments_date, lot_arp, description) {
    console.log("llego al modelo de update de back de DBInsertAdjustmentsControl");
    return conn.db.any(`insert into txadjustmentscontrol (username, adjustment_date, lot_arp, description) 
        VALUES ($1, $2, $3, $4)`,[user, adjustments_date, lot_arp, description]);
};

exports.DBfindAdjustmentsByLot = function(lot) {
    console.log(lot)
    return conn.db.any(`SELECT * FROM txadjustmentscontrol WHERE lot_arp = $1`,[lot]);
};


exports.DBInsertOsAdjustmentsControl = function(username, adjustment_date, os_type, os_id) {
    console.log("llego al modelo de update de back de DBInsertOsAdjustmentsControl");
    return conn.db.any(`insert into osadjustmentscontrol (username, adjustment_date, os_type, os_id) 
    VALUES ($1, $2, $3, $4)`,[username, adjustment_date, os_type, os_id]);
};

exports.DBFindLiftBreadingProductionLotData = function (lot, scenario_id) {
    console.log(lot)

    return conn.db.any(`
    SELECT hd.housingway_detail_id as id, hd.housing_way_id, TO_CHAR(hd.execution_date, 'DD/MM/YYYY') as execution_date , hd.execution_quantity, hd.lot, 
            hd.executionfarm_id as farm_id, hd.executioncenter_id as center_id, hd.executionshed_id as shed_id,
            f.name as farm, c.name as center, s.code as shed, hd.eviction is true as eviction,
            (case when hd.eviction is true then (SELECT username FROM txadjustmentscontrol where lot_arp = $1 and description = 'desalojo') else null end) as username,
            (case when hd.eviction is true then (SELECT adjustment_date FROM txadjustmentscontrol where lot_arp = $1 and description = 'desalojo') else null end) as adjustment_date
    FROM txhousingway_detail hd
        LEFT JOIN txhousingway h on hd.housing_way_id = h.housing_way_id
        LEFT JOIN osfarm f ON hd.executionfarm_id = f.farm_id
        LEFT JOIN oscenter c ON hd.executioncenter_id = c.center_id
        LEFT JOIN osshed s  ON hd.executionshed_id = s.shed_id
    WHERE h.scenario_id = $2 and hd.programmed_disable is not true and (hd.execution_date is not null and hd.execution_quantity is not null and hd.executionfarm_id is not null and hd.executioncenter_id is not null and hd.executionshed_id is not null) and hd.lot = $1`, [lot, scenario_id]);
};

exports.DBFindBroilerLotData = function (lot, scenario_id) {
    console.log(lot)

    return conn.db.any(`
    SELECT hd.broiler_detail_id as id, hd.broiler_id, hd.execution_date , hd.execution_quantity, hd.lot, 
            hd.executionfarm_id as farm_id, hd.executioncenter_id as center_id, hd.executionshed_id as shed_id,
            f.name as farm, c.name as center, s.code as shed, hd.eviction is true as eviction,
            (case when hd.eviction is true then (SELECT username FROM txadjustmentscontrol where lot_arp = $1 and description = 'desalojo') else null end) as username,
            (case when hd.eviction is true then (SELECT adjustment_date FROM txadjustmentscontrol where lot_arp = $1 and description = 'desalojo') else null end) as adjustment_date
    FROM txbroiler_detail hd
        LEFT JOIN txbroiler br on hd.broiler_id = br.broiler_id
        LEFT JOIN osfarm f ON hd.executionfarm_id = f.farm_id
        LEFT JOIN oscenter c ON hd.executioncenter_id = c.center_id
        LEFT JOIN osshed s  ON hd.executionshed_id = s.shed_id
    WHERE br.scenario_id = $2 and hd.programmed_disable is not true and (hd.execution_date is not null and hd.execution_quantity is not null and hd.executionfarm_id is not null and hd.executioncenter_id is not null and hd.executionshed_id is not null) and hd.lot = $1`, [lot, scenario_id]);
};

exports.DBFindBroilerEvictionLotData = function (lot, scenario_id) {
    console.log(lot)

    return conn.db.any(`
    SELECT hd.broilereviction_detail_id as id, hd.broilereviction_id, TO_CHAR(hd.execution_date,'DD/MM/YYYY') as execution_date , hd.execution_quantity, hd.lot, hd.shed_id,
            hd.executionslaughterhouse_id as slaughterhouse_id, sh.name as slaughterhouse, hd.eviction is true as eviction,
            (case when hd.eviction is true then (SELECT username FROM txadjustmentscontrol where lot_arp = $1 and description = 'desalojo') else null end) as username,
            (case when hd.eviction is true then (SELECT TO_CHAR(adjustment_date, 'DD/MM/YYYY') FROM txadjustmentscontrol where lot_arp = $1 and description = 'desalojo') else null end) as adjustment_date
    FROM txbroilereviction_detail hd
        LEFT JOIN txbroilereviction be on hd.broilereviction_id = be.broilereviction_id
	    LEFT JOIN osslaughterhouse sh ON hd.executionslaughterhouse_id = sh.slaughterhouse_id 
    WHERE be.scenario_id = $2 and hd.programmed_disable is not true and hd.execution_date is not null and hd.execution_quantity is not null and hd.executionslaughterhouse_id is not null and hd.lot = $1`, [lot, scenario_id]);
};

exports.DBupdateEvictionedProgrammed = function (table, id_column, id) {

    return conn.db.none("update "+ table +" set eviction = true WHERE " + id_column + "= $1 ", [id]);

};

exports.DBupdateEvictionedProjected = function (table, id_column, id) {

    return conn.db.none("update "+ table +" set evictionprojected = true WHERE " + id_column + "= $1 ", [id]);

};

exports.DBupdateEvictionedProjectedCurve = function (date, lot) {

    return conn.db.none(`update txeggs_storage set evictionprojected = true WHERE lot like '$2#%' and init_date>= $1`, [date, lot]);

};