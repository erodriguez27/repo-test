const config = require("../../config");
const conn = require("../db");

exports.DBliftBreedingMonitor = function(fecha, fecha2, stage_id, partnership_id) 
{
    console.log("monitor, llego al modelo cria y levante");
    // console.log(fecha);
    return conn.db.any(`SELECT TO_CHAR(scheduled_date + interval '1 days' * p.theoretical_duration, 'DD/MM/YYYY') as estimated_date, housingway_detail_id, a.housing_way_id, e.name as center_name, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date, 
                        scheduled_quantity, a.farm_id, a.shed_id, b.code ,confirm,  a.programmed_disable, (a.execution_date is not null and a.execution_quantity is not null and a.executionfarm_id is not null and a.executioncenter_id is not null and a.executionshed_id is not null ) as executed,
                        c.name, 
                        lot, d.name as incubatorname, d.incubator_plant_id 
                      FROM public.txhousingway_detail a 
                      RIGHT JOIN txhousingway l on l.housing_way_id = a.housing_way_id
                      LEFT JOIN mdprocess p on l.breed_id = p.breed_id AND p.stage_id= $3
                      LEFT JOIN public.oscenter e on a.center_id = e.center_id 
                      LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                      LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                      LEFT JOIN public.osincubatorplant d on a.incubator_plant_id=d.incubator_plant_id 
                      WHERE scheduled_date BETWEEN $1 AND $2 and a.incubator_plant_id= 0 AND l.partnership_id = $4 AND a.programmed_disable IS NOT TRUE`,[fecha, fecha2, stage_id, partnership_id]);
    //   return conn.db.any(`SELECT p.theoretical_duration as duracion_dias, housingway_detail_id, a.housing_way_id, e.name as center_name, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date, 
    //   scheduled_quantity, a.farm_id, a.shed_id, b.code ,confirm, 
    //   c.name, 
    //   lot, d.name as incubatorname, d.incubator_plant_id 
    //   FROM public.txhousingway_detail a 
    // RIGHT JOIN txhousingway l on l.housing_way_id = a.housing_way_id
    // LEFT JOIN mdprocess p on l.breed_id = p.breed_id AND p.stage_id=5
    //   LEFT JOIN public.oscenter e on a.center_id = e.center_id 
    //   LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
    //   LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
    //   LEFT JOIN public.osincubatorplant d on a.incubator_plant_id=d.incubator_plant_id 
    //   WHERE scheduled_date BETWEEN $1 AND $2 and a.incubator_plant_id= 0`,[fecha, fecha2]);
    // return conn.db.any(`SELECT housingway_detail_id, housing_way_id, e.name as center_name, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date, 
    //                     scheduled_quantity, a.farm_id, a.shed_id, b.code ,confirm, 
    //                     c.name, 
    //                     lot, d.name as incubatorname, d.incubator_plant_id 
    //                     FROM public.txhousingway_detail a 
    //                     LEFT JOIN public.oscenter e on a.center_id = e.center_id 
    //                     LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
    //                     LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
    //                     LEFT JOIN public.osincubatorplant d on a.incubator_plant_id=d.incubator_plant_id 
    //                     WHERE scheduled_date BETWEEN $1 AND $2 and a.incubator_plant_id= 0`,[fecha, fecha2]);
    /*
  SELECT TO_CHAR(scheduled_date + interval '1 days' * p.theoretical_duration, 'DD/MM/YYYY') as estimated_date housingway_detail_id, a.housing_way_id, e.name as center_name, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date, 
                      scheduled_quantity, a.farm_id, a.shed_id, b.code ,confirm, 
                      c.name, 
                      lot, d.name as incubatorname, d.incubator_plant_id 
                      FROM public.txhousingway_detail a 
					RIGHT JOIN txhousingway l on l.housing_way_id = a.housing_way_id
					LEFT JOIN mdprocess p on l.breed_id = p.breed_id AND p.stage_id=5
                      LEFT JOIN public.oscenter e on a.center_id = e.center_id 
                      LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                      LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                      LEFT JOIN public.osincubatorplant d on a.incubator_plant_id=d.incubator_plant_id 
                      WHERE scheduled_date BETWEEN '2018-01-01' AND '2026-12-31' and a.incubator_plant_id= 0 */
};

exports.DBfindBreedingMonitor = function(fecha, fecha2, partnership_id) 
{
    console.log("monitor, llego al modelo produccion");
    // console.log(fecha);
    return conn.db.any(`SELECT  TO_CHAR(scheduled_date + interval '1 days' * (MAX(m.week)*7), 'DD/MM/YYYY') as estimated_date, a.housingway_detail_id, a.housing_way_id,  e.name as center_name, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date, 
                      scheduled_quantity, a.farm_id, a.shed_id, b.code ,confirm, (a.execution_date is not null and a.execution_quantity is not null and a.executionfarm_id is not null and a.executioncenter_id is not null and a.executionshed_id is not null ) as executed,
                      c.name, 
                      lot, d.name as incubatorname, d.incubator_plant_id 
                      FROM public.txhousingway_detail a 
                      RIGHT JOIN txhousingway l on l.housing_way_id = a.housing_way_id
                      LEFT JOIN txposturecurve m on m.breed_id = l.breed_id
                      LEFT JOIN public.oscenter e on a.center_id = e.center_id 
                      LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                      LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                      LEFT JOIN public.osincubatorplant d on a.incubator_plant_id=d.incubator_plant_id 
                      WHERE scheduled_date BETWEEN $1 AND $2 and a.incubator_plant_id <> 0 AND l.partnership_id = $3 AND a.programmed_disable IS NOT TRUE 
                      GROUP BY scheduled_date, a.housingway_detail_id, a.housing_way_id, e.name, b.code, c.name, 
                      lot, d.incubator_plant_id, a.scheduled_quantity, a.farm_id, a.shed_id, confirm, d.name `, [fecha, fecha2, partnership_id]);
};

exports.DBfindincubatorMonitor = function(date, date2, partnership_id) 
{
    // console.log(date);
    console.log("monitor, llego al modelo incubadora");
    return conn.db.any(`SELECT DISTINCT b.available as diferencia, a.incubator_id, b.name, b.capacity, lot_breed, lot_incubator, eggs, 
                      TO_CHAR(use_date, 'DD/MM/YYYY') as scheduled_date, TO_CHAR(a.use_date+v.duration_goal, 'DD/MM/YYYY') as birth_date, execution_quantity, CASE WHEN execution_quantity is null THEN true ELSE false END as available, 
                      'None' as state_date, '' as state_text_date, execution_quantity, a.programmed_eggs_id, a.execution_quantity is not null as executed 
                      FROM txprogrammed_eggs a 
                      LEFT JOIN public.mdprocess f on 2 = f.stage_id AND a.breed_id = f.breed_id
                      LEFT JOIN public.txscenarioprocess v on f.process_id = v.process_id
                      LEFT JOIN osincubator b on a.incubator_id = b.incubator_id
                      LEFT JOIN osincubatorplant l on l.incubator_plant_id = b.incubator_plant_id
                      WHERE use_date BETWEEN $1 AND $2 AND l.partnership_id = $3`, [date, date2, partnership_id]);
    // return conn.db.any(`SELECT (capacity-eggs) as diferencia, a.incubator_id, b.name, capacity, lot_breed, lot_incubator, eggs, 
    //                   TO_CHAR(use_date, 'DD/MM/YYYY') as scheduled_date, execution_quantity, CASE WHEN execution_quantity is null THEN true ELSE false END as available, 
    //                   'None' as state_date, '' as state_text_date, execution_quantity, a.programmed_eggs_id 
    //                   FROM txprogrammed_eggs a 
    //                   LEFT JOIN osincubator b on a.incubator_id = b.incubator_id
    //                   LEFT JOIN osincubatorplant l on l.incubator_plant_id = b.incubator_plant_id
    //                   WHERE use_date BETWEEN $1 AND $2 AND l.partnership_id = $3`, [date, date2, partnership_id]);
};

exports.DBfindColdRoom = function(date, date2, partnership_id, scenario_id) {
    
    return conn.db.any(`
    SELECT TO_CHAR(a.fecha_movements, 'DD/MM/YYYY') as scheduled_date, a.quantity as scheduled_quantity, a.lot, ip.name as ip  
    FROM txeggs_movements a 
        LEFT JOIN txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id
        LEFT JOIN osincubatorplant ip on b.incubator_plant_id = ip.incubator_plant_id
    WHERE description_adjustment IS null AND justification IS null AND programmed_eggs_id IS null AND programmed_disable IS NOT true
        AND b.scenario_id = $4 AND a.fecha_movements BETWEEN $1 AND $2 AND ip.partnership_id = $3
    `, [date, date2, partnership_id, scenario_id]);
};

exports.DBfindBroilerMonitor = function(date, date2, partnership_id) 
{
    console.log("monitor, llego al modelo engorde");
    return conn.db.any(`SELECT b.broiler_detail_id, c.name as farm_name, d.code as shed_name, e.name as center_name, round(capacity_max*stall_width*stall_height) as capacity_shed , 
                      SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product , execution_date, TO_CHAR(scheduled_date, 'DD/MM/YYYY') as scheduled_date,
                      (b.execution_date is not null and b.execution_quantity is not null and b.executionfarm_id is not null and b.executioncenter_id is not null and b.executionshed_id is not null ) as executed  
                      FROM txbroiler a 
                      LEFT JOIN txbroiler_detail b on a.broiler_id = b.broiler_id 
                      LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                      LEFT JOIN oscenter e on b.center_id = e.center_id 
                      LEFT JOIN osshed d on b.shed_id = d.shed_id 
                      Where scheduled_date BETWEEN $1 AND $2 AND c.partnership_id = $3  AND B.programmed_disable IS NOT TRUE 
                      group by broiler_detail_id, lot, c.name, d.code, e.name, capacity_shed, execution_quantity, execution_date, scheduled_date `, [date, date2, partnership_id]);
    // return conn.db.any(`SELECT b.broiler_detail_id, c.name as farm_name, d.code as shed_name, e.name as center_name, round(capacity_max*stall_width*stall_height) as capacity_shed , 
    //                     SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product , execution_date 
    //                     FROM txbroiler a 
    //                     LEFT JOIN txbroiler_detail b on a.broiler_id = b.broiler_id 
    //                     LEFT JOIN osfarm c on b.farm_id = c.farm_id 
    //                     LEFT JOIN oscenter e on b.center_id = e.center_id 
    //                     LEFT JOIN osshed d on b.shed_id = d.shed_id 
    //                     Where scheduled_date = $1 
    //                     group by broiler_detail_id, lot, c.name, d.code, e.name, capacity_shed, execution_quantity `, [date]);
};


exports.DBfindProductByLot = function(lot) 
{
    return conn.db.any("SELECT name, scheduled_quantity, a.execution_date, a.execution_quantity "+
                       "FROM txbroiler_detail a "+
                       "LEFT JOIN mdbroiler_product b on a.broiler_product_id = b.broiler_product_id "+
                       "WHERE lot = $1 ", [lot]);
};

exports.DBfindBroilerEvictionMonitor = function(date, date2, partnership_id) 
{   
    console.log("monitor, llego al modelo desalojo ");
    return conn.db.any(`SELECT e.name as pb_name, b.slaughterhouse_id, b.execution_date, b.scheduled_date, b.broilereviction_detail_id, a.broilereviction_id, c.name as farm_name, f.name as center_name, d.code as shed_name,  round(capacity_max*stall_width*stall_height) as capacity_shed, 
                        SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product,
                        (b.execution_date is not null and b.execution_quantity is not null and b.executionslaughterhouse_id is not null ) as executed  
                        FROM txbroilereviction a 
                        LEFT JOIN txbroilereviction_detail b on a.broilereviction_id = b.broilereviction_id 
                        LEFT JOIN osfarm c on b.farm_id = c.farm_id 
                        LEFT JOIN oscenter f on b.center_id = f.center_id
                        LEFT JOIN osshed d on b.shed_id = d.shed_id
                        LEFT JOIN osslaughterhouse e on b.slaughterhouse_id = e.slaughterhouse_id 
                        WHERE scheduled_date BETWEEN $1 AND $2 AND c.partnership_id = $3 AND b.programmed_disable IS NOT TRUE 
                        GROUP BY (e.name, lot, b.slaughterhouse_id, b.execution_date, b.scheduled_date, c.name, f.name, d.code, capacity_shed, execution_quantity, a.broilereviction_id, b.broilereviction_detail_id) `, [date, date2, partnership_id]);
    // return conn.db.any(`SELECT e.name as pb_name, b.slaughterhouse_id, b.execution_date, b.scheduled_date, b.broilereviction_detail_id, a.broilereviction_id, c.name as farm_name, f.name as center_name, d.code as shed_name,  round(capacity_max*stall_width*stall_height) as capacity_shed, 
    //                     SUM(scheduled_quantity) as scheduled_quantity, lot, execution_quantity, '' as product 
    //                     FROM txbroilereviction a 
    //                     LEFT JOIN txbroilereviction_detail b on a.broilereviction_id = b.broilereviction_id 
    //                     LEFT JOIN osfarm c on b.farm_id = c.farm_id 
    //                     LEFT JOIN oscenter f on b.center_id = f.center_id
    //                     LEFT JOIN osshed d on b.shed_id = d.shed_id
    //                     LEFT JOIN osslaughterhouse e on b.slaughterhouse_id = e.slaughterhouse_id 
    //                     Where scheduled_date = $1 
    //                     group by e.name, lot, c.name, f.name, d.code, capacity_shed, execution_quantity, a.broilereviction_id, b.broilereviction_detail_id `, [date]);
};

exports.DBfindProductByLotBE = function(lot) 
{
    return conn.db.any("SELECT name, scheduled_quantity, scheduled_date "+
                       "FROM txbroilereviction_detail a "+
                       "LEFT JOIN mdbroiler_product b on a.broiler_product_id = b.broiler_product_id "+
                       "WHERE lot = $1 ", [lot]);
};