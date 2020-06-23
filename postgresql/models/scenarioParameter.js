const config = require("../../config");
// Conexión a la BD:
const conn = require("../db");

exports.DBfindparameterbyId = (scenario_parameter_id) => {

    let promise = conn.db.many("SELECT a.parameter_id, b.measure_id as measure_id, d.originvalue, d.valuekg, d.is_unit, "+
                             " use_month as month, use_year as year, a.scenario_id, a.use_value as value, "+
                             " c.process_id, e.weight_goal "+
                             "FROM public.txscenarioparameter a "+
                             "LEFT JOIN public.mdparameter b on a.parameter_id = b.parameter_id "+
                             "LEFT JOIN public.mdprocess c on b.process_id = c.process_id "+
                             "LEFT JOIN public.mdmeasure d on b.measure_id = d.measure_id "+
                             "LEFT JOIN public.txscenarioprocess e on c.process_id = e.process_id and a.scenario_id = e.scenario_id "+
                             "WHERE a.scenario_parameter_id = $1;", [scenario_parameter_id]);
    return promise;
};


function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }
    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBgeneratedEcParameter = function(results) {
    // console.log("lo que recibe la DB 11/07")
    // console.log(results)

    return conn.db.none("INSERT INTO txscenarioparameter (process_id, parameter_id, use_year,  use_month, use_value, scenario_id) VALUES $1",
        Inserts("${process_id}, ${parameter_id}, ${year}, ${month}, ${value}, ${scenario_id}",results));

};

exports.DBgetAllParameters = (scenario_id, year,type) => {
    /*
    PONER LA CONDICIÓN DEL WHERE CUANDO SE TENGA LA TABLA LISTA
  */
    let promise = conn.db.many("SELECT CONCAT (b.name,' (',c.abbreviation,')') as name ,c.is_unit, b.parameter_id, "+
                             " a.scenario_parameter_id, a.process_id,a.use_year as year,a.use_month as month, "+
                             " a.use_value as value, a.scenario_id "+
                             "FROM public.txscenarioparameter a "+
                             "LEFT JOIN public.mdparameter b on a.parameter_id = b.parameter_id "+
                             "LEFT JOIN public.mdmeasure c on b.measure_id = c.measure_id "+
                             "WHERE b.type=$1 and a.scenario_id = $2 and a.use_year=$3 ORDER BY parameter_id, year, month;", [type,scenario_id, year]);

    return promise;
};

exports.BDupdateScenariosParameters = (records) => {
    // console.log('BDupdateScenariosParameters', typeof(records[0].value))
    console.log("BDupdateScenariosParameters", records[0]);
    let query = conn.pgp.helpers.update(records, ["?scenario_parameter_id", "use_value", "value_units"], "txscenarioparameter") + " WHERE v.scenario_parameter_id = t.scenario_parameter_id";
    let promise = conn.db.none(query);

    return promise;

};


exports.BDgetParameterGoal = (scenario_id) => {

    // let promise = conn.db.many(" SELECT a.scenario_id, a.parameter_id,c.name as parameter_name, (b.units_day/a.divider) as unit_goal, d.breed_id, d.biological_active, "+
	// 						 " a.process_id, d.name as process_name ,b.use_day as day, b.use_month as month, b.use_year as year, b.week_day, e.product_id, e.code, e.name as product_name, "+
	// 						 " TO_CHAR(b.use_week at time zone 'America/Caracas','DD/MM/YYYY') week, d.calendar_id, capacity, a.duration, f.sequence, (f.sequence - a.duration) as newsequence "+
	// 						 " FROM txscenarioformula a "+
	// 						 " LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id "+
	// 						 " LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id "+
	// 						 " LEFT JOIN mdprocess d on a.process_id = d.process_id "+
	// 						 " LEFT JOIN mdproduct e on d.product_id = e.product_id "+
	// 						 " LEFT JOIN txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id "+
	// 						 " WHERE a.scenario_id =$1  and f.sequence IS NOT NULL order by newsequence, process_order ASC", [scenario_id]);
    // return promise;

    // let promise = conn.db.many(" SELECT a.scenario_id, a.parameter_id,c.name as parameter_name, CASE WHEN d.stage_id = 5 THEN (CASE WHEN d.biological_active IS NOT TRUE THEN (b.units_day/a.divider)/7 ELSE (b.units_day/a.divider) END)ELSE (b.units_day/a.divider) END as unit_goal, d.breed_id, d.biological_active, "+
	// 						 " a.process_id, d.name as process_name ,b.use_day as day, b.use_month as month, b.use_year as year, b.week_day, e.product_id, e.code, e.name as product_name, "+
	// 						 " TO_CHAR(b.use_week,'DD/MM/YYYY') week, d.calendar_id, capacity, a.duration, f.sequence, (f.sequence - a.duration) as newsequence "+
	// 						 " FROM txscenarioformula a "+
	// 						 " LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id "+
	// 						 " LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id "+
	// 						 " LEFT JOIN mdprocess d on a.process_id = d.process_id "+
	// 						 " LEFT JOIN mdproduct e on d.product_id = e.product_id "+
	// 						 " LEFT JOIN txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id "+
    //                          " WHERE a.scenario_id =$1  and f.sequence IS NOT NULL order by newsequence, process_order ASC", [scenario_id]);
    let promise = conn.db.many("select distinct t.process_id,sum(t.use_value),t.use_month,t.use_year from txscenarioparameter t where t.scenario_id =$1 group by t.process_id,t.use_month,t.use_year  order by t.process_id,t.use_year ,t.use_month asc;", [scenario_id]);
    return promise;
};

exports.BDgetParameterGoalByDate = (scenario_id, product_id, init_date, end_date) => {
// console.log("****",scenario_id, product_id, init_date, end_date);
    // let promise = conn.db.manyOrNone("SELECT a.newsequence, calendar, SUM(unit_goal) as goal, TO_CHAR(b.use_date,'YYYY-MM-DD 00:00:00')::TIMESTAMP as date "+
    //                         "FROM( "+
    //                         "		SELECT a.scenario_id, a.parameter_id,c.name as parameter_name, (b.units_day/a.divider) as unit_goal, d.breed_id, d.biological_active,  "+
    //                         "		a.process_id, d.name as process_name ,b.use_day as day, b.use_month as month, b.use_year as year, b.week_day, e.product_id, e.name as product_name,  "+
    //                         "		TO_CHAR(b.use_week at time zone 'America/Caracas','DD/MM/YYYY') week, d.calendar_id as calendar, capacity, a.duration, f.sequence, (f.sequence - a.duration) as newsequence  "+
    //                         "		FROM txscenarioformula a  "+
    //                         "		LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id  "+
    //                         "		LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id  "+
    //                         "		LEFT JOIN mdprocess d on a.process_id = d.process_id  "+
    //                         "		LEFT JOIN mdproduct e on d.product_id = e.product_id  "+
    //                         "		LEFT JOIN txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id  "+
    //                         "		WHERE a.scenario_id = $1 and e.product_id = $2  and f.sequence IS NOT NULL order by newsequence, process_order ASC "+
    //                         ")a  "+
    //                         "LEFT JOIN txcalendarday b on b.calendar_id = calendar and newsequence = b.sequence "+
    //                         "WHERE b.use_date::DATE BETWEEN $3 AND $4  "+
    //                         "group by a.newsequence, a.calendar, b.use_date "+
    //                         "order by b.use_date", [scenario_id, product_id, init_date, end_date]);
  
    // return promise;

    let promise = conn.db.manyOrNone("SELECT a.newsequence, calendar, SUM(unit_goal) as goal, TO_CHAR(b.use_date,'YYYY-MM-DD 00:00:00')::TIMESTAMP as date "+
                            "FROM( "+
                            "		SELECT a.scenario_id, a.parameter_id,c.name as parameter_name, (b.units_day/a.divider) as unit_goal, d.breed_id, d.biological_active,  "+
                            "		a.process_id, d.name as process_name ,b.use_day as day, b.use_month as month, b.use_year as year, b.week_day, e.product_id, e.name as product_name,  "+
                            "		TO_CHAR(b.use_week,'DD/MM/YYYY') week, d.calendar_id as calendar, capacity, a.duration, f.sequence, (f.sequence - a.duration) as newsequence  "+
                            "		FROM txscenarioformula a  "+
                            "		LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id  "+
                            "		LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id  "+
                            "		LEFT JOIN mdprocess d on a.process_id = d.process_id  "+
                            "		LEFT JOIN mdproduct e on d.product_id = e.product_id  "+
                            "		LEFT JOIN txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id  "+
                            "		WHERE a.scenario_id = $1 and e.product_id = $2  and f.sequence IS NOT NULL order by newsequence, process_order ASC "+
                            ")a  "+
                            "LEFT JOIN txcalendarday b on b.calendar_id = calendar and newsequence = b.sequence "+
                            "WHERE b.use_date::DATE BETWEEN $3 AND $4  "+
                            "group by a.newsequence, a.calendar, b.use_date "+
                            "order by b.use_date", [scenario_id, product_id, init_date, end_date]);
  
    return promise;
};


exports.getMaxDailyDemandEggs = (scenario_id, biologicalActive) => {
    // console.log("entrada-::: ", scenario_id, biologicalActive);
    // return conn.db.many(" SELECT MAX(demand) as unit_goal, breed as breed_id, decrease  as decrease_goal, "+
    //                     "(SELECT capacity FROM mdprocess WHERE process_id = predecessor) "+
    //                     "FROM ( "+
    //                     "	SELECT SUM(goal) as demand, week, breed, decrease, predecessor "+
    //                     "	from( "+
    //                     "			Select  SUM(unit_goal) as goal, a.use_week as week,  a.parameter_id as pedro, parameter_name, breed, decrease, predecessor "+
    //                     "			FROM( "+
    //                     "					SELECT MAX(b.units_day/a.divider) as unit_goal, d.breed_id as breed, b.use_week at time zone 'America/Caracas', a.parameter_id, c.name as parameter_name, "+
    //                     "					z.decrease_goal as decrease, d.predecessor_id as predecessor "+
    //                     "					FROM txscenarioformula a "+
    //                     "					LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id "+
    //                     "					LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id "+
    //                     "					LEFT JOIN mdprocess d on a.process_id = d.process_id "+
    //                     "					LEFT JOIN txscenarioprocess z on z.process_id = a.process_id and z.scenario_id = a.scenario_id "+
    //                     "					LEFT JOIN mdproduct e on d.product_id = e.product_id  "+
    //                     "					left join txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id "+
    //                     "					WHERE a.scenario_id = $1 and a.	process_id in ($2:csv) and f.sequence IS NOT NULL "+
    //                     "					group by   d.breed_id, b.use_week, a.parameter_id, parameter_name, decrease, predecessor "+
    //                     "					ORDER BY b.use_week, d.breed_id DESC "+
    //                     "			)a group by breed, a.use_week,  a.parameter_id, parameter_name, decrease,predecessor "+
    //                     "			order by  breed, a.use_week "+
    //                     "	)b group by week, breed, decrease, predecessor "+
    //                     "	order by week ASC "+
    //                     ")c "+
    //                     "group by breed, decrease_goal, predecessor, capacity "+
    //                     "order by breed asc", [scenario_id, biologicalActive]);

    return conn.db.many(" SELECT MAX(demand) as unit_goal, breed as breed_id, decrease  as decrease_goal, "+
                        "(SELECT capacity FROM mdprocess WHERE process_id = predecessor) "+
                        "FROM ( "+
                        "	SELECT SUM(goal) as demand, week, breed, decrease, predecessor "+
                        "	from( "+
                        "			Select  SUM(unit_goal) as goal, a.use_week as week,  a.parameter_id as pedro, parameter_name, breed, decrease, predecessor "+
                        "			FROM( "+
                        "					SELECT MAX((b.units_day)/a.divider) as unit_goal, d.breed_id as breed, b.use_week, a.parameter_id, c.name as parameter_name, "+
                        "					z.decrease_goal as decrease, d.predecessor_id as predecessor "+
                        "					FROM txscenarioformula a "+
                        "					LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id "+
                        "					LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id "+
                        "					LEFT JOIN mdprocess d on a.process_id = d.process_id "+
                        "					LEFT JOIN txscenarioprocess z on z.process_id = a.process_id and z.scenario_id = a.scenario_id "+
                        "					LEFT JOIN mdproduct e on d.product_id = e.product_id  "+
                        "					left join txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id "+
                        "					WHERE a.scenario_id = $1 and a.	process_id in ($2:csv) and f.sequence IS NOT NULL "+
                        "					group by   d.breed_id, b.use_week, a.parameter_id, parameter_name, decrease, predecessor "+
                        "					ORDER BY b.use_week, d.breed_id DESC "+
                        "			)a group by breed, a.use_week,  a.parameter_id, parameter_name, decrease,predecessor "+
                        "			order by  breed, a.use_week "+
                        "	)b group by week, breed, decrease, predecessor "+
                        "	order by week ASC "+
                        ")c "+
                        "group by breed, decrease_goal, predecessor, capacity "+
                        "order by breed asc", [scenario_id, biologicalActive]);
};

exports.DBgetParameterOByScenario = (scenario_id) =>{
    // console.log("DBgetParameterOByScenario");
    // let promise = conn.db.many("SELECT b.stage_id, b.breed_id, c.product_id, c.name as columnid, " +
    //                           "MAX(b.process_order), 'Right' as halign , 0 as parameter_id, 0 as value, "+
    //                           " 'End' as textalign, 0 as capacity, 0 as capacity, 'None' as state, 0 as residue, "+
    //                           " false as biological_active, a.process_id "+
    //                           "FROM txscenarioformula a "+
    //                           "LEFT JOIN mdprocess b on a.process_id = b.process_id "+
    //                           "LEFT JOIN mdproduct c on b.product_id = c.product_id "+
    //                           "WHERE scenario_id = $1 "+
    //                           " GROUP BY  b.stage_id, b.breed_id, c.product_id, a.process_id, c.name "+
    //                           " order by MAX(b.process_order) ", [scenario_id]);
    let promise = conn.db.many('select m2.process_id,m2."name" as columnid,m2.predecessor_id,tbl.decrease_goal,tbl.duration_goal from mdprocess m2 join (select t2.process_id,t2.decrease_goal,t2.duration_goal from txscenarioprocess t2 where t2.scenario_id= $1) as tbl on m2.process_id=tbl.process_id', [scenario_id]);

    return promise;
};

exports.DBgetCapacityByProduct = (product_id) =>{
    // console.log('llegue: '+ product_id);
    let promise = conn.db.many("SELECT * "+
                              "FROM mdprocess "+
                              "WHERE product_id = $1 ", [product_id]);

    return promise;
};

exports.DBgetScenarioId = (name) => {
    return conn.db.many("SELECT scenario_id FROM mdscenario WHERE name = $1", [name]);
};

exports.DBgetGoalsColums = (scenario_id) => {
    console.log("en DBgetGoalsColums");
    return conn.db.many("SELECT c.name as columnid " +
                      "FROM txscenarioformula a " +
                      "LEFT JOIN mdprocess b on a.process_id = b.process_id " +
                      "LEFT JOIN mdproduct c on b.product_id = c.product_id " +
                      "WHERE scenario_id = $1 GROUP BY (c.product_id, c.name) order by MAX(b.process_order)", [scenario_id]);
};

//Obtener la demanda mensual de huevos que deben llegar a incubadora,
//partiendo de la demanda mensual de pollos vivos a beneficio


exports.DBeggDemand = (scenario_id, product_id) => {
    // console.log("en DBeggDemand");
    return conn.db.many("SELECT (SELECT use_month as _month FROM txcalendarday WHERE sequence = (f.sequence - a.duration) and calendar_id = d.calendar_id ), "+
                      "(SELECT use_year as _year FROM txcalendarday WHERE sequence = (f.sequence - a.duration) and calendar_id = d.calendar_id ), a.scenario_id , "+
                      "ceil(sum(b.units_day/a.divider)) as required, d.breed_id "+
                      "FROM txscenarioformula a "+
                      "LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id "+
                      "LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id "+
                      "LEFT JOIN mdprocess d on a.process_id = d.process_id "+
                      "LEFT JOIN mdproduct e on d.product_id = e.product_id "+
                      "left join txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id "+
                      "WHERE a.scenario_id =$1 and d.product_id = $2 group by _year, _month, d.breed_id, a.scenario_id order by _year, _month, d.breed_id, a.scenario_id ASC " ,
    [scenario_id, product_id]);
};

exports.DBunitEggs = (scenario_id) => {

    return conn.db.many("SELECT (b.units_day/a.divider) as unit_goal, "+
                      "(SELECT use_day as newday FROM txcalendarday WHERE sequence = (f.sequence - a.duration) and calendar_id = d.calendar_id ), "+
                      "(SELECT use_month as newmonth FROM txcalendarday WHERE sequence = (f.sequence - a.duration) and calendar_id = d.calendar_id ), "+
                      "(SELECT use_year as newyear FROM txcalendarday WHERE sequence = (f.sequence - a.duration) and calendar_id = d.calendar_id ) "+
                      "FROM txscenarioformula a "+
                      "LEFT JOIN txscenarioparameterday b on a.scenario_id = b.scenario_id and a.parameter_id = b.parameter_id "+
                      "LEFT JOIN mdparameter c on a.parameter_id = c.parameter_id "+
                      "LEFT JOIN mdprocess d on a.process_id = d.process_id "+
                      "LEFT JOIN mdproduct e on d.product_id = e.product_id "+
                      "left join txcalendarday f on b.use_day = f.use_day and b.use_month = f.use_month and b.use_year = f.use_year and d.calendar_id = f.calendar_id "+
                      "WHERE a.scenario_id =$1 and d.product_id = 4 order by newyear, newmonth, newday ASC" , [scenario_id]);
};

exports.DBfindParameterByYear = (scenario_id, year, parameter_id) => {

    return conn.db.many("SELECT * "+
                      "FROM txscenarioparameter "+
                      "WHERE scenario_id =$1 and use_year = $2 and parameter_id = $3 " +
                      "order by use_month ASC" , [scenario_id, year, parameter_id]);
};

exports.DBsyncToERP = function(results) {

    return conn.db.none("INSERT INTO txgoals_erp (use_week, use_value, product_id, code, scenario_id) VALUES $1",
        Inserts("${_date}, ${value}, ${product_id}, ${code}, ${scenario_id}",results));

};

exports.DBisSyncToERP = (scenario_id) => {

    // return conn.db.many("SELECT goals_erp_id, use_week at time zone 'America/Caracas' as week, use_value as value, product_id, code, scenario_id "+
    //                   "FROM txgoals_erp "+
    //                   "WHERE scenario_id = $1 ", [scenario_id]);
    return conn.db.many("SELECT goals_erp_id, use_week as week, use_value as value, product_id, code, scenario_id "+
                      "FROM txgoals_erp "+
                      "WHERE scenario_id = $1 ", [scenario_id]);
};


exports.DBgetStages = () => {
    return conn.db.many("SELECT * FROM public.mdprocess");
    // return conn.db.many("SELECT * FROM public.mdstage");
};


exports.DBgetBreeds = () => {
    return conn.db.many("SELECT * FROM public.mdbreed ");
};
exports.DBgetavgcurveBreeds = () => {
    return conn.db.many("SELECT  breed_id,avg(theorical_performance) FROM public.txposturecurve group by breed_id");
};
exports.DBgetGoalsResults = () => {
    // return conn.db.many("SELECT goals_erp_id, use_week at time zone 'America/Caracas' as week, use_value as value, product_id, code, scenario_id "+
    //                     " FROM public.txgoals_erp ");
    return conn.db.many("SELECT goals_erp_id, use_week as week, use_value as value, product_id, code, scenario_id "+
                        " FROM public.txgoals_erp ");
};

exports.DBgetGoalsResultsDemandSum = () => {
    return conn.db.many("SELECT product_id, SUM(use_value) as demand FROM public.txgoals_erp GROUP BY product_id ");
};

exports.DBgetGoalsResultsByScenario = (scenario_id) => {
    // return conn.db.many("SELECT goals_erp_id, use_week at time zone 'America/Caracas' as week, use_value as value, product_id, code, scenario_id "+
    //                     " FROM public.txgoals_erp WHERE scenario_id = $1",[scenario_id]);
    return conn.db.many("SELECT goals_erp_id, use_week as week, use_value as value, product_id, code, scenario_id "+
                        " FROM public.txgoals_erp WHERE scenario_id = $1",[scenario_id]);
};


exports.DBdeleteScenarioParameterByScenario = (scenario_id) => {
    return conn.db.none("DELETE FROM public.txscenarioparameter WHERE scenario_id = $1",[scenario_id]);
};


exports.deleteExtRigth= (scenario_id, newMonth, newYear) => {
    return conn.db.none("DELETE FROM public.txscenarioparameter WHERE scenario_id = $1 and (use_year > $2 or (use_year= $2 and use_month > $3)) ",[scenario_id, newYear, newMonth]);
};

exports.deleteExtLeft= (scenario_id, newMonth, newYear) => {
    return conn.db.none("DELETE FROM public.txscenarioparameter WHERE scenario_id = $1 and (use_year < $2 or (use_year= $2 and use_month < $3)) ",[scenario_id, newYear, newMonth]);
};


exports.addExtLeft = function(results) {
    return conn.db.none("INSERT INTO txscenarioparameter (process_id, parameter_id, use_year,  use_month, use_value, scenario_id) VALUES $1",
        Inserts("${process_id}, ${parameter_id}, ${year}, ${month}, ${value}, ${scenario_id}",results));
};



exports.DBgetEstimatedGoalsById = function(scenario_id) {
    return conn.db.manyOrNone("SELECT * FROM public.txscenarioparameter WHERE scenario_id = $1 limit 1",[scenario_id]);
};
exports.DBgetprocess = function() {
    return conn.db.many('select m2.capacity,m2.process_id,m2.predecessor_id,mp.breed_id, mp."name" as columnid,mp.stage_id, m2.product_id, m2.biological_active as biological_active from mdprocess m2 join mdproduct mp on m2.product_id = mp.product_id order by stage_id asc');
};
exports.DBgetscenariByid = function(scenario_id) {
    return conn.db.any('SELECT  date_end,date_start,(date_end - date_start) as days FROM public.mdscenario where scenario_id =$1',[scenario_id]);
};