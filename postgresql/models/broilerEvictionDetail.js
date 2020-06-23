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

exports.DBaddBroilerEvictionDetail = records => {
    console.log("[DBaddBroilerEvictionDetail]: Voy a insertar el detalle: ");
    console.log(records);
    return conn.db.none("INSERT INTO public.txbroilereviction_detail "+
                        "(broilereviction_id, scheduled_date, scheduled_quantity, farm_id, shed_id, center_id, "+
                        "confirm, execution_quantity, lot, broiler_product_id, slaughterhouse_id ) "+
                        "VALUES $1 ",
    Inserts("${broilereviction_id},${scheduled_date},${scheduled_quantity}, ${farm_id}, ${shed_id}, ${center_id}, "+
                        "${confirm}, ${execution_quantity}, ${lot}, ${broiler_product_id}, ${slaughterhouse_id} ",records));
};

exports.DBfindBroilerEvictionDetail = function(_date, breed_id, partnership_id, scenario_id) {
    // console.log("[DBfindBroilerEvictionDetail]: Entro los que necesitamosssssssssssssssssssssssss");
    // console.log(_date);
    // console.log(breed_id);
    // console.log(partnership_id);
    // console.log(scenario_id);
    return conn.db.any(`SELECT b.slaughterhouse_id, l.name as slaughterhous_name, b.execution_date, b.scheduled_date, b.broilereviction_detail_id, a.broilereviction_id, c.name as farm_name, d.code as shed_name, e.name as center_name, round(capacity_max*stall_width*stall_height) as capacity_shed , 
                          SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product, b.programmed_disable, b.synchronized 
                          FROM txbroilereviction a 
                          LEFT JOIN txbroilereviction_detail b on a.broilereviction_id = b.broilereviction_id
                          LEFT JOIN osslaughterhouse_id l on b.slaughterhouse_id = l.slaughterhouse_id
                          LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                          LEFT JOIN osshed d on b.shed_id = d.shed_id 
                          LEFT JOIN oscenter e on b.center_id = e.center_id 
                          Where projected_date = $1 and breed_id = $2 and a.partnership_id = $3 and scenario_id = $4 and scheduled_quantity > 0 
                          group by lot, c.name, d.code, e.name, capacity_shed, execution_quantity, a.broilereviction_id, b.broilereviction_detail_id`,
    [_date, breed_id, partnership_id, scenario_id]);
}; 

exports.DBfindBroilerEvictionDetail2 = function(_date, breed_id, partnership_id, scenario_id, broilereviction_id) {
    console.log("[DBfindBroilerEvictionDetail]: Entro los que necesitamosssssssssssssssssssssssss");
    console.log("ASDASDASDASD");
    console.log(_date);
    console.log(breed_id);
    console.log(partnership_id);
    console.log(scenario_id);
    console.log(broilereviction_id);
    return conn.db.any(`SELECT b.slaughterhouse_id, b.execution_date, b.scheduled_date, b.broilereviction_detail_id, a.broilereviction_id, c.name as farm_name, c.farm_id as farm_id, d.shed_id as shed_id, d.code as shed_name, e.center_id as center_id, e.name as center_name, round(capacity_max*stall_width*stall_height) as capacity_shed , 
                          SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product , b.executionslaughterhouse_id, b.programmed_disable, b.synchronized
                          FROM txbroilereviction a 
                          LEFT JOIN txbroilereviction_detail b on a.broilereviction_id = b.broilereviction_id 
                          LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                          LEFT JOIN osshed d on b.shed_id = d.shed_id 
                          LEFT JOIN oscenter e on b.center_id = e.center_id
                          Where b.broilereviction_id = $5 and b.programmed_disable is Null or False and projected_date = $1 and a.breed_id = $2 and a.partnership_id = $3 and scenario_id = $4 and scheduled_quantity > 0 and b.broilereviction_id = $5
                          group by lot, c.name, c.farm_id, d.shed_id, d.code, e.center_id, e.name, capacity_shed, execution_quantity, a.broilereviction_id, b.broilereviction_detail_id,
                          b.slaughterhouse_id, b.execution_date, b.scheduled_date, b.executionslaughterhouse_id, b.programmed_disable, b.synchronized `,
    [_date, breed_id, partnership_id, scenario_id, broilereviction_id]);
};
exports.DBfindBroilerEvictionDetailById = function(broilereviction_detail_id) {
    console.log("[DBfindBroilerEvictionDetail]: Entro los que necesitamosssssssssssssssssssssssss");
    console.log(broilereviction_detail_id);
    // console.log(_date);
    // console.log(breed_id);
    // console.log(partnership_id);
    // console.log(scenario_id);
    // console.log(broilereviction_id);
    return conn.db.any(`SELECT b.slaughterhouse_id, b.broilereviction_detail_id, broilereviction_id, b.execution_date, b.scheduled_date,  b.farm_id, b.shed_id,  b.center_id, c.name as farm_name, d.code as shed_name, e.name as center_name, round(d.capacity_max*d.stall_width*d.stall_height) as capacity_shed , 
                          b.executionslaughterhouse_id, t.name as slaughterhous_name, 
                          SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, b.synchronized
                          FROM txbroilereviction_detail b 
                          LEFT JOIN osslaughterhouse t on b.executionslaughterhouse_id = t.slaughterhouse_id
                          LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                          LEFT JOIN osshed d on b.shed_id = d.shed_id 
                          LEFT JOIN oscenter e on b.center_id = e.center_id 
                          Where broilereviction_detail_id = $1
                          group by lot, c.name, d.code, e.name, capacity_shed, execution_quantity, broilereviction_detail_id, t.name,
                          b.slaughterhouse_id, b.execution_date, b.scheduled_date, b.broilereviction_id, b.farm_id, b.shed_id, b.center_id, b.executionslaughterhouse_id, b.programmed_disable, b.synchronized `, [broilereviction_detail_id]);
};

exports.DBfindProductByLot = function(lot) {

    return conn.db.any("SELECT name, scheduled_quantity, scheduled_date, gender "+
                         "FROM txbroilereviction_detail a "+
                         "LEFT JOIN mdbroiler_product b on a.broiler_product_id = b.broiler_product_id "+
                         "WHERE lot = $1 ", [lot]);
};
exports.DBfindProductByBroilerEvictionDetailId = function(id) {

    return conn.db.any("SELECT name, scheduled_quantity, scheduled_date, gender "+
                         "FROM txbroilereviction_detail a "+
                         "LEFT JOIN mdbroiler_product b on a.broiler_product_id = b.broiler_product_id "+
                         "WHERE broilereviction_detail_id = $1 ", [id]);
};


exports.DBupdateBroilerEvictionDetail = function(execution_date, execution_quantity, broilereviction_detail_id, executionslaughterhouse_id) {
    // console.log("[DBupdateBroilerEvictionDetail]: aqui es donde se inserta en broiler detail necesario");
    // console.log(execution_date);
    // console.log(execution_quantity);
    // console.log(broilereviction_detail_id);
    console.log("Llegue a model y traje: ",execution_quantity, execution_date, broilereviction_detail_id, executionslaughterhouse_id);
    return conn.db.none(`UPDATE public.txbroilereviction_detail 
                        SET execution_quantity = $1, execution_date = $2, executionslaughterhouse_id = $4 
                        WHERE broilereviction_detail_id = $3`, [execution_quantity, execution_date, broilereviction_detail_id, executionslaughterhouse_id]);
     
                           
    /*console.log("Voy a insertar el detalle: ", records);
    return conn.db.none('INSERT INTO public.txbroiler_detail '+
                        '(broiler_id, scheduled_date, scheduled_quantity, farm_id, shed_id, '+
                        'confirm, execution_date, execution_quantity, lot, broiler_product_id ) '+
                        'VALUES $1 ',
                        Inserts('${broiler_id},${scheduled_date},${scheduled_quantity}, ${farm_id}, ${shed_id}, '+
                        '${confirm}, ${execution_date}, ${execution_quantity}, ${lot}, ${broiler_product_id} ',records));*/
};

exports.DBupdateDisabledBroilerEvictionDetail = function(broilereviction_detail_id) {

    return conn.db.none(`UPDATE public.txbroilereviction_detail
                        SET programmed_disable= TRUE
                        WHERE broilereviction_detail_id = $1;`, [broilereviction_detail_id]);
  
};