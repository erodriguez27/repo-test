const config = require("../../config");
const conn = require("../db");


exports.DBfindAllDateQuantityFarmProduct = function() {

    // return conn.db.any("SELECT '1' as POS, a.housingway_detail_id, a.housing_way_id as ID, TO_CHAR(scheduled_date, 'DD.MM.YYYY') as SCHEDULED_DATE, "+
    // "scheduled_quantity as SCHEDULED_QUANTITY, c.code as CENTER_CODE , g.code as PRODUCT_CODE "+
    // "FROM public.txhousingway_detail a "+
    // "LEFT JOIN public.osshed b on a.shed_id = b.shed_id "+
    // "LEFT JOIN public.osfarm c on a.farm_id = c.farm_id "+
    // "LEFT JOIN public.osincubatorplant d on a.incubator_plant_id = d.incubator_plant_id "+
    // "LEFT JOIN public.txhousingway e on a.housing_way_id = e.housing_way_id "+
    // "LEFT JOIN public.mdprocess f on e.stage_id = f.stage_id "+
    // "AND e.breed_id = f.breed_id "+
    // "LEFT JOIN public.mdproduct g on f.product_id = g.product_id "+
    // "WHERE a.incubator_plant_id = 0");


    // LISTO
    console.log("llego al modelo de back de levante y cria");
    // return conn.db.any(`SELECT '1' as POS, TO_CHAR(scheduled_date+f.historical_duration, 'DD.MM.YYYY') as SCHEDULED_DATE, 
    //         sum(scheduled_quantity) as SCHEDULED_QUANTITY, c.code as CENTER_CODE , g.code as PRODUCT_CODE 
    //         FROM public.txhousingway_detail a 
    //         LEFT JOIN public.txhousingway e on a.housing_way_id = e.housing_way_id 
    //         LEFT JOIN public.osshed c on a.shed_id = c.shed_id 
    //         LEFT JOIN public.mdprocess f on e.stage_id = f.stage_id AND e.breed_id = f.breed_id 
    //         LEFT JOIN public.mdproduct g on f.product_id = g.product_id
    //         WHERE a.incubator_plant_id = 0 and a.synchronized is null or false
    //         group by(a.scheduled_date+f.historical_duration, c.code, e.breed_id, g.code)`); 

    return conn.db.any(`select TO_CHAR(scheduled_date, 'DD.MM.YYYY') as SCHEDULED_DATE, 
            ceiling(case when ff.sync_considered is true then (scheduled_quantity*(1-(ff.historical_decrease/100)))  
            else scheduled_quantity end) as SCHEDULED_QUANTITY, d.code as CENTER_CODE, c.code as SHED_CODE,
            g.code as PRODUCT_CODE, aa.housingway_detail_id as reference_id
            FROM public.txhousingway_detail aa
            LEFT JOIN public.osshed c on aa.shed_id = c.shed_id 
            LEFT JOIN public.osfarm d on aa.farm_id = d.farm_id 
            LEFT JOIN public.txhousingway e on aa.housing_way_id = e.housing_way_id 
            LEFT JOIN public.mdprocess ff on e.stage_id = ff.stage_id AND e.breed_id = ff.breed_id 
            LEFT JOIN public.mdproduct g on ff.product_id = g.product_id
            WHERE aa.incubator_plant_id = 0 and aa.synchronized is null or false`);
};

exports.DBfindAllDateQuantityFarmProductReproductora = function() {
    // OLD
    // return conn.db.any("SELECT '4' as POS, a.housing_way_id as ID, TO_CHAR(scheduled_date, 'DD.MM.YYYY') as SCHEDULED_DATE, "+
    //     "scheduled_quantity as SCHEDULED_QUANTITY, c.code as CENTER_CODE , g.code as PRODUCT_CODE "+
    //     "FROM public.txhousingway_detail a "+
    //     "LEFT JOIN public.osshed b on a.shed_id = b.shed_id "+
    //     "LEFT JOIN public.osfarm c on a.farm_id = c.farm_id "+
    //     "LEFT JOIN public.osincubatorplant d on a.incubator_plant_id = d.incubator_plant_id "+
    //     "LEFT JOIN public.txhousingway e on a.housing_way_id = e.housing_way_id "+
    //     "LEFT JOIN public.mdprocess f on e.stage_id = f.stage_id "+
    //     "AND e.breed_id = f.breed_id "+
    //     "LEFT JOIN public.mdproduct g on f.product_id = g.product_id "+
    //     "WHERE a.incubator_plant_id !=0");

    console.log("llego al modelo de back de reproductora");
    // LISTO
    // return conn.db.any(`SELECT '4' as POS, TO_CHAR(e.projected_date + 280, 'DD.MM.YYYY') as SCHEDULED_DATE, 
    //         ROUND (SUM(e.projected_quantity) * 
    //   (
    //     SELECT SUM(theorical_performance) FROM public.txposturecurve WHERE breed_id = e.breed_id
    //   ))
    //   as SCHEDULED_QUANTITY,
    //         c.code as CENTER_CODE , g.code as PRODUCT_CODE  
    //         FROM public.txhousingway e
    //         LEFT JOIN public.txhousingway_detail a on e.housing_way_id = a.housing_way_id
    //         LEFT JOIN public.osshed c on a.shed_id = c.shed_id 
    //         LEFT JOIN public.mdprocess f on e.stage_id = f.stage_id AND e.breed_id = f.breed_id 
    //         LEFT JOIN public.mdproduct g on f.product_id = g.product_id
    //         WHERE e.predecessor_id != 0 and e.housing_way_id = a.housing_way_id and a.synchronized is null or false
    //         GROUP BY(e.projected_date, c.code, e.breed_id, g.code)`);

    return conn.db.any(`SELECT TO_CHAR(e.projected_date, 'DD.MM.YYYY') as SCHEDULED_DATE, 
            ceiling(ROUND (SUM(case when f.sync_considered is true then (e.projected_quantity*(1-(f.historical_decrease/100)))  
            else e.projected_quantity end) * 
            (
                SELECT SUM(theorical_performance) FROM public.txposturecurve WHERE breed_id = e.breed_id
            ))) as SCHEDULED_QUANTITY,
            d.code as CENTER_CODE, c.code as SHED_CODE , g.code as PRODUCT_CODE, a.housingway_detail_id as reference_id  
            FROM public.txhousingway e
            LEFT JOIN public.txhousingway_detail a on e.housing_way_id = a.housing_way_id
            LEFT JOIN public.osshed c on a.shed_id = c.shed_id 
            LEFT JOIN public.osfarm d on a.farm_id = d.farm_id 
            LEFT JOIN public.mdprocess f on e.stage_id = f.stage_id AND e.breed_id = f.breed_id 
            LEFT JOIN public.mdproduct g on f.product_id = g.product_id
            WHERE e.predecessor_id != 0 and e.housing_way_id = a.housing_way_id and a.synchronized is null or false
            GROUP BY(e.projected_date, d.code, c.code, e.breed_id, g.code, e.projected_quantity, a.housingway_detail_id)`);
};  

exports.DBfindAllDateQuantityFarmProductIncubator = function() {
    // old
    // return conn.db.any("SELECT '2' as POS, a.programmed_eggs_id as ID, TO_CHAR(a.use_date, 'DD.MM.YYYY') as SCHEDULED_DATE, "+
    //     "a.eggs as SCHEDULED_QUANTITY, c.code as CENTER_CODE, "+
    //     "(SELECT code FROM public.mdproduct WHERE name = 'HUEVO INCUBABLE DE REPRODUCTORA') as PRODUCT_CODE "+
    //     "FROM public.txprogrammed_eggs a "+
    //     "LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id " +
    // "LEFT JOIN public.osincubatorplant c on b.incubator_plant_id = c.incubator_plant_id ");

    // // LISTO

    console.log("llego al modelo de back de incubadora");
    return conn.db.any(`SELECT TO_CHAR(a.use_date, 'DD.MM.YYYY') as SCHEDULED_DATE, 
                        ceiling(sum(case when f.sync_considered is true then (a.execution_quantity*(1-(f.historical_decrease/100))) 
                        else a.execution_quantity end)) as SCHEDULED_QUANTITY, 
                        c.code as CENTER_CODE, b.code as SHED_CODE, g.code as PRODUCT_CODE, a.programmed_eggs_id as reference_id, 'X' as incubator
                        FROM public.txprogrammed_eggs a 
                        LEFT JOIN public.mdprocess f on 2 = f.stage_id AND a.breed_id = f.breed_id 
                        LEFT JOIN public.mdproduct g on f.product_id = g.product_id
                        LEFT JOIN public.osincubator b on a.incubator_id = b.incubator_id 
                        LEFT JOIN public.osincubatorplant c on b.incubator_plant_id = c.incubator_plant_id
                        WHERE a.synchronized is null or false
                  group by(a.use_date, c.code, g.code, b.code, a.programmed_eggs_id)`);
};

exports.DBfindAllDateQuantityFarmProductBroiler = function() {
    // return conn.db.any("SELECT '3' as POS, a.broiler_id as ID, TO_CHAR(a.scheduled_date, 'DD.MM.YYYY') as SCHEDULED_DATE, "+
    //     "a.scheduled_quantity as SCHEDULED_QUANTITY, b.code as CENTER_CODE, "+
    //     "(SELECT code FROM public.mdproduct WHERE name = 'POLLO VIVO') as PRODUCT_CODE "+
    //     "FROM public.txbroiler_detail a "+
    //     "LEFT JOIN public.osfarm b on a.farm_id = b.farm_id ");

    // // LISTO
    /*
    console.log("llego al modelo de back de engorde")
    return conn.db.any(`SELECT '3' as POS, TO_CHAR(a.scheduled_date + 46, 'DD.MM.YYYY') as SCHEDULED_DATE,
            sum(a.scheduled_quantity) as SCHEDULED_QUANTITY, b.code as CENTER_CODE, '160001' as PRODUCT_CODE
            FROM public.txbroiler_detail a 
            LEFT JOIN public.osfarm b on a.farm_id = b.farm_id 
            GROUP BY (a.scheduled_date, b.code)`);
*/
    console.log("llego al modelo de back de engorde");
    return conn.db.any(`SELECT TO_CHAR(a.scheduled_date, 'DD.MM.YYYY') as SCHEDULED_DATE,
                ceiling(sum(case when f.sync_considered is true then (a.scheduled_quantity*(1-(f.historical_decrease/100))) 
                        else a.scheduled_quantity end)) as SCHEDULED_QUANTITY,
            b.code as CENTER_CODE, c.code as SHED_CODE, g.code as PRODUCT_CODE, a.broiler_detail_id as reference_id
            FROM public.txbroiler_detail a 
            LEFT JOIN public.txbroiler bb on a.broiler_id = bb.broiler_id 
            LEFT JOIN public.osshed c on a.shed_id = c.shed_id 
            LEFT JOIN public.osfarm b on a.farm_id = b.farm_id 
            LEFT JOIN public.mdprocess f on 1 = f.stage_id AND bb.breed_id = f.breed_id 
            LEFT JOIN public.mdbroiler_product g on a.broiler_product_id = g.broiler_product_id
            WHERE a.synchronized is null or false
            GROUP BY (a.scheduled_date, b.code, c.code, g.code, a.broiler_detail_id)`);

};