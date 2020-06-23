const config = require("../../config");
const conn = require("../db"); 

exports.DBaddBroiler = function(execution_quantity, next_date, partnership_id,
    scenario_id, breed_id,  lot_incubator) {

    return conn.db.one("INSERT INTO public.txbroiler (projected_date, "+
                      "projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator) "+
                      "VALUES ($1, $2, $3, $4, $5, $6) RETURNING broiler_id ",
    [next_date, execution_quantity, partnership_id,
        scenario_id, breed_id, lot_incubator]);

};

/*AQUI SE INSERTA EN LA NUEVA TABLA DE PROYECCION DE DESALOJO*/

exports.DBaddBroilerEviction = function(execution_quantity, next_date, partnership_id,
    scenario_id, breed_id,  lot_incubator, broiler_detail_id) {

    // console.log("si ingresa a la funcion eviction");
    return conn.db.one("INSERT INTO public.txbroilereviction (projected_date, "+
                      "projected_quantity, partnership_id, scenario_id, breed_id, lot_incubator, broiler_detail_id) "+
                      "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING broilereviction_id ",
    [next_date, execution_quantity, partnership_id,
        scenario_id, breed_id, lot_incubator, broiler_detail_id]); 

};


exports.DBfindprojectedbroilereviction = function(partnership_id, scenario_id, init_date, end_date, breed_id) {
    // console.log(partnership_id, scenario_id, init_date, end_date, breed_id);
    return conn.db.any("SELECT SUM(projected_quantity) as projected_quantity, projected_date, breed_id, SUM(residue) as residue "+
                     "FROM( "+
                     "SELECT SUM(projected_quantity) as projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, breed_id, a.broilereviction_id, "+
                     "(SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txbroilereviction_detail b WHERE a.broilereviction_id = b.broilereviction_id) "+
                     "FROM public.txbroilereviction a "+
                     "WHERE breed_id= $1 and partnership_id = $2 and projected_date BETWEEN $3 and $4 and scenario_id = $5  "+
                     "group by projected_date, breed_id, a.broilereviction_id "+
                     "order by projected_date DESC "+
                     ") a "+
                     "group by projected_date, breed_id ",
    [breed_id, partnership_id, init_date, end_date, scenario_id]);
    /*return conn.db.any("SELECT SUM(projected_quantity) as projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, breed_id, "+
                       "(SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txbroiler_detail WHERE broiler_id = broiler_id) "+
                       "FROM public.txbroiler "+
                       "WHERE breed_id= $1 and partnership_id = $2 and projected_date BETWEEN $3 and $4 and scenario_id = $5 "+
                       "group by projected_date, breed_id "+
                       "order by projected_date DESC ",
                       [breed_id, partnership_id, init_date, end_date, scenario_id]);*/
};



exports.DBfindprojectedbroilereviction2 = function(partnership_id, scenario_id, init_date, end_date, breed_id) {
    console.log("asdasdasdasd");
    console.log(partnership_id, scenario_id, init_date, end_date, breed_id);
    // return conn.db.any("SELECT SUM(projected_quantity) as projected_quantity, projected_date, breed_id, SUM(residue) as residue "+
    //                    "FROM( "+
    //                    "SELECT SUM(projected_quantity) as projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, breed_id, a.broilereviction_id, "+
    //                    "(SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txbroilereviction_detail b WHERE a.broilereviction_id = b.broilereviction_id) "+
    //                    "FROM public.txbroilereviction a "+
    //                    "WHERE breed_id= $1 and partnership_id = $2 and projected_date BETWEEN $3 and $4 and scenario_id = $5  "+
    //                    "group by projected_date, breed_id, a.broilereviction_id "+
    //                    "order by projected_date DESC "+
    //                    ") a "+
    //                    "group by projected_date, breed_id ",
    //                    [breed_id, partnership_id, init_date, end_date, scenario_id]);


    return conn.db.any(`
                        SELECT c.name as farm_name, d.code as shed_name, b.shed_id as shed_code, b.farm_id as farm_code, e.center_id as center_id, e.name as center_name, 
                        a.broilereviction_id, TO_CHAR(a.projected_date, 'DD/MM/YYYY') as projected_date, a.projected_quantity, 
                        a.partnership_id, a.scenario_id, a.breed_id, a.lot_incubator, a.broiler_detail_id,
                        (SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txbroilereviction_detail b WHERE a.broilereviction_id = b.broilereviction_id AND b.programmed_disable IS NULL OR FALSE)
                        FROM public.txbroilereviction a, public.txbroiler_detail b 
                        LEFT JOIN oscenter e on b.center_id = e.center_id ,
                        public.osfarm c, public.osshed d, public.oscenter f 
                        WHERE a.breed_id= $1 and a.partnership_id = $2 and a.projected_date BETWEEN $3 and $4 and a.scenario_id = $5 
                        and b.broiler_detail_id = a.broiler_detail_id
                        and b.shed_id = d.shed_id and b.farm_id = c.farm_id and b.center_id = f.center_id
                      `,[breed_id, partnership_id, init_date, end_date, scenario_id]);

    /*return conn.db.any("SELECT SUM(projected_quantity) as projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, breed_id, "+
                       "(SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txbroiler_detail WHERE broiler_id = broiler_id) "+
                       "FROM public.txbroiler "+
                       "WHERE breed_id= $1 and partnership_id = $2 and projected_date BETWEEN $3 and $4 and scenario_id = $5 "+
                       "group by projected_date, breed_id "+
                       "order by projected_date DESC ",
                       [breed_id, partnership_id, init_date, end_date, scenario_id]);*/
};


exports.DBfindprojectedbroilerevictionByAgeRange = function(partnership_id, scenario_id, init_age, end_age, breed_id, age_date) {
    console.log("asdasdasdasd ");
    console.log(partnership_id, scenario_id, init_age, end_age, breed_id);


    return conn.db.any(`
                        SELECT c.name as farm_name, c.code as code_farm, d.code as shed_name, b.shed_id as shed_code, b.farm_id as farm_code, 
                            (CASE WHEN a.evictionprojected is null THEN false ELSE true END) AS evictionprojected,
                            e.center_id as center_id, e.name as center_name, a.broilereviction_id, 
                            TO_CHAR(a.projected_date, 'DD/MM/YYYY') as projected_date, a.projected_quantity, ($6 - a.projected_date)+1 as age,
                            a.partnership_id, a.scenario_id, a.breed_id, a.lot_incubator, a.broiler_detail_id, product.gender as gender,
                            (SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue 
                             FROM public.txbroilereviction_detail b 
                             WHERE a.broilereviction_id = b.broilereviction_id AND b.programmed_disable IS NULL OR FALSE)
 
                        FROM public.txbroilereviction a, public.txbroiler_detail b 
                        LEFT JOIN oscenter e on b.center_id = e.center_id
                        LEFT JOIN mdbroiler_product product ON product.broiler_product_id = b.broiler_product_id,
                        public.osfarm c, public.osshed d, public.oscenter f
                        
                        WHERE a.breed_id= $1 and a.partnership_id = $2 and ($6 - a.projected_date)+1 BETWEEN $3 and $4 and a.scenario_id = $5 
                        and b.broiler_detail_id = a.broiler_detail_id
                        and b.shed_id = d.shed_id and b.farm_id = c.farm_id and b.center_id = f.center_id and 
                        (a.evictionprojected is null or (a.evictionprojected is true and a.broilereviction_id IN 
                            (
                              select broilereviction_id from txbroilereviction_detail where programmed_disable is null or false
                            )))
                      `,[breed_id, partnership_id, init_age, end_age, scenario_id, age_date]);

};

exports.DBfindBroilerEvictionLot = function(scenario_id, partnership_id, breed_id, _date) {
    // console.log("entro donde quiero");
    // console.log(scenario_id, partnership_id, breed_id, _date);
    return conn.db.any("SELECT * "+
                       "FROM( "+
                       "SELECT projected_date, sum, lot_incubator, projected_quantity, broilereviction_id , (projected_quantity-sum) as residue "+
                       "FROM( "+
                       "select a.projected_date, "+
                      "case when sum(scheduled_quantity) is null then 0 else sum(scheduled_quantity) end as sum , lot_incubator, projected_quantity, a.broilereviction_id "+
                      "from txbroilereviction a "+
                      "LEFT JOIN txbroilereviction_detail b on a.broilereviction_id = b.broilereviction_detail_id "+
                      "Where projected_date = $1 and breed_id = $2 and partnership_id = $3 and scenario_id = $4 "+
                      "group by lot_incubator, a.projected_date, projected_quantity, a.broilereviction_id "+
                      ") a "+
                      ") a "+
                      "WHERE residue >0 ", [_date, breed_id, partnership_id, scenario_id]);
};

exports.findBroilerEvictionFarmAndProduct = function(broilereviction_id) {
    // console.log("entro donde quiero");
    // console.log(scenario_id, partnership_id, breed_id, _date);
    return conn.db.any(`
    SELECT farm.name as farm_name, shed.code as shed_name, product.name as product_name, product.gender as gender 
        FROM txbroilereviction bre
        LEFT JOIN txbroiler_detail b on bre.broiler_detail_id = b.broiler_detail_id
        LEFT JOIN osfarm farm ON farm.farm_id = b.executionfarm_id
        LEFT JOIN osshed shed ON shed.shed_id = b.executionshed_id
        LEFT JOIN mdbroiler_product product ON product.broiler_product_id = b.broiler_product_id
        
        WHERE bre.broilereviction_id = $1
    `, [broilereviction_id]);
};