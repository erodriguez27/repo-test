const config = require("../../config");
const conn = require("../db");

exports.DBaddBroiler = function(execution_quantity, next_date, partnership_id,
    scenario_id, breed_id,  lot_incubator, programmed_eggs_id) {

    return conn.db.one("INSERT INTO public.txbroiler (projected_date, "+
                      "projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator, programmed_eggs_id) "+
                      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING broiler_id ",
    [next_date, execution_quantity, partnership_id,
        scenario_id, breed_id, lot_incubator, programmed_eggs_id]);

};

/*AQUI SE INSERTA EN LA NUEVA TABLA DE PROYECCION DE DESALOJO*/

exports.DBaddBroiler2 = function(execution_quantity, next_date, partnership_id,
    scenario_id, breed_id,  lot_incubator) {
    // console.log("si ingresa a la funcion broiler");
    // console.log(execution_quantity);
    //       console.log(next_date);
    //       console.log(partnership_id);
    //       console.log(scenario_id);
    //       console.log(breed_id);
    //       console.log(lot_incubator);

    return conn.db.one("INSERT INTO txbroilereviction (projected_date, "+
                      "projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator) "+
                      "VALUES ($1, $2, $3, $4, $5, $6) RETURNING broilereviction_id ",
    [next_date, execution_quantity, partnership_id,
        scenario_id, breed_id, lot_incubator]);

};


exports.DBfindprojectedbroiler = function(partnership_id, scenario_id, init_date, end_date, breed_id) {
    //console.log("Params: ", partnership_id, scenario_id, init_date, end_date, breed_id);
    return conn.db.any(`SELECT broiler_id, SUM(projected_quantity) as projected_quantity, projected_date,lot_incubator, breed_id, SUM(residue) as residue 
                      FROM( 
                      SELECT SUM(projected_quantity) as projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, breed_id, a.broiler_id, a.lot_incubator,
                      (SELECT case when sum(quantity)> 0  
                        then sum(quantity) else 0 end as residue FROM public.txbroiler_lot lo
                        left join txbroiler_detail hw on lo.broiler_detail_id = hw.broiler_detail_id
                        WHERE lo.broiler_id = a.broiler_id and hw.programmed_disable is null or false) 
                      FROM public.txbroiler a 
                      WHERE breed_id= $1 and projected_date BETWEEN $3 and $4 and scenario_id = $5  
                      group by projected_date, breed_id, a.broiler_id, a.lot_incubator 
                      order by projected_date DESC 
                      ) a 
                      group by broiler_id, projected_date, breed_id,lot_incubator ORDER BY projected_date::date ASC`,
    [breed_id, partnership_id, init_date, end_date, scenario_id]);
    /*return conn.db.any("SELECT SUM(projected_quantity) as projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, breed_id, "+
                       "(SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txbroiler_detail WHERE broiler_id = broiler_id) "+
                       "FROM public.txbroiler "+
                       "WHERE breed_id= $1 and partnership_id = $2 and projected_date BETWEEN $3 and $4 and scenario_id = $5 "+
                       "group by projected_date, breed_id "+
                       "order by projected_date DESC ",
                       [breed_id, partnership_id, init_date, end_date, scenario_id]);*/
};


exports.DBfindBroilerLot = function(scenario_id, partnership_id, breed_id, _date) {
    // console.log(scenario_id, partnership_id, breed_id, _date);
    return conn.db.any("SELECT * "+
                       "FROM( "+
                       "SELECT projected_date, sum, lot_incubator, projected_quantity, broiler_id , (projected_quantity-sum) as residue "+
                       "FROM( "+
                       "select a.projected_date, "+
                      "case when sum(scheduled_quantity) is null then 0 else sum(scheduled_quantity) end as sum , lot_incubator, projected_quantity, a.broiler_id "+
                      "from txbroiler a "+
                      "LEFT JOIN txbroiler_detail b on a.broiler_id = b.broiler_id "+
                      "Where projected_date = $1 and breed_id = $2 and scenario_id = $4 "+
                      "group by lot_incubator, a.projected_date, projected_quantity, a.broiler_id "+
                      ") a "+
                      ") a "+
                      "WHERE residue >0 ", [_date, breed_id, partnership_id, scenario_id]);
};

exports.DBdeleteBroilerByLot = function(lot) {
    return conn.db.none("DELETE FROM public.txbroiler WHERE lot_incubator = $1 ",[lot]);
};


exports.DBfindBRoilerDetailConfirmByLot = function(lot) {
    // console.log('lot: ', lot)
    return conn.db.any("SELECT * "+
                       "FROM txbroiler a "+
                       "left join txbroiler_detail b on a.broiler_id = b.broiler_id "+
                       "WHERE lot_incubator  = $1 and confirm = 0  ", [lot]);
};

exports.DBfindBRoilerConfirmByLot = function(lot) {
    // console.log('lot: ', lot)
    return conn.db.any("SELECT * "+
                       "FROM txbroiler a "+
                       "WHERE lot_incubator  = $1", [lot]);
};
