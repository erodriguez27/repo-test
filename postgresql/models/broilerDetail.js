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


exports.DBfindBroilerDetail2 = function(broiler_id) {
    console.log("consulto brioiler");
    console.log(broiler_id);
    return conn.db.any(`SELECT b.broiler_id, b.broiler_detail_id, c.name as farm_name, d.code as shed_name,   b.farm_id as farm_id, b.shed_id as shed_id, e.center_id as center_id, e.name as center_name, round(d.capacity_max*d.stall_width*d.stall_height) as capacity_shed , 
                          executionfarm_id as executedfarm_id, executioncenter_id as executedcenter_id, executionshed_id as executedshed_id, 
                          SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product , execution_date, programmed_disable, b.synchronized  
                          FROM txbroiler a 
                          LEFT JOIN txbroiler_detail b on a.broiler_id = b.broiler_id 
                          LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                          LEFT JOIN public.osfarm z on b.executionfarm_id = z.farm_id 
                          LEFT JOIN osshed d on b.shed_id = d.shed_id  
                          LEFT JOIN public.osshed v on b.executionshed_id = v.shed_id 
                          LEFT JOIN oscenter e on b.center_id = e.center_id 
                          LEFT JOIN public.oscenter w on b.executioncenter_id = w.center_id 
                          Where b.broiler_detail_id IN 
                          (
                            select broiler_detail_id 
                            from txbroiler_lot lo
                            WHERE lo.broiler_id IN ($1:csv)
                            group by broiler_detail_id 
                            having count(distinct lo.broiler_id) = $2
                          ) 

                          AND b.programmed_disable IS NULL OR FALSE 
                          group by b.executionfarm_id, b.executioncenter_id, b.executionshed_id, b.programmed_disable, b.synchronized,
                          b.broiler_id, b.shed_id, b.farm_id, broiler_detail_id, lot, c.name, d.code, e.center_id, e.name, capacity_shed, execution_quantity, execution_date `, [broiler_id, broiler_id.length]);
};

exports.DBfindMaxLotBroiler = function(scenario_id) {
    // console.log("DBfindLot: ", housingway_id);
    let promise = conn.db.one("SELECT MAX(CAST((substring(a.lot, 2, 10)) AS INTEGER)) FROM public.txbroiler_detail a left join txbroiler b on b.broiler_id = a.broiler_id where scenario_id = $1", [scenario_id]);
    return promise;
};

exports.DBaddbroilerDetailLot = function(broiler_detail_id, broiler_id, quantity) {

    return conn.db.one(`INSERT INTO public.txbroiler_lot (broiler_detail_id, broiler_id, quantity) 
                    VALUES ($1, $2, $3) RETURNING broiler_lot_id `,
    [broiler_detail_id, broiler_id, quantity]);

};
exports.DBaddbroilerdetail = records => {
    console.log("Voy a insertar el detalle engorde detail: ", records);
    return conn.db.any("INSERT INTO public.txbroiler_detail "+
                        "(broiler_id, scheduled_date, scheduled_quantity, farm_id, shed_id, center_id, "+
                        "confirm, execution_date, execution_quantity, lot, broiler_product_id ) "+
                        "VALUES $1 " +
                        "RETURNING broiler_detail_id",
    Inserts("${broiler_id},${scheduled_date},${scheduled_quantity}, ${farm_id}, ${shed_id}, ${center_id}, "+
                        "${confirm}, ${execution_date}, ${execution_quantity}, ${lot}, ${broiler_product_id} ",records));
};

exports.DBupdatebroilerdetail = function(execution_date, execution_quantity, broiler_detail_id, executionfarm_id, executioncenter_id,executionshed_id) {
    // console.log("aqui es donde se actualiza en broiler detail necesario");
    // console.log(execution_date);
    // console.log(execution_quantity);
    // console.log(broiler_detail_id);
    console.log("recibido en el modelo: ", execution_date, execution_quantity, broiler_detail_id, executionfarm_id, executioncenter_id,executionshed_id);
    return conn.db.none(`UPDATE public.txbroiler_detail  
                        SET execution_quantity = $1, execution_date = $2, executionfarm_id = $4, executioncenter_id = $5, executionshed_id = $6  
                        WHERE broiler_detail_id = $3`, [execution_quantity, execution_date, broiler_detail_id, executionfarm_id, executioncenter_id,executionshed_id]);
     
                           
    /*console.log("Voy a insertar el detalle: ", records);
    return conn.db.none('INSERT INTO public.txbroiler_detail '+
                        '(broiler_id, scheduled_date, scheduled_quantity, farm_id, shed_id, '+
                        'confirm, execution_date, execution_quantity, lot, broiler_product_id ) '+
                        'VALUES $1 ',
                        Inserts('${broiler_id},${scheduled_date},${scheduled_quantity}, ${farm_id}, ${shed_id}, '+
                        '${confirm}, ${execution_date}, ${execution_quantity}, ${lot}, ${broiler_product_id} ',records));*/
};
exports.DBupdateDisabledbroilerdetail = function(broiler_detail_id) {
    return conn.db.none(`UPDATE public.txbroiler_detail  
                            SET programmed_disable = TRUE
                            WHERE broiler_detail_id = $1`, [broiler_detail_id]);
};

/*

  exports.DBfindbroilerDetailByBd= function(broiler_detail_id) {
       return conn.db.none( SELECT

    };



*/



exports.DBfindBroilerDetail = function(broiler_id, _date, breed_id, partnership_id, scenario_id) {
    console.log("consulto brioiler");
    console.log(broiler_id);
    // return 
    console.log(conn.db.any(`SELECT b.broiler_id, b.broiler_detail_id, c.name as farm_name, d.code as shed_name,   b.farm_id as farm_id, b.shed_id as shed_id, e.center_id as center_id, e.name as center_name, round(d.capacity_max*d.stall_width*d.stall_height) as capacity_shed , 
                            executionfarm_id as executedfarm_id, executioncenter_id as executedcenter_id, executionshed_id as executedshed_id, 
                            SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product , execution_date, programmed_disable, b.synchronized   
                            FROM txbroiler a 
                            LEFT JOIN txbroiler_detail b on a.broiler_id = b.broiler_id 
                            LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                            LEFT JOIN public.osfarm z on b.executionfarm_id = z.farm_id 
                            LEFT JOIN osshed d on b.shed_id = d.shed_id  
                            LEFT JOIN public.osshed v on b.executionshed_id = v.shed_id 
                            LEFT JOIN oscenter e on b.center_id = e.center_id 
                            LEFT JOIN public.oscenter w on b.executioncenter_id = w.center_id 
                            Where b.broiler_id = $1 AND b.programmed_disable IS NULL OR FALSE 
                            group by b.broiler_id, broiler_detail_id, lot, c.name, d.code, e.center_id, e.name, capacity_shed, execution_quantity, execution_date `, [broiler_id])
    );//   return conn.db.any(`SELECT b.broiler_detail_id, c.name as farm_name, d.code as shed_name,   b.farm_id as farm_id, b.shed_id as shed_id, e.center_id as center_id, e.name as center_name, round(d.capacity_max*d.stall_width*d.stall_height) as capacity_shed , 
    //                       executionfarm_id as executedfarm_id, executioncenter_id as executedcenter_id, executionshed_id as executedshed_id, 
    //                       SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product , execution_date 
    //                       FROM txbroiler a 
    //                       LEFT JOIN txbroiler_detail b on a.broiler_id = b.broiler_id 
    //                       LEFT JOIN osfarm c on b.farm_id = c.farm_id 
    //                       LEFT JOIN public.osfarm z on b.executionfarm_id = z.farm_id 
    //                       LEFT JOIN osshed d on b.shed_id = d.shed_id  
    //                       LEFT JOIN public.osshed v on b.executionshed_id = v.shed_id 
    //                       LEFT JOIN oscenter e on b.center_id = e.center_id 
    //                       LEFT JOIN public.oscenter w on b.executioncenter_id = w.center_id 
    //                       Where broiler_id = $5 and projected_date = $1 and breed_id = $2  and scenario_id = $4 and scheduled_quantity > 0 
    //                       group by broiler_detail_id, lot, c.name, d.code, e.center_id, e.name, capacity_shed, execution_quantity, execution_date `, [_date, breed_id, partnership_id, scenario_id, broiler_id]);
};


exports.DBfindBroilerDetailById = function(broiler_detail_id) {
    // console.log("consulto brioiler");
    return conn.db.any(`SELECT broiler_detail_id, a.farm_id, a.shed_id,  a.center_id, round(d.capacity_max*d.stall_width*d.stall_height) as capacity_shed , 
                          executionfarm_id as executedfarm_id, executioncenter_id as executedcenter_id, executionshed_id as executedshed_id, 
                          z.name as excecutedfarm, w.name as excecutedcenter, v.code as executedshed, 
                          SUM(scheduled_quantity) as scheduled_quantity, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date, lot, execution_quantity, TO_CHAR(execution_date, 'DD/MM/YYYY') as execution_date, a.synchronized 
                          FROM txbroiler_detail a 
                          LEFT JOIN osfarm c on a.farm_id = c.farm_id 
                          LEFT JOIN public.osfarm z on a.executionfarm_id = z.farm_id 
                          LEFT JOIN osshed d on a.shed_id = d.shed_id  
                          LEFT JOIN public.osshed v on a.executionshed_id = v.shed_id 
                          LEFT JOIN oscenter e on a.center_id = e.center_id 
                          LEFT JOIN public.oscenter w on a.executioncenter_id = w.center_id 
                          Where broiler_detail_id= $1
                          group by  a.farm_id, a.center_id, a.shed_id, a.executionfarm_id, a.executioncenter_id, a.executionshed_id, a.synchronized,
                          broiler_detail_id, lot, c.name, d.code, e.center_id, e.name, capacity_shed, execution_quantity, execution_date, scheduled_date, z.name, w.name, v.code`, [broiler_detail_id]);
};

exports.DBfindProductByLot = function(lot) {
    console.log("el lot");
    console.log(lot);

    return conn.db.any("SELECT name, gender, scheduled_quantity, a.execution_date, a.execution_quantity "+
                         "FROM txbroiler_detail a "+
                         "LEFT JOIN mdbroiler_product b on a.broiler_product_id = b.broiler_product_id "+
                         "WHERE lot = $1 ", [lot]);
};

exports.DBdeleteBroilerDetailByLot = function(lot) {
    return conn.db.none("DELETE FROM public.txbroiler_detail "+
                        "WHERE lot = $1 and confirm = 0 ",[lot]);
};

exports.DBfindAllDateQuantityFarmProduct = function() {
    // return conn.db.any("SELECT '3' as POS, a.broiler_id as ID, TO_CHAR(a.scheduled_date, 'DD.MM.YYYY') as SCHEDULED_DATE, "+
    //     "a.scheduled_quantity as SCHEDULED_QUANTITY, b.code as CENTER_CODE, "+
    //     "(SELECT code FROM public.mdproduct WHERE name = 'POLLO VIVO') as PRODUCT_CODE "+
    //     "FROM public.txbroiler_detail a "+
    //     "LEFT JOIN public.osfarm b on a.farm_id = b.farm_id ");

    // // LISTO
    return conn.db.any(`SELECT '3' as POS, TO_CHAR(a.scheduled_date + 46, 'DD.MM.YYYY') as SCHEDULED_DATE,
                sum(a.scheduled_quantity) as SCHEDULED_QUANTITY, b.code as CENTER_CODE, '160001' as PRODUCT_CODE
                FROM public.txbroiler_detail a 
                LEFT JOIN public.osfarm b on a.farm_id = b.farm_id 
                GROUP BY (a.scheduled_date, b.code)`);
};

    
exports.DBgetOldShedBroiler= function(id){
    return conn.db.any("select a.shed_id "+
              "from public.txbroiler_detail a "+
              "where a.broiler_detail_id= $1", [id]);
};
  
exports.DBfindIncubatorLotByBroilerLot = function(id, isSapLot = false) {
    return conn.db.any(`SELECT b.lot_incubator, bl.quantity
    FROM txbroiler_detail bd
    LEFT JOIN txbroiler_lot bl ON bl.broiler_detail_id = bd.broiler_detail_id
    LEFT JOIN txbroiler b ON b.broiler_id = bl.broiler_id
    LEFT JOIN txprogrammed_eggs pe ON b.programmed_eggs_id = pe.programmed_eggs_id
    WHERE bd.broiler_detail_id = $1`, [id]);


    // return conn.db.any(`SELECT ${isSapLot ? 'b.lot_incubator' : 'pe.lot_sap as lot_incubator'}, bl.quantity
    // FROM txbroiler_detail bd
    // LEFT JOIN txbroiler_lot bl ON bl.broiler_detail_id = bd.broiler_detail_id
    // LEFT JOIN txbroiler b ON b.broiler_id = bl.broiler_id
    // LEFT JOIN txprogrammed_eggs pe ON b.programmed_eggs_id = pe.programmed_eggs_id
    // WHERE bd.broiler_detail_id = $1`, [id]);
};

exports.DBfindBroilerDetailByLotSap = function(lot_sap) {

    return conn.db.any(`SELECT a.broiler_detail_id, a.lot
                      FROM txbroiler_detail a 
                      WHERE a.lot_sap = $1`, [lot_sap]);
};

exports.DBupdateSyncStatus = function(id, order) {
    let promise = conn.db.none("UPDATE public.txbroiler_detail SET synchronized = TRUE, order_p = $2 WHERE broiler_detail_id = $1",
        [id, order]);

    return promise;
};

exports.DBfindBroilerDetailIdByLot = function(lot, scenario_id,isSapLot) {
    return conn.db.one(`
    SELECT bd.broiler_detail_id
    FROM txbroiler_detail bd
        left join txbroiler b on b.broiler_id = bd.broiler_id 
    WHERE scenario_id = ${scenario_id} and ${isSapLot ? "bd.lot_sap" : "bd.lot"} = $1
  `, [lot]);
};

exports.DBfindShedAndFarm = function(id) {
    return conn.db.one(`
    SELECT f.name as farm, s.code as shed
    FROM txbroiler_detail bd
    LEFT JOIN osfarm f ON f.farm_id = bd.farm_id
    LEFT JOIN osshed s ON s.shed_id = bd.shed_id
    WHERE bd.broiler_detail_id = $1
  `, [id]);
};