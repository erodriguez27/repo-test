const config = require("../../config");
const conn = require("../db");

exports.DBaddEggsMovements =  function(eggsM) {
  
    cs = conn.pgp.helpers.ColumnSet(["fecha_movements", "lot", "quantity"
        ,"type_movements","eggs_storage_id"], {table: "txeggs_movements", schema: "public"});
   
    return conn.db.none(conn.pgp.helpers.insert(eggsM, cs));
};

exports.DBupdateEggsMovements = function(eggsM) {
    cs = conn.pgp.helpers.ColumnSet([{name: "fecha_movements",cast: "date"},"lot", "quantity"
        ,"type_movements","eggs_storage_id","description_adjustment"], {table: "txeggs_movements", schema: "public"});
   
    return conn.db.none(conn.pgp.helpers.insert(eggsM, cs ));
    // + ' WHERE v.eggs_movements_id = t.eggs_movements_id'
};


exports.DBfindInventoryRealByPartnership = function(partnership_id) {

    return conn.db.any(`Select  a.incubator_plant_id,c.name ,a.init_date, b.fecha_movements as end_date,b.lot, a.eggs_storage_id, 
                        EXTRACT(DAY FROM(NOW() - b.fecha_movements )) as _day, 
                        c.max_storage, c.min_storage, c.acclimatized, c.suitable, c.expired,  
                        hey.eggs_storage_id ,(hey.egreso + hey.AjusEgreso + hey.Original +hey.Suma)AS eggss from (  
                        SELECT b.fecha_movements,b.eggs_storage_id,  
                              SUM(CASE WHEN b.type_movements = 'Egreso' THEN  b.quantity ELSE 0 END) As Egreso ,  
                              SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusEgreso,  
                              SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) As Original,  
                              SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as Suma  
                        FROM txeggs_movements b  
                        GROUP BY b.eggs_storage_id,b.fecha_movements) AS hey ,txeggs_storage a,txeggs_movements b, osincubatorplant c  
                        WHERE a.eggs_storage_id = hey.eggs_storage_id  AND a.eggs_storage_id = b.eggs_storage_id AND a.incubator_plant_id = c.incubator_plant_id  
                        AND (b.type_movements = 'Original' or b.type_movements = 'Egreso')  
                        AND hey.fecha_movements = b.fecha_movements
                        AND (c.partnership_id = $1 and b.fecha_movements < NOW() or b.fecha_movements is null)   
                        group by hey.eggs_storage_id,_day, a.incubator_plant_id, a.init_date, b.fecha_movements, b.lot,  
                        c.max_storage, c.min_storage,c.name,c.acclimatized, c.suitable, c.expired,  eggss,
                        a.eggs_storage_id 
                        order by b.fecha_movements DESc`,[partnership_id]);




    // return conn.db.any("SELECT a.incubator_plant_id,c.name ,a.init_date, b.fecha_movements as end_date, SUM(b.quantity) as eggs ,b.lot, a.eggs_storage_id, " +
    //                    "EXTRACT(DAY FROM(NOW() - b.fecha_movements )) as _day, c.max_storage, c.min_storage, c.acclimatized, c.suitable, c.expired " +
    //                    "FROM txeggs_storage a,txeggs_movements b, osincubatorplant c " +
    //                    "WHERE a.eggs_storage_id = b.eggs_storage_id " +
    //                    "AND a.incubator_plant_id = c.incubator_plant_id " + 
    //                    "AND (b.type_movements = 'Original' or b.type_movements = 'Ingreso' or b.type_movements = 'Egreso')"+
    //                    "AND (c.partnership_id = $1 and b.fecha_movements < NOW() or b.fecha_movements is null) " +
    //                    "group by _day, a.incubator_plant_id, a.init_date, b.fecha_movements, b.lot, "+
    //                    "c.max_storage, c.min_storage,c.name,c.acclimatized, c.suitable, c.expired,  a.eggs_storage_id  " +
    //                    "order by b.fecha_movements DESc",[partnership_id]);
};

exports.DBfindAvailableByPlant = function(incubator_plant_id) {

    return conn.db.any("SELECT CASE WHEN sum(quantity) is null then 0 else sum(quantity) end as eggs "+
                       "FROM txeggs_movements a, txeggs_storage b "+
                       "WHERE b.incubator_plant_id = $1 and b.end_date < NOW() "+
                       "AND a.eggs_storage_id = b.eggs_storage_id",
    [incubator_plant_id]);
};

exports.DBfindEggsStorageRealByDate = function(scenario_id, breed_id, incubator_plant_id, date) {
    // console.log(scenario_id, breed_id, incubator_plant_id, date);
    return conn.db.any("SELECT case when Sum(eggs) is NULL Then 0 ELSE Sum(eggs) END "+
                       "FROM txeggs_storage a, txeggs_movements b "+
                       "WHERE a.scenario_id = $1 and a.breed_id = $2 "+
                       "AND a.eggs_storage_id = b.eggs_storage_id "+
                       "and a.incubator_plant_id = $3 and a.end_date <= $4 ",
    [scenario_id, breed_id, incubator_plant_id, date]);
};



exports.DBaddMovementOriginal = function(pDate,lot,EggsC,idEggsSt) {
    return conn.db.one("INSERT INTO public.txeggs_movements (fecha_movements,lot,quantity, type_movements,eggs_storage_id) "+
  "VALUES ($1, $2 , $3, $4, $5) RETURNING eggs_movements_id", [ pDate,
        lot,
        EggsC,
        "Original",
        idEggsSt]);
};


exports.DBfindEggByDate = function(init_date,end_date) {
  
    return conn.db.any("SELECT fecha_movements,eggs_storage_id,lot,(" +
                     "SUM(CASE WHEN type_movements = 'Egreso' THEN quantity ELSE 0 END) + SUM(CASE WHEN type_movements = 'Original' THEN quantity ELSE 0 END) +  " +
                     "SUM(CASE WHEN type_movements = 'Ajuste Egreso' and description_adjustment  != 'Compra de huevos' THEN (-1)*quantity ELSE 0 END) +  " +
                     "SUM(CASE WHEN type_movements = 'Ajuste Egreso' and description_adjustment  = 'Compra de huevos' THEN quantity Else 0 End) )As eggs " +
                     "FROM txeggs_movements  "+
                     "where fecha_movements BETWEEN $1 AND (Case WHEN $2 <= NOW() THEN $2 ELSE  NOW() END) and type_movements='Egreso' "+
                     "GROUP BY fecha_movements,eggs_storage_id,lot",
    [init_date,end_date]);
};

exports.DBfindEggsStorageByDate = function(date) {
    return conn.db.any( `Select  Sum(hey.egreso + hey.AjusEgreso + hey.Original + hey.Suma) as eggs from 
                      (SELECT  
                      SUM(CASE WHEN b.type_movements = 'Egreso' THEN  b.quantity ELSE 0 END) As Egreso ,  
                      SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusEgreso,  
                      SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) As Original,  
                      SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as Suma  
                      FROM txeggs_movements b 
                      Where b.fecha_movements <= $1
                      GROUP BY b.eggs_storage_id,b.fecha_movements) AS hey`,[date]);


};

exports.DBfindEggsStorageByDateVer2 = function(partnership_id,date) {
    return conn.db.any(`Select SUM(CASE WHEN NewTable._day <= NewTable.min_storage And NewTable.acclimatized = true THEN NewTable.eggss ELSE 0 END)  
                    + SUM(CASE WHEN NewTable._day > NewTable.min_storage And  NewTable._day < NewTable.max_storage And NewTable.suitable = true THEN NewTable.eggss ELSE 0 END) 
                    + SUM(CASE WHEN NewTable._day >= NewTable.max_storage And NewTable.expired = true THEN NewTable.eggss ELSE 0 END) eggs 
                    from (Select  a.incubator_plant_id,c.name ,a.init_date, b.fecha_movements as end_date,
                    b.lot, a.eggs_storage_id, 
                    EXTRACT(DAY FROM(NOW() - b.fecha_movements )) as _day,   
                    c.max_storage, c.min_storage, c.acclimatized, c.suitable, c.expired,  
                    hey.eggs_storage_id,( hey.egreso+hey.AjusEgreso + hey.Original+hey.Suma) as eggss from (  
                                          SELECT b.fecha_movements,b.eggs_storage_id,  
                                          SUM(CASE WHEN b.type_movements = 'Egreso' THEN  b.quantity ELSE 0 END) As Egreso ,  
                                          SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusEgreso,  
                                          SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) As Original,  
                                          SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as Suma  
                                          FROM txeggs_movements b  
                    GROUP BY b.eggs_storage_id,b.fecha_movements) AS hey ,txeggs_storage a,txeggs_movements b, osincubatorplant c  
                    WHERE a.eggs_storage_id = hey.eggs_storage_id  AND a.eggs_storage_id = b.eggs_storage_id AND a.incubator_plant_id = c.incubator_plant_id   
                    AND (b.type_movements = 'Original' or b.type_movements = 'Egreso')  
                    AND (c.partnership_id = $1 and b.fecha_movements < NOW() or b.fecha_movements is null)  
                    AND hey.fecha_movements = b.fecha_movements
                    group by hey.eggs_storage_id,eggss,_day, a.incubator_plant_id, a.init_date, b.fecha_movements, b.lot, 
                    c.max_storage, c.min_storage,c.name,c.acclimatized, c.suitable, c.expired,  a.eggs_storage_id  
                    order by b.fecha_movements DESc) AS NewTable
                    Where end_date <= $2`,[partnership_id,date]);

};


exports.DBfindEggsStorageByDateDetail = function(scenario_id, breed_id, incubator_plant_id, date) {
 
    return conn.db.any(`Select  DISTINCT  EXTRACT(DAY FROM(timestamp $2 - c.fecha_movements   )) as _day ,a.lot,c.fecha_movements,
                      case when min_storage  <= EXTRACT(DAY FROM(timestamp $2 - c.fecha_movements    ))  and EXTRACT(DAY FROM(timestamp $2 -  c.fecha_movements   )) <= b.max_storage then 'Success'
                      when EXTRACT(DAY FROM(timestamp $2 - c.fecha_movements    )) > b.max_storage then 'Error' ELSE 'Warning' End as state, a.eggs_storage_id ,
                      (( hey.egreso + hey.AjusEgreso + hey.Original + hey.Suma)) as eggs from
                      (SELECT  b.eggs_storage_id,b.fecha_movements,
                        SUM(CASE WHEN b.type_movements = 'Egreso' THEN  b.quantity ELSE 0 END) As Egreso ,  
                        SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusEgreso,  
                        SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) As Original,  
                        SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as Suma  
                      FROM txeggs_movements b
                      GROUP BY b.eggs_storage_id,b.fecha_movements) AS hey ,txeggs_storage a ,osincubatorplant b,txeggs_movements c 
                      WHERE a.incubator_plant_id = b.incubator_plant_id AND  a.eggs_storage_id = hey.eggs_storage_id AND  a.eggs_storage_id = c.eggs_storage_id
                      AND   hey.fecha_movements = c.fecha_movements and  c.type_movements = 'Egreso'
                      AND   a.incubator_plant_id =  $1 and c.fecha_movements <= $2 and scenario_id =  $3 and breed_id =  $4  
                      order by _day DESC `, [incubator_plant_id,date, scenario_id, breed_id]);
};


exports.DBFindIngresoOfEgresoDate = function(date1,date2){

    return conn.db.any(`Select  hey.eggs_storage_id,a.lot,a.fecha_movements ,
                      hey.ingreso,(-1)*hey.egreso as egreso,(( hey.Ingreso + (hey.ajuste+hey.egreso) + hey.Original + hey.Suma)) as eggs 
                      From (SELECT  b.eggs_storage_id,
                        SUM(CASE WHEN b.type_movements = 'Ingreso' THEN b.quantity ELSE 0 END) Ingreso ,  
                        SUM(CASE WHEN b.type_movements = 'Egreso' THEN (-1)*b.quantity ELSE 0 END) Egreso ,  
                        SUM(CASE WHEN b.type_movements = 'Ajuste' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) Ajuste,
                        SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) Original,
                        SUM(CASE WHEN b.type_movements = 'Ajuste' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) Suma
                      FROM txeggs_movements b
                      GROUP BY b.eggs_storage_id) AS hey, txeggs_movements a,txeggs_storage b
                      WHERE  hey.eggs_storage_id = a.eggs_storage_id AND hey.eggs_storage_id = b.eggs_storage_id
                      AND a.type_movements = 'Ingreso'
                      AND a.fecha_movements between $1 AND $2 `,[date1,date2]);

};


exports.DBVerOriginal = function() {
    return conn.db.any( "SELECT eggs_movements_id  "+
                      "FROM txeggs_movements "+
                      "WHERE type_movements = $1 ",["Original"] );
};

exports.DBrecordIngresos = function() {
    return conn.db.any(  `SELECT *
                        FROM txeggs_movements a,txeggs_storage b  
                        WHERE a.type_movements = $1
                        AND a.eggs_storage_id = b.eggs_storage_id
                        Order By a.fecha_movements Desc`,["Ingreso"] );
};

exports.DBrecordEgresos = function() {
    return conn.db.any( `SELECT *
                       FROM txeggs_movements a,txeggs_storage b  
                       WHERE a.type_movements = $1
                       AND a.eggs_storage_id = b.eggs_storage_id
                       Order By a.fecha_movements Desc`,["Egreso"] );
};

exports.DBrecordAjustes = function() {
    return conn.db.any(  `SELECT *
                        FROM txeggs_movements a 
                        WHERE a.type_movements = $1 or a.type_movements = $2
                        Order By a.fecha_movements Desc`,["Ajuste","Ajuste Egreso"] );
};

exports.DBajusteMovementDate = function(date1,date2) {
    return conn.db.any(`SELECT hey.fecha_movements,hey.eggs_storage_id, b.type_movements,b.lot,
                      (CASE WHEN b.type_movements = 'Ingreso' THEN  (hey.Ingreso + hey.AjusIngreso + hey.Original + hey.SumaIngreso)  ELSE (hey.Egreso + hey.AjusEgreso + hey.Original + hey.Suma) END)AS quantity
                      from (SELECT b.fecha_movements,b.eggs_storage_id,
                      SUM(CASE WHEN b.type_movements = 'Ingreso' THEN  b.quantity ELSE 0 END) As Ingreso ,
                      SUM(CASE WHEN b.type_movements = 'Ajuste' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusIngreso, 
                      SUM(CASE WHEN b.type_movements = 'Ajuste' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as SumaIngreso,  
                      SUM(CASE WHEN b.type_movements = 'Egreso' THEN  b.quantity ELSE 0 END) As Egreso ,  
                      SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusEgreso,  
                      SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) As Original,  
                      SUM(CASE WHEN b.type_movements = 'Ajuste Egreso' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as Suma  
                      FROM txeggs_movements b
                      WHERE b.fecha_movements between $3 AND $4  
                      GROUP BY b.eggs_storage_id,b.fecha_movements) AS hey , txeggs_movements b
                      WHERE b.eggs_storage_id = hey.eggs_storage_id 
                      and  hey.fecha_movements =  b.fecha_movements
                      and b.type_movements = $1 or b.type_movements = $2
                      AND quantity != 0
                      group by hey.fecha_movements,hey.eggs_storage_id,b.type_movements,hey.Ingreso,hey.AjusIngreso,
                      hey.Original,hey.SumaIngreso,hey.Egreso,hey.AjusEgreso,hey.Suma,b.lot
                      order by hey.fecha_movements DESc`,["Ingreso","Egreso",date1,date2]  );

};

exports.DBfindEggsChargesByProgramming = function(id) {
    return conn.db.any(`
    SELECT em.eggs_movements_id as eggs_movements_id
	 FROM txprogrammed_eggs pe
    LEFT JOIN txincubator_lot il ON il.programmed_eggs_id = pe.programmed_eggs_id
    LEFT JOIN txeggs_movements em ON em.type_movements = 'egreso' and em.description_adjustment = 'Carga en máquina' and il.quantity = em.quantity and em.fecha_movements = pe.use_date
    LEFT JOIN txeggs_storage es ON es.eggs_storage_id = em.eggs_storage_id
    WHERE pe.programmed_eggs_id = $1 
  `, [id]);
};

exports.updateDisabledEggsMovements = function(records){
    cs = conn.pgp.helpers.ColumnSet(["?programmed_eggs_id","programmed_disable"],
        {table: "txeggs_movements", schema: "public"});
    return conn.db.none(conn.pgp.helpers.update(records, cs)+ ' WHERE v.programmed_eggs_id = t.programmed_eggs_id');
};


