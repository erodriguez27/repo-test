const config = require("../../config");
const conn = require("../db");


exports.DBfindtraceabilityLot = function(lot) {
    console.log("llego al modelo con el lote");  
    console.log(lot);
    // let promise = conn.db.one('select MAX(CAST((substring(lot, 2, 10)) AS INTEGER)) from txhousingway_detail where incubator_plant_id = 0');
    // return promise;
};


exports.DBfindHousingwayDetailIdByLot = function(lot, scenario_id, isSapLot = false) {
    console.log(isSapLot ? "td.lot_sap" : "td.lot", lot, scenario_id)
    return conn.db.one(`SELECT td.housingway_detail_id
                      FROM txhousingway_detail td
                            left join txhousingway b on b.housing_way_id = td.housing_way_id 
                      WHERE b.scenario_id = ${scenario_id} and ${isSapLot ? "td.lot_sap" : "td.lot"} = $1 and td.programmed_disable is null or false`, [lot]);
};


exports.DBfindEggsLot = function(lot, isSapLot = false) {
    
};

exports.DBfindHousingwayIdById = function(idhwd) {
    return conn.db.one(`SELECT td.housing_way_id
                      FROM txhousingway td
                      WHERE td.predecessor_id = $1`, [idhwd]);
};


exports.DBfindHousingwaylotById = function(idhw) {
    return conn.db.any(`SELECT td.production_id, hw.lot
                      FROM txhousingway_lot td
					  LEFT JOIN txhousingway_detail hw on td.production_id = hw.housingway_detail_id
                      WHERE td.housingway_id = $1 and hw.programmed_disable is null or false`, [idhw]);
};

exports.DBfindIncubatorLot = function(lot, scenario_id) {
    return conn.db.any(`select il.programmed_eggs_id, pe.lot_incubator
                        from txeggs_movements em 
                        left join txeggs_storage c on c.eggs_storage_id = em.eggs_storage_id 
						join txincubator_lot il on em.eggs_movements_id = il.eggs_movements_id
						left join txprogrammed_eggs pe on il.programmed_eggs_id = pe.programmed_eggs_id
						where scenario_id = ${scenario_id} and em.lot like '$1#%'
						group by (il.programmed_eggs_id, pe.lot_incubator)`, [lot]);

	
	
};

exports.DBfindBroilerLot = function(lot, scenario_id) {
    return conn.db.any(`select bl.broiler_detail_id, bd.lot
						from txbroiler b
						join txbroiler_lot bl on b.broiler_id = bl.broiler_id
						join txbroiler_detail bd on bl.broiler_detail_id = bd.broiler_detail_id

						where b.scenario_id = ${scenario_id} and b.lot_incubator = $1 and bd.programmed_disable is null or false`, [lot]);

	
	
};

exports.DBfindPlexusAndBuyLot = function(lot, scenario_id) {
    return conn.db.any(`select em.eggs_movements_id, il.programmed_eggs_id, pe.lot_incubator
                        from txeggs_movements em
                        left join txeggs_storage es on es.eggs_storage_id = em.eggs_storage_id
						join txincubator_lot il on em.eggs_movements_id = il.eggs_movements_id
						join txprogrammed_eggs pe on il.programmed_eggs_id = pe.programmed_eggs_id
						where scenario_id = ${scenario_id} and em.lot = $1`, [lot]);
};