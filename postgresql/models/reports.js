const config = require("../../config");
const conn = require("../db");







exports.DBfindLiftBreeding = function(init_date, end_date, breed_id, partnership_id, scenario_id) {

    console.log("modelo de reportes de levante y cria");
    console.log(init_date);
    console.log(end_date);
    console.log(breed_id);



    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
                       TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, a.lot, 
                       c.name as farm_name, e.name as center_name, b.code as shed_name, 
					   f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
                       a.execution_quantity - a.scheduled_quantity as diferentquantity, 
                       (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
                       FROM public.txhousingway_detail a 
                       LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                       LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
					   LEFT JOIN oscenter e on a.center_id = e.center_id
					   LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
					   LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
					   LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                       LEFT JOIN public.txhousingway d on a.housing_way_id = d.housing_way_id 
                       WHERE d.scenario_id = $5 and a.scheduled_date BETWEEN $1 and $2 and d.breed_id = $3 and a.incubator_plant_id = 0 and d.partnership_id = $4 and a.programmed_disable is null or false`,
    [init_date, end_date, breed_id, partnership_id, scenario_id]);

};
exports.DBfindAllLiftBreeding = function(init_date, end_date, partnership_id, scenario_id) {

    console.log("modelo de reportes de levante y cria");
    console.log(init_date);
    console.log(end_date);



    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
                       TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, a.lot, w.name as breed,  
                       c.name as farm_name, e.name as center_name, b.code as shed_name, 
					   f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
                       a.execution_quantity - a.scheduled_quantity as diferentquantity, 
                       (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
                       FROM public.txhousingway_detail a 
                       LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                       LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
					   LEFT JOIN oscenter e on a.center_id = e.center_id
					   LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
					   LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
					   LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                       LEFT JOIN public.txhousingway d on a.housing_way_id = d.housing_way_id 
                       LEFT JOIN mdbreed w on w.breed_id = d.breed_id
                       WHERE d.scenario_id = $4 and a.scheduled_date BETWEEN $1 and $2 and a.incubator_plant_id = 0 and d.partnership_id = $3 and a.programmed_disable is null or false`,
    [init_date, end_date, partnership_id, scenario_id]);

};

exports.DBfindBreeding = function(init_date, end_date, breed_id, partnership_id, scenario_id) {

    console.log("modelo de reportes de reproductora");
    console.log(init_date);
    console.log(end_date);
    console.log(breed_id);



    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
                        TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, a.lot, 
                        c.name as farm_name, e.name as center_name, b.code as shed_name,   
                        f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
                        a.execution_quantity - a.scheduled_quantity as diferentquantity, 
                        
                        (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
                        FROM public.txhousingway_detail a 
                        LEFT JOIN txhousingway t on a.housing_way_id = t.housing_way_id
                        LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                        LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                        LEFT JOIN oscenter e on a.center_id = e.center_id
                        LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
                        LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
                        LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                        WHERE t.scenario_id = $5 and a.scheduled_date BETWEEN $1 and $2 and t.partnership_id = $4 and t.breed_id = $3  and a.incubator_plant_id <> 0 and a.programmed_disable is null or false
                        ORDER BY (substring(a.lot from 2 for length(a.lot))::integer) DESC`, [init_date, end_date, breed_id, partnership_id, scenario_id]);            
};
exports.DBfindAllBreeding = function(init_date, end_date, partnership_id, scenario_id) {

    console.log("modelo de reportes de reproductora");
    console.log(init_date);
    console.log(end_date);
    console.log(partnership_id);



    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
                        TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, a.lot, w.name as breed,  
                        c.name as farm_name, e.name as center_name, b.code as shed_name,   
                        f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
                        a.execution_quantity - a.scheduled_quantity as diferentquantity, 
                        
                        (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
                        FROM public.txhousingway_detail a 
                        LEFT JOIN txhousingway t on a.housing_way_id = t.housing_way_id
                        LEFT JOIN mdbreed w on w.breed_id = t.breed_id
                        LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                        LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                        LEFT JOIN oscenter e on a.center_id = e.center_id
                        LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
                        LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
                        LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                        WHERE t.scenario_id = $4 and a.scheduled_date BETWEEN $1 and $2 and a.incubator_plant_id <> 0 and t.partnership_id = $3 and a.programmed_disable is null or false
                        ORDER BY (substring(a.lot from 2 for length(a.lot))::integer) DESC`, [init_date, end_date, partnership_id, scenario_id]);            
};

exports.DBfindBroiler = function(init_date, end_date, breed_id, scenario_id) {
    console.log("modelo de reportes de engorde");
    console.log(init_date);
    console.log(end_date);
    console.log(breed_id);

    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
                      TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, 
                      c.name as farm_name, e.name as center_name, b.code as shed_name, a.lot, 
                      f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
                      a.execution_quantity - a.scheduled_quantity as diferentquantity, 
                      (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
                      FROM public.txbroiler_detail a 
                      LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                      LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                      LEFT JOIN public.txbroiler d on a.broiler_id = d.broiler_id 
                      LEFT JOIN oscenter e on a.center_id = e.center_id
                      LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
                      LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
                      LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                      WHERE d.scenario_id = $4 and a.scheduled_date BETWEEN $1 and $2 and d.breed_id = $3 and a.programmed_disable is null or false
                      ORDER BY (substring(a.lot from 2 for length(a.lot))::integer) DESC`, [init_date, end_date, breed_id, scenario_id]);


};

// exports.DBfindBroiler = function(init_date, end_date, breed_id) {
//     console.log("modelo de reportes de engorde");
//     console.log(init_date);
//     console.log(end_date);
//     console.log(breed_id);

//     return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
//                       TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, 
//                       c.name as farm_name, e.name as center_name, b.code as shed_name, a.lot, 
//                       f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
//                       a.execution_quantity - a.scheduled_quantity as diferentquantity, 
//                       (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
//                       FROM public.txbroiler_detail a 
//                       LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
//                       LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
//                       LEFT JOIN public.txbroiler d on a.broiler_id = d.broiler_id 
//                       LEFT JOIN oscenter e on a.center_id = e.center_id
//                       LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
//                       LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
//                       LEFT JOIN osshed h on a.executionshed_id = h.shed_id
//                       WHERE a.scheduled_date BETWEEN $1 and $2 and d.breed_id = $3 and a.programmed_disable is null or false`, [init_date, end_date, breed_id]);

// };
exports.DBfindAllBroiler = function(init_date, end_date, scenario_id) {
    console.log("modelo de reportes de engorde");
    console.log(init_date);
    console.log(end_date);

    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
                      TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, a.lot, w.name as breed, 
                      c.name as farm_name, e.name as center_name, b.code as shed_name, 
                      f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
                      a.execution_quantity - a.scheduled_quantity as diferentquantity, 
                      (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
                      FROM public.txbroiler_detail a 
                      LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                      LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                      LEFT JOIN public.txbroiler d on a.broiler_id = d.broiler_id 
                      LEFT JOIN mdbreed w on w.breed_id = d.breed_id
                      LEFT JOIN oscenter e on a.center_id = e.center_id
                      LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
                      LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
                      LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                      WHERE d.scenario_id = $3 and a.scheduled_date BETWEEN $1 and $2 and a.programmed_disable is null or false
                      ORDER BY (substring(a.lot from 2 for length(a.lot))::integer) DESC`, [init_date, end_date, scenario_id]);


    // return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
    //                   TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, a.lot, w.name as breed, 
    //                   c.name as farm_name, e.name as center_name, b.code as shed_name, 
    //                   f.name as executionfarm, g.name as executioncenter, h.code as executionshed,
    //                   a.execution_quantity - a.scheduled_quantity as diferentquantity, 
    //                   (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
    //                   FROM public.txbroiler_detail a 
    //                   LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
    //                   LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
    //                   LEFT JOIN public.txbroiler d on a.broiler_id = d.broiler_id 
    //                   LEFT JOIN mdbreed w on w.breed_id = d.breed_id
    //                   LEFT JOIN oscenter e on a.center_id = e.center_id
    //                   LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
    //                   LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
    //                   LEFT JOIN osshed h on a.executionshed_id = h.shed_id
    //                   WHERE a.scheduled_date BETWEEN $1 and $2 and a.programmed_disable is null or false`, [init_date, end_date]);

};



exports.DBfindBroilerEviction = function(init_date, end_date, breed_id, scenario_id, type_bird) {
    console.log("Reporte Desalojo", init_date, end_date, breed_id, scenario_id, type_bird);

    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
    a.lot, c.code as farm_name, e.name as center_name, b.code as shed_name, product.gender as gender, (a.scheduled_date - d.projected_date)+1 as age, 
    TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity,  
    (case when a.execution_quantity is not null then (product.weight/product.days_eviction)*(a.execution_date - d.projected_date) else 0 end) as unit_weight,
    (case when a.execution_quantity is not null then (product.weight/product.days_eviction)*(a.execution_date - d.projected_date)*a.execution_quantity else 0 end) as total_weight,
    a.execution_quantity - a.scheduled_quantity as diferentquantity, 
    (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
    FROM public.txbroilereviction_detail a 
    LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
    LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
    LEFT JOIN public.txbroilereviction d on a.broilereviction_id = d.broilereviction_id 
    LEFT JOIN public.txbroiler_detail br ON d.broiler_detail_id = br.broiler_detail_id
    LEFT JOIN public.txbroilerheavy_detail brr ON d.broiler_heavy_detail_id = brr.broiler_heavy_detail_id
    LEFT JOIN mdbroiler_product product ON (CASE WHEN br.broiler_product_id NOTNULL THEN product.broiler_product_id = br.broiler_product_id ELSE product.broiler_product_id = brr.broiler_product_id END)
    LEFT JOIN oscenter e on a.center_id = e.center_id
    WHERE d.scenario_id = $4 and CASE WHEN $5 = 'P' THEN d.broiler_heavy_detail_id NOTNULL ELSE d.broiler_detail_id NOTNULL END and a.scheduled_date BETWEEN $1 and $2 and d.breed_id = $3 and a.programmed_disable is null or false
    ORDER BY (substring(a.lot from 2 for length(a.lot))::integer) DESC`, [init_date, end_date, breed_id, scenario_id, type_bird]);

};
exports.DBfindAllBroilerEviction = function(init_date, end_date, scenario_id, type_bird) {
    console.log("Reportes Todos desalojos", init_date, end_date, scenario_id, type_bird);

    return conn.db.any(`SELECT a.scheduled_date, TO_CHAR(a.scheduled_date, 'DD/MM/YYYY') as scheduled_date, a.scheduled_quantity, 
        a.lot, w.name as breed, c.code as farm_name, e.name as center_name, b.code as shed_name, product.gender as gender, (a.scheduled_date - d.projected_date)+1 as age, 
        TO_CHAR(a.execution_date, 'DD/MM/YYYY') as execution_date, a.execution_quantity, 
        (case when a.execution_quantity is not null then (product.weight/product.days_eviction)*(a.execution_date - d.projected_date) else 0 end) as unit_weight,
        (case when a.execution_quantity is not null then (product.weight/product.days_eviction)*(a.execution_date - d.projected_date)*a.execution_quantity else 0 end) as total_weight,
        a.execution_quantity - a.scheduled_quantity as diferentquantity, 
        (a.execution_date::DATE - a.scheduled_date::DATE) as diferentday 
        FROM public.txbroilereviction_detail a  
        LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
        LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
        LEFT JOIN public.txbroilereviction d on a.broilereviction_id = d.broilereviction_id 
        LEFT JOIN public.txbroiler_detail br ON d.broiler_detail_id = br.broiler_detail_id
        LEFT JOIN public.txbroilerheavy_detail brr ON d.broiler_heavy_detail_id = brr.broiler_heavy_detail_id
        LEFT JOIN mdbroiler_product product ON (CASE WHEN br.broiler_product_id NOTNULL THEN product.broiler_product_id = br.broiler_product_id ELSE product.broiler_product_id = brr.broiler_product_id END)
        LEFT JOIN mdbreed w on w.breed_id = d.breed_id
        LEFT JOIN oscenter e on a.center_id = e.center_id
        WHERE d.scenario_id = $3 and CASE WHEN $4 != 'Todos' THEN (CASE WHEN $4 = 'P' THEN d.broiler_heavy_detail_id NOTNULL ELSE d.broiler_detail_id NOTNULL END) ELSE TRUE END and a.scheduled_date BETWEEN $1 and $2 and a.programmed_disable is null or false
        ORDER BY (substring(a.lot from 2 for length(a.lot))::integer) DESC`, [init_date, end_date, scenario_id, type_bird]);

};



exports.DBFindIncubator = function(init_date, end_date, breed_id) {
    return conn.db.any(`SELECT a.programmed_eggs_id, TO_CHAR(a.use_date, 'DD/MM/YYYY') as _date, 
                        a.lot_incubator as lot_breed, b.name as incubator, 
                        a.eggs, a.execution_quantity, 
                        a.execution_quantity - a.eggs as diferentquantity 
                        FROM public.txprogrammed_eggs a 
                        LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id 
                        WHERE a.programmed_disable is not true and a.use_date BETWEEN $1 and $2 and a.breed_id = $3`,
    [init_date, end_date, breed_id]);

};

exports.DBFindIncubatorAllBreed = function(init_date, end_date) {
    console.log("modelo de reportes de incubadora all breed_id");
    console.log(init_date);
    console.log(end_date);
    // console.log(breed_id)

    return conn.db.any(`SELECT TO_CHAR(a.use_date, 'DD/MM/YYYY') as _date, 
                        a.lot_breed, b.name as incubator, 
                        a.eggs, a.execution_quantity, 
                        a.execution_quantity - a.eggs as diferentquantity 
                        FROM public.txprogrammed_eggs a
                        LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id
                        WHERE a.programmed_disable is not true and a.use_date BETWEEN $1 and $2`,
    [init_date, end_date]);

};