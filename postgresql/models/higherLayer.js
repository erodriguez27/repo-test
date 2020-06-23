const config = require("../../config");
const conn = require("../db");

// Models para servicios genericos

exports.DBfindAllScenario = function() {
    let promise = conn.db.any("select * from mdscenario order by status DESC;");

    return promise;
};

exports.DBfindScenarioActive = function() {
    let promise = conn.db.any("select scenario_id, name, status from mdscenario where status = 1");

    return promise;
};

exports.DBfindAllScenariosProgrammed = function(stage) {
    console.log("scenariopg",stage)
    let promise = conn.db.any(`
        select distinct (ms.scenario_id), ms.name, ms.status 
        from mdscenario ms
        right join (select scenario_id from `+ stage + ` where sl_disable is not true )a on ms.scenario_id = a.scenario_id
        order by status DESC, name asc
        `);

    return promise;
};

exports.DBfindAllScenariosProgrammedForInventory = function(stage) {
    console.log("scenarioPI",stage)
    let promise = conn.db.any(`
        select distinct (ms.scenario_id), ms.name, ms.status 
        from mdscenario ms
        right join (select scenario_id from `+ stage + ` where sl_disable is not true
                    
                    UNION

                    select sp.scenario_id
                    from sltxsellspurchase sp
                    where (concept = 'Compra' or concept = 'Venta') and type = 'Huevo Fértil' and sl_disable is not true 
                    )a on ms.scenario_id = a.scenario_id
        
        order by status DESC, name asc`);

    return promise;
};

exports.DBfindAllScenariosProgrammedForIncubator = function(stage) {
    let promise = conn.db.any(`
        select distinct (ms.scenario_id), ms.name, ms.status 
        from mdscenario ms
        right join (select i.scenario_id 
                    from `+ stage + ` i
                    left join sltxincubator_curve ic on i.slincubator = ic.slincubator_id
                    where ic.sl_disable is not true
                    
                    UNION

                    select sp.scenario_id
                    from sltxsellspurchase sp
                    where concept = 'Compra' and type = 'Huevo Fértil' and sl_disable is not true 
                    )a on ms.scenario_id = a.scenario_id
        
        order by status DESC, name asc`);

    return promise;
}
;
exports.DBfindAllScenariosProgrammedForBroiler = function(stage) {
    let promise = conn.db.any(`
        select distinct (ms.scenario_id), ms.name, ms.status 
        from mdscenario ms
        right join (select i.scenario_id 
                    from `+ stage + ` br
                    left join sltxincubator_detail id on br.slincubator_detail_id = id.slincubator_detail_id
                    left join sltxincubator i on id.incubator_id = i.slincubator 
                    where br.sl_disable is not true
                    
                    UNION
                    
                    select sp.scenario_id
                    from sltxsellspurchase sp
                    where concept = 'Compra' and type = 'Pollito de un día' and sl_disable is not true )a on ms.scenario_id = a.scenario_id
        
        order by status DESC, name asc`);

    return promise;
};

exports.DBfindLiftBreadingFarmByRepFarm = function(farm_id) {
    let promise = conn.db.any(`
    
    SELECT f2.farm_id, f2.partnership_id, f2.code, f2.name, f2.farm_type_id, f2._order, f2.os_disable
        FROM osfarm f left join osfarm f2 on (substring(f.code from 1 for length(f.code)-2)) = f2.code and f2.farm_type_id = 3
    WHERE f.farm_id = $1`,[farm_id]);

    return promise;
};

exports.DBfindLiftBreadingShedsByFarm = function(sheds, farm_id) {
    let promise = conn.db.any(`
        SELECT sh.farm_id, sh.center_id, sh.shed_id FROM ( SELECT shed_id, partnership_id, farm_id, center_id, code
            FROM public.osshed WHERE shed_id IN ($1:csv) ) AS sheds 
                LEFT JOIN osshed sh on sheds.code = sh.code and sh.farm_id = $2

    `,[sheds, farm_id]);

    return promise;
};

exports.DBfindBreed = function() {
    return conn.db.any("SELECT * FROM public.mdbreed WHERE name != 'Plexus' order by name ASC");
};
exports.DBfindBreedForGenderClass = function() {
    return conn.db.any("SELECT * FROM public.mdbreed order by name ASC");
};

exports.DBfindFarmByPartnership = function(partnership_id, farm_type_id){
    return conn.db.any(`SELECT farm_id, partnership_id, code, a.name,
                        a.farm_type_id, b.name as farm_name, a._order, a.os_disable, 
                        false As availableOrder 
                        FROM public.osfarm a 
                        LEFT JOIN public.mdfarmtype b ON a.farm_type_id = b.farm_type_id 
                        WHERE partnership_id = $1 and a.farm_type_id = $2 and a.os_disable is not true order by a.name ASC`,[partnership_id, farm_type_id]);
};

exports.DBfindShedsByFarmAndAvailability = function(farm_id) {
    // console.log("- ", farm_id);
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax, rotation_days, 
                        statusshed_id, avaliable_date,a._order, a.os_disable, 
                        CASE WHEN a._order is not null THEN false ELSE true END As availableOrder    
                        FROM public.osshed a 
                        WHERE a.farm_id = $1 and a.statusshed_id = 1 and a.os_disable is not true order by a._order ASC`, [farm_id]);
};

exports.DBfindShedsByFarmAndAvailabilityB = function(farm_id) {
    // console.log("- ", farm_id);
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax, rotation_days, 
                        statusshed_id, avaliable_date,a._order, a.os_disable, 
                        CASE WHEN a._order is not null THEN false ELSE true END As availableOrder    
                        FROM public.osshed a 
                        WHERE a.farm_id = $1 and a.os_disable is not true order by a._order ASC`, [farm_id]);
};

exports.DBfindIncPlantByPartnership = function(partnership_id) {
    
        return conn.db.any(`SELECT * FROM public.osincubatorplant 
                           WHERE partnership_id=$1 
                           order by name ASC`, [partnership_id]);
    };

// Models para servicios de la tabla slmdprocess


exports.DBaddProcess = function(records) {
    console.log("Llego al model de DBaddProcess");
    console.log(records);

    // name,stage_id,breed_id,decrease,duration_process,sync_considered 

    cs = conn.pgp.helpers.ColumnSet(["name", "stage_id",  "breed_id" , "decrease" , "duration_process", "sync_considered"],
    {table: "slmdprocess", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};

exports.DBfindAllProcess = function() {
    
    return conn.db.any(`SELECT pr.slprocess_id, pr.name, pr.stage_id, pr.breed_id, pr.decrease, pr.duration_process, pr.sync_considered,
    (CASE WHEN st.name != 'Reproductoras' THEN (CASE WHEN st.name = 'Incubacion' THEN 'Incubación' ELSE st.name END) ELSE 'Producción' END) as stage, b.name as breed FROM slmdprocess pr  
                        left join mdstage st on pr.stage_id = st.stage_id 
                        LEFT JOIN mdbreed b on pr.breed_id = b.breed_id WHERE sl_disable is not true order by pr.name asc`);

};
exports.DBfindProcessByStageAndBreed = function(stage_id, breed_id) {
    
    return conn.db.any(`SELECT pr.slprocess_id, pr.name, pr.stage_id, pr.breed_id, pr.decrease, pr.duration_process, pr.sync_considered
                        FROM slmdprocess pr 
                        WHERE pr.stage_id = $1 and pr.breed_id = $2 and sl_disable is not true`, [stage_id, breed_id]);

};

exports.DBfindProcessByIncStage = function(stage_id) {
    console.log("yo fallo")
    return conn.db.any(`SELECT pr.decrease, pr.duration_process
                        FROM slmdprocess pr 
                        WHERE pr.stage_id = $1 and sl_disable is not true`, [stage_id]);

};
exports.DBfindStageByBreedAvailable = function() {
    
    return conn.db.any(`
            SELECT br.stage_id, (CASE WHEN br.name != 'Reproductoras' THEN (CASE WHEN br.name = 'Incubacion' THEN 'Incubación' ELSE br.name END) ELSE 'Producción' END) as name from (SELECT DISTINCT s.stage_id, s.name, COUNT(DISTINCT HEY.breed_id) as gg FROM mdstage s 
            left join (SELECT p.stage_id, p.breed_id FROM slmdprocess p 
            left join mdbreed b on p.breed_id = b.breed_id
            WHERE sl_disable is not true) AS HEY on s.stage_id = HEY.stage_id
            GROUP BY s.stage_id, s.name) as br, (SELECT COUNT(*) as len FROM mdbreed) as c WHERE CASE WHEN (br.stage_id = 3 or br.stage_id = 5) THEN br.gg!=(c.len-1) ELSE br.gg!=c.len END`);

};
exports.DBfindBreedByStageid = function(stage_id) {
    
    return conn.db.any(`
        
        SELECT b.breed_id, b.name from mdbreed b 
        WHERE b.breed_id not in (SELECT DISTINCT breed_id from slmdprocess where stage_id = $1 and sl_disable is not true) and 
        (CASE WHEN ($1 = 1 or $1 = 2) THEN true ELSE name != 'Plexus' END)     `,[stage_id]);
};
exports.DBupdateProcess = function(records){
// exports.DBupdateProcess = function(records, columns){
    // cs = conn.pgp.helpers.ColumnSet(columns,
    cs = conn.pgp.helpers.ColumnSet(["?slprocess_id","name", "stage_id", "breed_id", "decrease", "duration_process", "sync_considered"],
        {table: "slmdprocess", schema: "public"});
        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slprocess_id = t.slprocess_id')
    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slprocess_id = t.slprocess_id');
};
exports.DBupdateDeletedProcess = function(records){

    cs = conn.pgp.helpers.ColumnSet(["?slprocess_id", "sl_disable"],
        {table: "slmdprocess", schema: "public"});
        console.log(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slprocess_id = t.slprocess_id')
    return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slprocess_id = t.slprocess_id');

};

// Models para servicios de la tabla slmdmachinegroup

exports.DBfindAllMachineGroup = function(partnership_id) { 
    
    return conn.db.any(`SELECT mg.slmachinegroup_id, mg.incubatorplant_id, ip.name as incubatorplant, mg.name, mg.description, mg.amount_of_charge, mg.charges, mg.sunday, mg.monday, mg.tuesday, mg.wednesday, mg.thursday, mg.friday, mg.saturday, mg.sl_disable,
                            mg.charges*mg.amount_of_charge::bigint as total_of_charges
    FROM slmdmachinegroup mg 
    LEFT JOIN osincubatorplant ip on mg.incubatorplant_id = ip.incubator_plant_id WHERE ip.partnership_id = $1 and mg.sl_disable is not true order by mg.name asc`,[partnership_id]);

};

exports.DBfindMachineGroupByDayOfWork = function(partnership_id, date, day) { 
    
    return conn.db.any(`
    SELECT h.slmachinegroup_id, h.incubatorplant_id, h.name as incubatorplant, h.name, h.description, h.amount_of_charge, h.charges, h.sunday, h.monday, h.tuesday, h.wednesday, h.thursday, h.friday, h.saturday, h.sl_disable,
            h.total_of_charges
    FROM (SELECT mg.slmachinegroup_id, mg.incubatorplant_id, ip.name as incubatorplant, mg.name, mg.description, mg.amount_of_charge, mg.charges, mg.sunday, mg.monday, mg.tuesday, mg.wednesday, mg.thursday, mg.friday, mg.saturday, mg.sl_disable,
                    mg.charges*mg.amount_of_charge::bigint as total_of_charges,
                    (SELECT CASE WHEN COUNT(hey.slincubator_detail_id)>0 THEN COUNT(hey.slincubator_detail_id) ELSE 0 END from (SELECT slincubator_detail_id FROM sltxincubator_detail WHERE slmachinegroup_id = mg.slmachinegroup_id and programmed_date between $2::date -21 and $2 and sl_disable is not true) as hey) as c
            FROM slmdmachinegroup mg 
                LEFT JOIN osincubatorplant ip on mg.incubatorplant_id = ip.incubator_plant_id 
            WHERE ip.partnership_id = $1 and mg.`+day +` is true 
                and mg.sl_disable is not true order by mg.name asc) AS h 
    WHERE h.c < h.charges
    `,[partnership_id, date]);

};
exports.DBaddMachineGroup = function(records) {
    console.log("Llego al model de DBaddMachineGroup");
    console.log(records);

    // "slmachinegroup_id", "incubatorplant_id", "name", "description", "amount_of_charge", "charges", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sl_disable"

    cs = conn.pgp.helpers.ColumnSet(["incubatorplant_id", "name", "description", {name: 'amount_of_charge', cast: 'integer'}, {name: 'charges', cast: 'integer'}, "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    {table: "slmdmachinegroup", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};
exports.DBupdateMachineGroup = function(records){

        cs = conn.pgp.helpers.ColumnSet(["?slmachinegroup_id","incubatorplant_id", "name", "description",  {name: 'amount_of_charge', cast: 'integer'}, {name: 'charges', cast: 'integer'}, "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
            {table: "slmdmachinegroup", schema: "public"});
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slmachinegroup_id = t.slmachinegroup_id');

    };
exports.DBupdateDeletedMachineGroup = function(records){
    
        cs = conn.pgp.helpers.ColumnSet(["?slmachinegroup_id", "sl_disable"],
            {table: "slmdmachinegroup", schema: "public"});
            // console.log(conn.pgp.helpers.update(records, cs)+ ' WHERE v.slmachinegroup_id = t.slmachinegroup_id')
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slmachinegroup_id = t.slmachinegroup_id');
    
};

// Models para servicios de la tabla slmdgenderclassification

exports.DBfindfindAllGenderCl = function() {
    
    return conn.db.any(`SELECT gc.slgenderclassification_id, gc.name, gc.gender, gc.breed_id, b.name as breed, gc.weight_gain, gc.age, gc.mortality, gc.sl_disable
    FROM slmdgenderclassification gc  
    LEFT JOIN mdbreed b on gc.breed_id = b.breed_id WHERE gc.sl_disable is not true order by gc.name asc`);

};

exports.DBfindfindGenderClByGender = function(gender) {
    
    return conn.db.any(`SELECT gc.slgenderclassification_id, gc.name, gc.gender, gc.breed_id, b.name as breed, gc.weight_gain, gc.age, gc.mortality, gc.sl_disable
    FROM slmdgenderclassification gc  
    LEFT JOIN mdbreed b on gc.breed_id = b.breed_id WHERE gc.gender = $1 and gc.sl_disable is not true order by gc.name asc`,[gender]);

};
exports.DBaddGenderCl = function(records) {
    console.log("Llego al model de DBaddGenderCl");
    console.log(records);

    cs = conn.pgp.helpers.ColumnSet(["name", "gender", "breed_id", "weight_gain", "age", "mortality"],
    {table: "slmdgenderclassification", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};
exports.DBupdateGenderCl = function(records){

        cs = conn.pgp.helpers.ColumnSet(["?slgenderclassification_id", "name", "gender", "breed_id", "weight_gain", "age", "mortality"],
            {table: "slmdgenderclassification", schema: "public"});
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slgenderclassification_id = t.slgenderclassification_id');

};
exports.DBupdateDeletedGenderCl = function(records){
    
        cs = conn.pgp.helpers.ColumnSet(["?slgenderclassification_id", "sl_disable"],
            {table: "slmdgenderclassification", schema: "public"});
        
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slgenderclassification_id = t.slgenderclassification_id');
    
};

// Models para servicios de la tabla slmdevictionpartition

exports.DBfindfindAllEvictionPartition = function() {
    
    return conn.db.any(`SELECT * 
    FROM slmdevictionpartition WHERE sl_disable is not true order by name asc`);

};
exports.DBfindActiveEvictionPartition = function() {
    
    return conn.db.any(`SELECT * 
    FROM slmdevictionpartition WHERE active is true and sl_disable is not true order by name asc`);

};
exports.DBaddEvictionPartition = function(records) {
    console.log("Llego al model de DBaddEvictionPartition");
    console.log(records);

    cs = conn.pgp.helpers.ColumnSet(["name", "youngmale", "oldmale", "peasantmale", "youngfemale", "oldfemale", "active"],
    {table: "slmdevictionpartition", schema: "public"});
    
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};
exports.DBupdateEvictionPartition = function(records){

        cs = conn.pgp.helpers.ColumnSet(["?slevictionpartition_id", "name", "youngmale", "oldmale", "peasantmale", "youngfemale", "oldfemale", "active"],
            {table: "slmdevictionpartition", schema: "public"});
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slevictionpartition_id = t.slevictionpartition_id');

};
exports.DBupdateDeletedEvictionPartition = function(records){
    
        cs = conn.pgp.helpers.ColumnSet(["?slevictionpartition_id", "sl_disable"],
            {table: "slmdevictionpartition", schema: "public"});
        
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slevictionpartition_id = t.slevictionpartition_id');
    
};
exports.DBupdateActiveEvictionPartition = function(records){
    
        cs = conn.pgp.helpers.ColumnSet(["?slevictionpartition_id", "active"],
            {table: "slmdevictionpartition", schema: "public"});
        
        return conn.db.any(conn.pgp.helpers.update(records, cs)+ 'WHERE v.slevictionpartition_id = t.slevictionpartition_id');
    
};

exports.DBupdateNotActivePartitions = function(slevictionpartition_id, boolean){
    
    return conn.db.none("update slmdevictionpartition set active = $2 WHERE slevictionpartition_id != $1  ", [slevictionpartition_id, boolean]);
    
};

exports.DBproduction_delete_cascade = function(slbreeding_id){
    
    return conn.db.one("select * FROM delete_production_cascade($1) ", [slbreeding_id]);
    
};

exports.DBincubator_delete_cascade = function(incubator_id){
    
    return conn.db.one("select * FROM delete_incubator_cascade($1) ", [incubator_id]);
    
};

exports.DBbroiler_delete_cascade = function(b_lot){
    
    return conn.db.one("select * FROM delete_broiler_cascade($1) ", [b_lot]);
    
};

exports.DBpurchaseEgg_delete_cascade = function(slbreeding_id){
    
    return conn.db.one("select * FROM delete_buy_egg_cascade($1) ", [slbreeding_id]);
    
};
exports.DBpurchaseChicken_delete_cascade = function(slbreeding_id){
    
    return conn.db.one("select * FROM delete_buy_chicken_cascade($1) ", [slbreeding_id]);
    
};
