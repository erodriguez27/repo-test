const config = require("../../config");
const conn = require("../db");

exports.DBfindBreeding2 = function(init_date, end_date, breed_id, scenario_id) {

    console.log("modelo de reportes de reproductora");
    console.log(init_date);
    console.log(end_date);
    console.log(breed_id);
    console.log(scenario_id)


    return conn.db.any(`SELECT  ($2-a.execution_date)/7 as ext,SUM(a.execution_quantity)::INTEGER
                        FROM public.txhousingway_detail a 
                        LEFT JOIN txhousingway t on a.housing_way_id = t.housing_way_id
                        LEFT JOIN public.osshed b on a.shed_id = b.shed_id 
                        LEFT JOIN public.osfarm c on a.farm_id = c.farm_id 
                        LEFT JOIN oscenter e on a.center_id = e.center_id
                        LEFT JOIN osfarm f on a.executionfarm_id = f.farm_id
                        LEFT JOIN oscenter g on a.executioncenter_id = g.center_id
                        LEFT JOIN osshed h on a.executionshed_id = h.shed_id
                        WHERE t.scenario_id = $4 and a.execution_date BETWEEN $1 and $2 and t.breed_id = $3  and a.incubator_plant_id <> 0 and a.programmed_disable is null or false
                        GROUP BY ext ORDER BY ext ASC`, [init_date, end_date, breed_id, scenario_id]);            
};
exports.DBfindpostureByscenari = function(scenario_id) {
    return conn.db.any(`SELECT bre.breed_id, bre.name FROM public.md_optimizer_parameter md right join  (select m.breed_id, m.name from mdbreed m right join (SELECT distinct breed_id FROM public.mdprocess mp join  (select  process_id FROM public.txscenarioparameter where public.txscenarioparameter.scenario_id = 9 and public.txscenarioparameter.use_value>0  ) as sp on mp.process_id = sp.process_id) as bre on m.breed_id = bre.breed_id) as bre on md.breed_id=bre.breed_id where active =true`,[scenario_id]);            
};
exports.DBfindparameter = function() {
    return conn.db.any(`SELECT public.md_optimizer_parameter.breed_id as breed_id,optimizerparameter_id,max_housing,min_housing ,difference ,active ,name FROM public.md_optimizer_parameter join public.mdbreed on public.md_optimizer_parameter.breed_id = public.mdbreed.breed_id`);            
};
exports.DBfindparameterinTrue = function() {
    return conn.db.any(`select distinct md.breed_id,op.active from public.mdbreed md left join public.md_optimizer_parameter op on md.breed_id=op.breed_id where active =true`);            
};
exports.DBdeleteparameter = function(optimizer_id) {
    return conn.db.any(`DELETE FROM public.md_optimizer_parameter WHERE optimizerparameter_id=$1`,[optimizer_id]);            
};
exports.DBupdateparameter = function(optimizer_id ,breed_id,max_housing,min_housing,difference) {
    return conn.db.any(`UPDATE public.md_optimizer_parameter SET breed_id=$2, max_housing=$3, min_housing=$4, difference=$5 WHERE optimizerparameter_id=$1`,[optimizer_id,breed_id,max_housing,min_housing,difference]);            
};
exports.DBinsertparameter = function(breed_id,max_housing,min_housing,difference) {
    conn.db.any(`INSERT INTO public.md_optimizer_parameter (breed_id, max_housing, min_housing, difference, active) VALUES($1, $2, $3, $4, false)`,[breed_id,max_housing,min_housing,difference]);
    return 0;            
};
exports.DBchangeActive = async function(optimizer_id,breed_id,active) {
    await conn.db.any(`UPDATE public.md_optimizer_parameter set active=false where breed_id=$1 and active = true`,[breed_id]);    
    return conn.db.any(`UPDATE public.md_optimizer_parameter set active=$2 where optimizerparameter_id=$1`,[optimizer_id,active]);        
};
exports.DBgetActive = async function(breed_id) { 
    return conn.db.any(`SELECT max_housing, min_housing, difference FROM public.md_optimizer_parameter where active = true and breed_id=$1`,[breed_id]);        
};