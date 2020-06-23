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

exports.DBaddEggsStorage = records => {
    return conn.db.none("INSERT INTO public.txeggs_storage (incubator_plant_id, scenario_id, breed_id, init_date, "+
                      "end_date, lot, eggs ) "+
                      "VALUES $1",
    Inserts("${incubator_plant_id},${scenario_id},${breed_id}, ${init_date}, "+
                      "${end_date}, ${lot}, ${eggs} ",records));
};

exports.DBfindEggsStorageByDate = function(scenario_id, breed_id, incubator_plant_id, date) {
    
    return conn.db.any("SELECT case when Sum(eggs_executed) is NULL Then 0 ELSE Sum(eggs_executed) END "+
                       "FROM txeggs_storage "+
                       "WHERE scenario_id = $1 and breed_id = $2 "+
                       "and incubator_plant_id = $3 and end_date <= $4 ",
    [scenario_id, breed_id, incubator_plant_id, date]);
};

exports.DBfindInventoryByPartnership = function(partnership_id) {

    return conn.db.any(`SELECT a.incubator_plant_id, a.name, init_date, end_date,eggs as oldEggs ,SUM(eggs_executed) as eggs ,b.lot,
                        EXTRACT(DAY FROM(NOW() - init_date )) as _day, a.max_storage, a.min_storage, b.eggs_storage_id, 
                        a.acclimatized, a.suitable, a.expired 
                        FROM osincubatorplant a 
                        LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id 
                        WHERE partnership_id = $1 and init_date <= NOW() and b.eggs_storage_id != 0 And b.eggs_executed is not null 
                        group by _day, a.incubator_plant_id, init_date, end_date, b.lot, b.eggs_storage_id  
                        order by init_date DESc`,[partnership_id]);
};

exports.DBfindAvailableByPlant = function(incubator_plant_id) {

    return conn.db.any("SELECT CASE WHEN sum(eggs_executed) is null then 0 else sum(eggs_executed) end as eggs "+
                       "FROM txeggs_storage "+
                       "WHERE incubator_plant_id = $1 and end_date < NOW() ",
    [incubator_plant_id]);
};

//Buscar los lotes que puedo Asignar
exports.DBfindEggsStorageByDateDetail = function(scenario_id, breed_id, incubator_plant_id, date) {
    
    return conn.db.any("SELECT DISTINCT  EXTRACT(DAY FROM(timestamp $2 - end_date   )) as _day, lot, eggs_executed as eggs, "+
                       "case when min_storage  <= EXTRACT(DAY FROM(timestamp $2 - end_date   ))  and EXTRACT(DAY FROM(timestamp $2 - end_date   )) <= max_storage then 'Success' "+
                       "when EXTRACT(DAY FROM(timestamp $2 - end_date   )) > max_storage then 'Error' ELSE 'Warning' End as state, eggs_storage_id, lot "+
                       "FROM txeggs_storage a "+
                       "LEFT JOIN osincubatorplant b on a.incubator_plant_id = b.incubator_plant_id "+
                       "WHERE a.incubator_plant_id = $1 and end_date <= $2 and scenario_id = $3 and breed_id = $4 and eggs !=0  "+
                       "order by _day DESC ", [incubator_plant_id,date, scenario_id, breed_id]);
};

exports.DBsubtractAvailability = function(eggs, eggs_storage_id) {

    let promise = conn.db.none(" UPDATE txeggs_storage SET eggs = eggs-$1 "+
                             "WHERE eggs_storage_id = $2 ",
    [eggs, eggs_storage_id ]);
    return promise;
};

exports.DBaddEggs = function( eggs_storage_id, eggs) {

    let promise = conn.db.none("UPDATE txeggs_storage SET eggs = eggs+$1 "+
                             "WHERE eggs_storage_id = $2 ",
    [eggs, eggs_storage_id ]);
    return promise;
};

exports.DBdeleteStorageByLot = function(lot) {
    return conn.db.none("DELETE FROM public.txeggs_storage WHERE lot = $1 ",[lot]);
};

exports.DBfindEggsByDate = function(breed_id,scenario_id, init_date){
    let _date = `${init_date.getFullYear()}-${init_date.getMonth()+1}-${init_date.getDate()}`;
    return conn.db.any("SELECT case when( sum(eggs_executed) is null) then 0 else sum(eggs_executed) end as eggs_executed FROM txeggs_storage WHERE breed_id = $1 and scenario_id = $2 and init_date < $3 ", 
        [breed_id,scenario_id, _date]);
};


exports.DBfindAllDateQuantityFarmProductReproductora = function() {



    return conn.db.any(`select '4' as POS, TO_CHAR(max(end_date), 'DD.MM.YYYY') as SCHEDULED_DATE, min(eggs_storage_id) as id, 
    sum(eggs) as scheduled_quantity, max(c.code) as CENTER_CODE , max(h.code) as PRODUCT_CODE
    from public.txeggs_storage a 
    LEFT JOIN public.txhousingway_detail e on a.lot = e.lot 
    LEFT JOIN public.osfarm c on e.farm_id = c.farm_id 


    LEFT JOIN public.txhousingway g on e.housing_way_id = g.housing_way_id

    LEFT JOIN public.mdprocess f on g.stage_id = f.stage_id

    LEFT JOIN public.mdproduct h on f.product_id = h.product_id 
  
    WHERE e.incubator_plant_id !=0

    group by(a.lot);`);
};

exports.DBdeleteEggsStorageByScenario = function(id) {
    return conn.db.none("DELETE FROM public.txeggs_storage WHERE scenario_id = $1 ",[id]);
};

exports.DBfindAllEggsStorage = function(params) {
    return conn.db.any("SELECT * FROM txeggs_storage WHERE breed_id = $1 AND eggs_storage_id != 0 ORDER BY eggs_storage_id", [params.breed_id]);
};

exports.DBfindEggsStorageByLotAndDate = function(params) {
    return conn.db.any("SELECT * FROM txeggs_storage WHERE lot = $1 AND init_date BETWEEN TO_DATE($2, 'YYYY-MM-DD') AND TO_DATE($2, 'YYYY-MM-DD') + 6 ORDER BY eggs_storage_id",
        [params.lot, params.init_date_start]);
};

exports.DBupdateExecutedEggs = function(params){
    return conn.db.none("UPDATE txeggs_storage SET eggs_executed = $1 WHERE init_date = $2 AND lot = $3", [params.eggs_executed, params.init_date, params.lot]);
};

exports.DBfindEggsStorageDataReport = function(params){
    return conn.db.any("SELECT * FROM txeggs_storage WHERE scenario_id = $5 and breed_id = $1 AND CASE WHEN $6 != 'Todos' then lot LIKE '$6#%' else true end " +  (params.lot != "Todos" ? "AND lot = $2 " : "") +
    `AND eggs_storage_id != 0
    AND init_date BETWEEN TO_DATE('$3-01-01', 'YYYY-MM-DD') AND TO_DATE('$4-12-31', 'YYYY-MM-DD')
    ORDER BY eggs_storage_id`, [params.breed_id, params.lot, parseInt(params.year), parseInt(params.end_year), params.scenario_id, params.parent_lot]);
};

exports.DBfindEggsStorageDataReportNew = function(params){
    
    return conn.db.any(`SELECT * FROM txeggs_storage WHERE scenario_id = $5 and breed_id = $1 AND lot LIKE '$2#%'
    AND eggs_storage_id != 0
    AND init_date BETWEEN TO_DATE('$3-01-01', 'YYYY-MM-DD') AND TO_DATE('$4-12-31', 'YYYY-MM-DD')
    ORDER BY eggs_storage_id`, [params.breed_id, params.lot, parseInt(params.year), parseInt(params.end_year), params.scenario_id, params.parent_lot]);
};
exports.DBfindEggsStorageDataReportNewAll = function(params){
    return conn.db.any(`SELECT TO_CHAR(init_date, 'DD/MM/YYYY') as init_date,lot,eggs,eggs_executed FROM txeggs_storage WHERE breed_id =$1
    AND eggs_storage_id != 0
    AND init_date BETWEEN TO_DATE('$2-01-01', 'YYYY-MM-DD') AND TO_DATE('$3-12-31', 'YYYY-MM-DD')
    ORDER BY eggs_storage_id`, [params.breed_id,parseInt(params.year), parseInt(params.end_year)]);
};

exports.DBfindAllEggsStorageView = function(params) {

    return conn.db.any(`SELECT SUM(eg.eggs) as eggs, 
    CASE WHEN SUM(eg.eggs_executed) IS NULL = true THEN 0 ELSE SUM(eg.eggs_executed) END as eggs_executed,
    TO_CHAR(date_trunc('week', eg.init_date), 'YYYY-MM-DD') AS week, false as evictionprojected,
    extract('week' FROM eg.init_date) as num_week
    FROM txeggs_storage eg left join osincubatorplant ip on eg.incubator_plant_id = ip.incubator_plant_id
    WHERE eg.scenario_id = $5 and breed_id = $1 and ip.partnership_id = $4 AND CASE WHEN $6 != 'Todos' then lot LIKE '$6#%' else true end
    AND init_date BETWEEN TO_DATE('$2-01-01', 'YYYY-MM-DD') AND TO_DATE('$3-12-31', 'YYYY-MM-DD')
    GROUP BY week, num_week, evictionprojected
    ORDER BY week ASC`, [params.breed_id, parseInt(params.year), parseInt(params.end_year),  params.partnership_id, params.scenario_id, params.parent_lot]);
};

exports.DBaddDateOriginal = function(incub_id,scenario_id,breed_id,date,lot,eggs){
    return conn.db.one("INSERT INTO public.txeggs_storage (eggs_storage_id,incubator_plant_id,scenario_id, breed_id,init_date,end_date,lot,eggs_executed) "+
    "VALUES ($1, $2 , $3, $4, $5, $5, $6, $7) RETURNING eggs_storage_id", [0,incub_id,scenario_id,breed_id,date,lot,eggs]);
};


exports.DBfindArpLotByErpLot = function(lot, scenario_id) {
    return conn.db.one(`SELECT lot
                        FROM txeggs_storage
                        WHERE scenario_id = ${scenario_id} and lot_sap = $1`, [lot]);
};

exports.DBfindEggsStorageByWeek = function(params) {
    return conn.db.any(`SELECT SUM(eggs) as eggs,
                        TO_CHAR(date_trunc('week', init_date), 'YYYY-MM-DD') AS week,
                        extract('week' FROM init_date) as num_week, evictionprojected is true as evictionprojected, 
                        lot
                        FROM txeggs_storage eg
                        WHERE eg.scenario_id = $6 and extract('week' FROM init_date) = $1
                        AND CASE WHEN $7 != 'Todos' then lot LIKE '$7#%' else true end
                        AND breed_id = $2
                        AND init_date BETWEEN TO_DATE($3, 'YYYY-MM-DD') AND TO_DATE($3, 'YYYY-MM-DD') + interval '6 day'
                        AND init_date BETWEEN TO_DATE('$4-01-01', 'YYYY-MM-DD') AND TO_DATE('$5-12-31', 'YYYY-MM-DD')
                        GROUP BY week, num_week, lot, evictionprojected
                        ORDER BY week ASC`, [params.num_week, params.breed_id, params.init_week, parseInt(params.year), parseInt(params.end_year), params.scenario_id, params.parent_lot]);
};

exports.DBfindEggsStorageLots = function(params) {
    
    return conn.db.any(`
        SELECT distinct lot 
        FROM txeggs_storage eg  
        LEFT JOIN osincubatorplant ip on eg.incubator_plant_id = ip.incubator_plant_id
        WHERE ip.partnership_id = $2 and breed_id = $1 
        AND (CASE WHEN $3 is null THEN true ELSE (CASE WHEN $3 != 'Todos' THEN TO_CHAR(init_date, 'YYYY') = $3 ELSE true END) END) 
        AND eggs_storage_id != 0 and origin is null 
        ORDER BY lot ASC`
        , [params.breed_id, params.partnership_id, params.year.toString()]);
};

exports.DBfindEggsStorageLotsFather = function(params) {
    
    return conn.db.any(`
        SELECT distinct substring(lot,1,4) as lot
        FROM txeggs_storage eg  
        LEFT JOIN osincubatorplant ip on eg.incubator_plant_id = ip.incubator_plant_id
        WHERE eg.scenario_id = $4 and ip.partnership_id = $2 and breed_id = $1 
        AND (CASE WHEN $3 != 'Todos' THEN TO_CHAR(init_date, 'YYYY') = $3 ELSE true END) 
        AND eggs_storage_id != 0 and origin is null 
        ORDER BY lot ASC`
        , [params.breed_id, params.partnership_id, params.year.toString(), params.scenario_id]);
};

exports.DBfindEggsStorageByYearBreedLot = function(params) {
    return conn.db.any(`SELECT SUM(eggs) as eggs,
                      CASE WHEN SUM(eggs_executed) IS NULL = true THEN 0 ELSE SUM(eggs_executed) END as eggs_executed,
                      TO_CHAR(date_trunc('week', init_date), 'YYYY-MM-DD') AS week, evictionprojected is true as evictionprojected,
                      extract('week' FROM init_date) as num_week
                      FROM txeggs_storage
                      WHERE scenario_id = $5 and breed_id = $1 AND lot = $2 AND init_date BETWEEN TO_DATE('$3-01-01', 'YYYY-MM-DD') AND TO_DATE('$4-12-31', 'YYYY-MM-DD')
                      GROUP BY week, num_week, evictionprojected
                      ORDER BY week ASC`, [params.breed_id, params.lot, parseInt(params.year), parseInt(params.end_year), params.scenario_id]);
};

exports.DBfindEggsStorageDetailByYearWeekBreedLot = function(params) {
    
    return conn.db.any(`SELECT
					TO_CHAR(init_date, 'YYYY-MM-DD') as dia,
					SUM(eggs),
          lot,
          eggs_executed
					FROM txeggs_storage
					WHERE breed_id = $1 AND lot = $2 AND init_date BETWEEN TO_DATE('$3-01-01', 'YYYY-MM-DD') AND TO_DATE('$4-12-31', 'YYYY-MM-DD') AND extract('week' FROM init_date) = $5
					GROUP BY init_date, lot, eggs_executed
					ORDER BY init_date ASC`, [params.breed_id, params.lot, parseInt(params.year), parseInt(params.end_year), parseInt(params.num_week)]);
};

exports.DBfindEggsStorageByYearBreedLotAllChilds = function(params) {
    return conn.db.any(`SELECT SUM(es.eggs) as eggs,
                      CASE WHEN SUM(es.eggs_executed) IS NULL = true THEN 0 ELSE SUM(es.eggs_executed) END as eggs_executed,
                      TO_CHAR(date_trunc('week', es.init_date), 'YYYY-MM-DD') AS week,
                      extract('week' FROM es.init_date) as num_week
                      FROM txeggs_storage es
                      LEFT JOIN osincubatorplant ip on es.incubator_plant_id = ip.incubator_plant_id
                      WHERE es.scenario_id = $5 and ip.partnership_id = $6 and es.breed_id = $1 AND es.LOT LIKE '$2#%'
                      AND es.init_date BETWEEN TO_DATE('$3-01-01', 'YYYY-MM-DD') AND TO_DATE('$4-12-31', 'YYYY-MM-DD')
                      GROUP BY week, num_week
                      ORDER BY week ASC`, [params.breed_id, params.lot, parseInt(params.year), parseInt(params.end_year), params.scenario_id, params.partnership_id]);

};


                   
exports.DBfindEggsStorageLotsChilds = function(params) {
    console.log(params)
    return conn.db.any(`
        SELECT distinct lot
        FROM txeggs_storage 
        WHERE scenario_id = $4 and breed_id = $1 AND lot LIKE '$2#%' AND eggs_storage_id != 0 and origin is null AND (CASE WHEN $3 != 'Todos' THEN TO_CHAR(init_date, 'YYYY') = $3 ELSE true END) 
        ORDER BY lot ASC`
    , [params.breed_id, params.lot, params.year.toString(), params.scenario_id]);
};
exports.DBfindEggsStorageYears = function(params) {
    return conn.db.any("SELECT DISTINCT TO_CHAR(init_date, 'YYYY') as year FROM txeggs_storage ORDER BY TO_CHAR(init_date, 'YYYY') ASC");
};

