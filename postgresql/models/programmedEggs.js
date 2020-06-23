const config = require("../../config");
const conn = require("../db");


function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }

    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBaddProgrammedLot = function(programmed_eggs_id, eggs_movements_id, quantity) {

    return conn.db.one(`INSERT INTO public.txincubator_lot (programmed_eggs_id, eggs_movements_id, quantity) 
                      VALUES ($1, $2, $3) RETURNING incubator_lot_id `,
    [programmed_eggs_id, eggs_movements_id, quantity]);

};

exports.DBfindMaxLotInc = function(scenario_id) {
    // console.log("DBfindLot: ", housingway_id);
    let promise = conn.db.one("SELECT MAX(CAST((substring(a.lot_incubator, 2, 10)) AS INTEGER)) FROM public.txprogrammed_eggs a left join txeggs_movements b on b.programmed_eggs_id = a.programmed_eggs_id left join txeggs_storage c on c.eggs_storage_id = b.eggs_storage_id where scenario_id = $1", [scenario_id]);
    return promise;
};

exports.DBaddProgrammed = function(programmed_eggs) {
    console.log("lo que voy a agregar");
    console.log(programmed_eggs);

    let promise = conn.db.any("INSERT INTO public.txprogrammed_eggs (incubator_id, "+
                             "lot_breed, lot_incubator, use_date, eggs, breed_id, execution_quantity, eggs_storage_id, confirm, released, eggs_movements_id, diff_days)  VALUES $1 RETURNING programmed_eggs_id ",
    Inserts("${incubator_id}, ${lot_breed}, ${lot_incubator}, "+
    "${_date}, ${eggs}, ${breed_id}, ${execution_quantity}, ${eggs_storage_id}, 0, false, ${eggs_movements_id}, ${diff_days}", programmed_eggs));
    return promise;
};

exports.DBfindExecutionByProgrammedId = function(programmed_eggs_id){
    return conn.db.any(`SELECT pe.programmed_eggs_id, inc.name, TO_CHAR(pe.use_date, 'YYYY-MM-DD') as dateS, inc.capacity as capacity, br.name as breed_name, pe.incubator_id, lot_incubator, use_date, pe.eggs, pe.breed_id, pe.execution_quantity, (pe.execution_quantity is not null) as executed 
                        FROM public.txprogrammed_eggs pe
                        LEFT JOIN osincubator inc on pe.incubator_id = inc.incubator_id
                        LEFT JOIN mdbreed br on pe.breed_id = br.breed_id
                        WHERE pe.programmed_eggs_id = $1`,[programmed_eggs_id]);
};
exports.DBupdateExecutionByProgrammedId = function(programmed_eggs_id,quantity){
    return conn.db.any(`UPDATE public.txprogrammed_eggs
	                    SET execution_quantity= $2
                        WHERE programmed_eggs_id = $1`,[programmed_eggs_id,quantity]);
};

exports.DBfindProgrammedEggs = function(scenario_id, breed_id, incubator_plant_id, date) {

    return conn.db.any(`SELECT DISTINCT  EXTRACT(DAY FROM(NOW() - end_date   )) as _day, lot, eggs, synchronized, 
                        case when min_storage  <= EXTRACT(DAY FROM(NOW() - end_date   ))  and EXTRACT(DAY FROM(NOW() - end_date   )) <= max_storage then 'Success' 
                        when EXTRACT(DAY FROM(NOW() - end_date   )) > max_storage then 'Error' ELSE 'Warning' End as state, eggs_storage_id, lot 
                        FROM txeggs_storage a 
                        LEFT JOIN osincubatorplant b on a.incubator_plant_id = b.incubator_plant_id 
                        WHERE a.incubator_plant_id = $1 and end_date <= $2 and scenario_id = $3 and breed_id = $4 and eggs !=0 
                        order by _day DESC `, [incubator_plant_id,date, scenario_id, breed_id]);
};



exports.DBupdateProgrammedStatus = function(date) {
    // const cs = conn.pgp.helpers.ColumnSet(['programmed_eggs_id', {name:'released', init: col => {
    //     return true;
    //   }
    // }], {table: 'txprogrammed_eggs', schema: 'public'});

    //   return conn.db.none(conn.pgp.helpers.update(data, cs) + ' WHERE v.programmed_eggs_id = t.programmed_eggs_id');

    return conn.db.none(`UPDATE txprogrammed_eggs a 
                      SET released = true  
                      WHERE $1 >= a.use_date + a.diff_days + 22 and a.released != true`, [date]);
};




//Buscar los huevos que ya fueron programados
exports.DBfindProgrammerLot = function(breed_id, incubator_plant_id, date) {
    console.log(breed_id, incubator_plant_id, date);
    return conn.db.any("SELECT b.available as disponibilidad, a.programmed_eggs_id, a.incubator_id, name, capacity, lot_breed, lot_incubator, eggs, "+
                       "execution_quantity, CASE WHEN execution_quantity is null THEN true ELSE false END as available, "+
                       "'None' as state_date, '' as state_text_date, execution_quantity "+
                       "FROM txprogrammed_eggs a "+
                       "LEFT JOIN osincubator b on a.incubator_id = b.incubator_id "+
                       "where use_date = $1 and a.incubator_id in ($2:csv) and breed_id = $3 ",
    [date, incubator_plant_id, breed_id]);
};


exports.DBupdateProgrammedEggs = function(execution_quantity, programmed_eggs_id, execution_date) {

    console.log("LO QUE RECIBI Y QUIERO");
    console.log(execution_quantity);
    console.log(programmed_eggs_id);

    let promise = conn.db.any("UPDATE public.txprogrammed_eggs SET execution_quantity = $1, use_date = $3 "+
                             "WHERE programmed_eggs_id = $2 RETURNING programmed_eggs_id",
    [execution_quantity, programmed_eggs_id, execution_date]);

    return promise;
};


exports.DBfindProgrammedEggsByLot = function(lot) {

    return conn.db.any("SELECT eggs_storage_id, eggs "+
                       "FROM txprogrammed_eggs "+
                       "WHERE lot_incubator = $1 and confirm = 0", [lot]);
};

exports.deleteProgrammedByLot = function(lot) {

    return conn.db.none("DELETE FROM public.txprogrammed_eggs WHERE lot_incubator = $1", [lot]);

};

exports.DBfindAllDateQuantityFarmProduct = function() {
    // old
    // return conn.db.any("SELECT '2' as POS, a.programmed_eggs_id as ID, TO_CHAR(a.use_date, 'DD.MM.YYYY') as SCHEDULED_DATE, "+
    //     "a.eggs as SCHEDULED_QUANTITY, c.code as CENTER_CODE, "+
    //     "(SELECT code FROM public.mdproduct WHERE name = 'HUEVO INCUBABLE DE REPRODUCTORA') as PRODUCT_CODE "+
    //     "FROM public.txprogrammed_eggs a "+
    //     "LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id " +
    // "LEFT JOIN public.osincubatorplant c on b.incubator_plant_id = c.incubator_plant_id ");

    // // LISTO
    return conn.db.any(`SELECT '2' as POS, TO_CHAR(a.use_date + 21, 'DD.MM.YYYY') as SCHEDULED_DATE, sum(a.execution_quantity) as SCHEDULED_QUANTITY, 
            c.code as CENTER_CODE, '160000' as PRODUCT_CODE
            FROM public.txprogrammed_eggs a 
            LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id 
            LEFT JOIN public.osincubatorplant c on b.incubator_plant_id = c.incubator_plant_id
      group by(a.use_date, c.code)`);
};


exports.DBfindProgrammedEggs2 = function(eggs_movements_id) {

    // return conn.db.any("SELECT DISTINCT  EXTRACT(DAY FROM(NOW() - end_date   )) as _day, lot, eggs, "+
    //                    "case when min_storage  <= EXTRACT(DAY FROM(NOW() - end_date   ))  and EXTRACT(DAY FROM(NOW() - end_date   )) <= max_storage then 'Success' "+
    //                    "when EXTRACT(DAY FROM(NOW() - end_date   )) > max_storage then 'Error' ELSE 'Warning' End as state, eggs_storage_id, lot "+
    //                    "FROM txeggs_storage a "+
    //                    "LEFT JOIN osincubatorplant b on a.incubator_plant_id = b.incubator_plant_id "+
    //                    "WHERE a.incubator_plant_id = $1 and end_date <= $2 and scenario_id = $3 and breed_id = $4 and eggs !=0 "+
    //                    "order by _day DESC ", [incubator_plant_id,date, scenario_id, breed_id]);

    return conn.db.any(`select a.programmed_eggs_id, a.lot_breed, a.lot_incubator, a.eggs, b.name, b.capacity, b.available as disp,  a.synchronized, 
                        CASE WHEN a.execution_quantity is null THEN true ELSE false END as available, a.eggs_movements_id, a.execution_quantity, a.use_date as execution_date, a.execution_quantity is not null as isexecuted
                        from txprogrammed_eggs a
                        LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id 
                        LEFT JOIN public.txincubator_lot c on a.programmed_eggs_id = c.programmed_eggs_id and a.programmed_disable is not true 
                        where c.eggs_movements_id IN ($1:csv) 
                        group by(a.programmed_eggs_id, a.lot_breed, a.lot_incubator,  a.eggs, b.name, b.capacity, b.available )`, [eggs_movements_id]);

    

};

exports.DBfindColdRoomLotsByProgramming = function(id, scenario_id, isSapLot = false) {
    return conn.db.any(`
    SELECT ${isSapLot ? "es.sap_lot as lot" : "em.lot"}, il.quantity
    FROM txprogrammed_eggs pe
    LEFT JOIN txincubator_lot il ON il.programmed_eggs_id = pe.programmed_eggs_id
    LEFT JOIN txeggs_movements em ON em.eggs_movements_id = il.eggs_movements_id
    LEFT JOIN txeggs_storage es ON es.eggs_storage_id = em.eggs_storage_id
    WHERE scenario_id = ${scenario_id} and pe.programmed_eggs_id = $1
  `, [id]);
};

exports.DBupdateSyncStatus = function(id, order) {
    let promise = conn.db.none("UPDATE public.txprogrammed_eggs SET synchronized = TRUE, order_p = $2 WHERE programmed_eggs_id = $1",
        [id, order]);

    return promise;
};

exports.DBfindProgrammedEggs = function(lot_sap) {

    return conn.db.any(`SELECT a.programmed_eggs_id, a.lot_incubator
                      FROM txprogrammed_eggs a 
                      WHERE a.lot_sap = $1`, [lot_sap]);
};

exports.DBfindProgrammedEggsIdByLot = function(lot, scenario_id, isSapLot = false) {
    return conn.db.one(`
    SELECT DISTINCT pe.programmed_eggs_id
    FROM txprogrammed_eggs pe
        left join txeggs_movements b on b.programmed_eggs_id = pe.programmed_eggs_id 
        left join txeggs_storage c on c.eggs_storage_id = b.eggs_storage_id 
    WHERE scenario_id = ${scenario_id} and ${isSapLot ? "pe.lot_sap" : "pe.lot_incubator"} = $1
  `, [lot]);
};

exports.DBfindIncubatorPlantAndMachine = function(id) {
    return conn.db.one(`
    SELECT im.name as incubator_name, im.code as incubator_code, inp.name as incubator_plant_name, inp.code as incubator_plant_code
    FROM txprogrammed_eggs pe
    LEFT JOIN osincubator im ON im.incubator_id = pe.incubator_id
    LEFT JOIN osincubatorplant inp ON inp.incubator_plant_id = im.incubator_plant_id
    WHERE pe.programmed_eggs_id = $1
  `, [id]);
};

exports.updateDisabledProgrammedEggs = function(programmed_eggs_id) {
    let promise = conn.db.one("UPDATE public.txprogrammed_eggs SET programmed_disable = TRUE WHERE programmed_eggs_id = $1 RETURNING incubator_id, -1*eggs as eggs",
        [programmed_eggs_id]);

    return promise;
};