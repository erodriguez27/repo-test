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

exports.DBAddEgreso = function(fecha_movements, lot, quantity, eggs_storage_id, description_adjustment, programmed_eggs_id) {
	console.log("La description --------------->",description_adjustment, programmed_eggs_id)
		return conn.db.none(`INSERT INTO public.txeggs_movements ( fecha_movements, lot, quantity, type_movements, eggs_storage_id, description_adjustment, programmed_eggs_id) 
			values ($1, $2, $3, $5, $4, $6, $7) `, [fecha_movements, lot, quantity, eggs_storage_id, "egreso", description_adjustment,programmed_eggs_id] );
	


};


exports.DBfindProjectEggs = function(partnership_id, scenario_id) {

	return conn.db.any(`SELECT 	a.incubator_plant_id, a.name ,
	SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id 
			and hey.eggs_storage_id = b.eggs_storage_id
			Then  (hey.ingreso + hey.egreso) Else 0 END) as total,
			
	SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id 
		and hey.eggs_storage_id = b.eggs_storage_id and (EXTRACT(DAY FROM(NOW() - b.init_date )) <a.min_storage) 
		THEN (hey.ingreso + hey.egreso) ELSE 0 END ) as aclimatized,
		
	SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and (EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.min_storage and EXTRACT(DAY FROM(NOW() - b.init_date )) <a.max_storage) THEN (hey.ingreso+ hey.egreso) ELSE 0 END ) as suitable,
		
	SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and (EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.max_storage) THEN (hey.ingreso + hey.egreso) ELSE 0 END ) as expired,
		
	(
			SUM(CASE WHEN (c.type_movements = 'ingreso' and  hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and a.acclimatized= true and EXTRACT(DAY FROM(NOW() - b.init_date )) <a.min_storage) then (hey.ingreso + hey.egreso) else 0 end )+
			SUM(CASE WHEN (c.type_movements = 'ingreso' and  hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and a.suitable= true and EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.min_storage and EXTRACT(DAY FROM(NOW() - b.init_date )) <a.max_storage) then (hey.ingreso + hey.egreso) else 0 end )+
			SUM(CASE WHEN (c.type_movements = 'ingreso' and  hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and a.expired= true and EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.max_storage) then (hey.ingreso + hey.egreso) else 0 end )
	) as available from 
	(   SELECT b.fecha_movements,b.eggs_storage_id,  
		SUM(CASE WHEN b.type_movements = 'ingreso' THEN  b.quantity ELSE 0 END) As ingreso ,
		SUM(CASE WHEN b.type_movements = 'egreso' THEN  (-1)*b.quantity ELSE 0 END) As egreso
		FROM txeggs_movements b  where b.programmed_disable is not true 
		GROUP BY b.eggs_storage_id,b.fecha_movements
		Order by b.fecha_movements) AS hey ,osincubatorplant a 
	LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id  and b.scenario_id = $2 
	LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id and c.programmed_disable is not true
	WHERE   a.partnership_id = $1
	and  b.init_date <= NOW()
	and hey.eggs_storage_id = b.eggs_storage_id
	and hey.eggs_storage_id = c.eggs_storage_id
	and b.eggs_storage_id = c.eggs_storage_id
	and b.lot = c.lot 
	and (CASE WHEN (select count(*) from txeggs_movements where programmed_disable is not true) != 0 Then (hey.ingreso + hey.egreso) is not null 
			Else (hey.ingreso + hey.egreso) is null END)
	group by a.incubator_plant_id, a.name`,[partnership_id, scenario_id]);
    // return conn.db.any(`                   
    // 					SELECT 	a.incubator_plant_id, a.name ,
    // 					SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id
    // 							Then  (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) Else 0 END) as total,
    // 					SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and (EXTRACT(DAY FROM(NOW() - b.init_date )) <a.min_storage) THEN (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) ELSE 0 END ) as aclimatized,
    // 					SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and (EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.min_storage and EXTRACT(DAY FROM(NOW() - b.init_date )) <a.max_storage) THEN (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) ELSE 0 END ) as suitable,
    // 					SUM(CASE WHEN c.type_movements = 'ingreso' and hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and (EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.max_storage) THEN (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) ELSE 0 END ) as expired,
    // 					(
    // 							SUM(CASE WHEN (c.type_movements = 'ingreso' and  hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and a.acclimatized= true and EXTRACT(DAY FROM(NOW() - b.init_date )) <a.min_storage) then (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) else 0 end )+
    // 							SUM(CASE WHEN (c.type_movements = 'ingreso' and  hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and a.suitable= true and EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.min_storage and EXTRACT(DAY FROM(NOW() - b.init_date )) <a.max_storage) then (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) else 0 end )+
    // 							SUM(CASE WHEN (c.type_movements = 'ingreso' and  hey.eggs_storage_id = c.eggs_storage_id and hey.eggs_storage_id = b.eggs_storage_id and a.expired= true and EXTRACT(DAY FROM(NOW() - b.init_date )) >=a.max_storage) then (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) else 0 end )
    // 					) as available from (  
    // 					SELECT b.fecha_movements,b.eggs_storage_id,  
    // 					SUM(CASE WHEN b.type_movements = 'ingreso' THEN  b.quantity ELSE 0 END) As ingreso ,
    // 					SUM(CASE WHEN b.type_movements = 'egreso' THEN  (-1)*b.quantity ELSE 0 END) As egreso ,  
    // 					SUM(CASE WHEN b.type_movements = 'Ajuste' and b.description_adjustment  != 'Compra de huevos' THEN (-1)*b.quantity ELSE 0 END) As AjusEgreso,  
    // 					SUM(CASE WHEN b.type_movements = 'Original' THEN b.quantity ELSE 0 END) As Original,  
    // 					SUM(CASE WHEN b.type_movements = 'Ajuste' and b.description_adjustment  = 'Compra de huevos' THEN b.quantity Else 0 End) as Suma  
    // 					FROM txeggs_movements b  
    // 					GROUP BY b.eggs_storage_id,b.fecha_movements) AS hey ,osincubatorplant a 
    // 					LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id   
    // 					LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
    // 					WHERE   a.partnership_id = $1
    // 					and  b.init_date <= NOW()
    // 					and (CASE WHEN (select count(*) from txeggs_movements) != 0 Then (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) is not null 
    // 							Else (hey.ingreso + hey.AjusEgreso + hey.Original +hey.Suma + hey.egreso) is null END)
    // 					group by a.incubator_plant_id`,[partnership_id]);
    /*   return conn.db.any(` SELECT a.incubator_plant_id, a.name ,
								SUM(b.eggs_executed) as total,
								SUM(CASE WHEN (EXTRACT(DAY FROM(NOW() - init_date )) <a.min_storage) THEN b.eggs_executed ELSE 0 END ) as aclimatized,
								SUM(CASE WHEN (EXTRACT(DAY FROM(NOW() - init_date )) >=a.min_storage and EXTRACT(DAY FROM(NOW() - init_date )) <a.max_storage) THEN b.eggs_executed ELSE 0 END ) as suitable,
								SUM(CASE WHEN (EXTRACT(DAY FROM(NOW() - init_date )) >=a.max_storage) THEN b.eggs_executed ELSE 0 END ) as expired,
								(
									SUM(CASE WHEN (a.acclimatized= true and EXTRACT(DAY FROM(NOW() - init_date )) <a.min_storage) then b.eggs_executed else 0 end )+
									SUM(CASE WHEN (a.suitable= true and EXTRACT(DAY FROM(NOW() - init_date )) >=a.min_storage and EXTRACT(DAY FROM(NOW() - init_date )) <a.max_storage) then b.eggs_executed else 0 end )+
									SUM(CASE WHEN (a.expired= true and EXTRACT(DAY FROM(NOW() - init_date )) >=a.max_storage) then b.eggs_executed else 0 end )
								) as available

						FROM    osincubatorplant a 
								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id

						WHERE   partnership_id = $1
								and init_date <= NOW() 
								And b.eggs_executed is not null 

						group by a.incubator_plant_id`,[partnership_id]); */
};

exports.DBgetForceProject= function(partnership_id){
    return conn.db.any(`
						SELECT 	a.incubator_plant_id, a.name, 0 as aclimatized
								, 0 as suitable, 0 as expired, 0 as total
								, 0 as available, 0 as weighted_days

						FROM    osincubatorplant a 
								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id

						WHERE   partnership_id = $1
								And b.eggs_executed is not null 

						group by a.incubator_plant_id, a.name`, [partnership_id]);
};

exports.DBgetWeightedDays= function(scenario_id){
    return conn.db.any(`
								select 	sub.incubator_plant_id
										, sum(days) suma_dias
										, sum(diff) suma_diffs
										, sum(days * diff) as numerador
								from (
										SELECT 	b.incubator_plant_id
														,a.eggs_storage_id
														,b.init_date
														,(EXTRACT(DAY FROM(NOW() - b.init_date ))) as days
														,((SUM(CASE WHEN a.type_movements='ingreso' THEN a.quantity ELSE 0 END )) - (SUM(CASE WHEN a.type_movements='egreso' THEN a.quantity ELSE 0 END ))) as diff

										FROM txeggs_movements a
												LEFT JOIN txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id and b.scenario_id = $1
										WHERE b.scenario_id = $1
										group by b.incubator_plant_id ,a.eggs_storage_id, b.init_date
								) as sub
								group by sub.incubator_plant_id`, [scenario_id]);
};
exports.DBgetMovementsByDescription= function(description){
    return conn.db.any(`SELECT eggs_movements_id, fecha_movements, lot, quantity, type_movements, eggs_storage_id, description_adjustment
							FROM public.txeggs_movements where description_adjustment = $1`, [description]);
};

exports.DBfindEntryEggs = function(partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id) {
console.log("find", partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id)
    return conn.db.any(`select DISTINCT b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, (c.quantity + (select sum(CASE when gg.justification is not null then (Case when gg.type_movements = 'ingreso' then gg.quantity else -1*gg.quantity end) else 0 end) from txeggs_movements gg WHERE gg.lot = c.lot group by lot)) as quantity,
						(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
						from    osincubatorplant a 
								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
								LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
						WHERE   b.scenario_id = $5 and a.partnership_id = $1
								and b.incubator_plant_id= $2
								and case when $3 is not null then init_date >= $3 else true end
								and case when $4 is not null then init_date <= $4 else true end
								And b.eggs_executed is not null
								and (c.type_movements= 'ingreso' or c.type_movements is null)
								and b.origin is null
								and c.description_adjustment is null
								and c.justification is null
						ORDER BY b.lot asc`,
    [partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id]);
    // return conn.db.any(`    select  b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, c.quantity,
    // 						(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
    // 						from    osincubatorplant a 
    // 								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
    // 								LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
    // 						WHERE   a.partnership_id = $1
    // 								and b.incubator_plant_id= $2
    // 								and init_date >= $3
    // 								and init_date <= $4
    // 								And b.eggs_executed is not null
    // 								and (c.type_movements= 'ingreso' or c.type_movements is null)
    // 						ORDER BY b.eggs_storage_id ASC `,
    // 				[partnership_id, incubator_plant_id, dateDesde, dateHasta]);
};

exports.DBfindEntryEggsPlexus = function(partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id) {

    return conn.db.any(`select DISTINCT b.eggs_storage_id, a.incubator_plant_id, a.name, c.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, (c.quantity + (select sum(CASE when gg.justification is not null then (Case when gg.type_movements = 'ingreso' then gg.quantity else -1*gg.quantity end) else 0 end) from txeggs_movements gg WHERE gg.lot = c.lot group by lot)) as quantity,
						(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
						from    osincubatorplant a 
								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
								LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
						WHERE   b.scenario_id = $5 and a.partnership_id = $1
								and b.incubator_plant_id= $2
								and init_date >= $3
								and init_date <= $4
								And b.eggs_executed is not null
								and (c.type_movements= 'ingreso' or c.type_movements is null)
								and b.origin is null
								and c.description_adjustment = 'Plexus'
								and c.justification is null
								ORDER BY c.lot asc`,
    [partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id]);
};

exports.DBfindEntryEggsPlexusWithLot = function(partnership_id, incubator_plant_id, dateDesde, dateHasta, lot, scenario_id) {

    return conn.db.any(`select DISTINCT b.eggs_storage_id, a.incubator_plant_id, a.name, c.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, (c.quantity + (select sum(CASE when gg.justification is not null then (Case when gg.type_movements = 'ingreso' then gg.quantity else -1*gg.quantity end) else 0 end) from txeggs_movements gg WHERE gg.lot = c.lot group by lot)) as quantity,
						(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
						from    osincubatorplant a 
								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
								LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
						WHERE   b.scenario_id = $6 and a.partnership_id = $1
								and b.incubator_plant_id= $2
								and (case when $3 is not null and $4 is not null then init_date between $3 and $4 else true end)
								and b.eggs_executed is not null
								and (c.type_movements= 'ingreso' or c.type_movements is null)
								and b.origin is null
								and c.description_adjustment = 'Plexus'
								and c.justification is null
								and c.lot = $5
						ORDER BY b.eggs_storage_id ASC `,
    [partnership_id, incubator_plant_id, dateDesde, dateHasta, lot, scenario_id]);
};


exports.DBfindAjustes = function(eggs_storage_id) {

    return conn.db.any("SELECT description_adjustment, lot, TO_CHAR(fecha_movements, 'DD/MM/YYYY') as fecha_movements, quantity FROM txeggs_movements where eggs_storage_id = $1 and type_movements = 'ingreso' and description_adjustment is not null",
        [eggs_storage_id]);
    // return conn.db.any(`    select  b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, c.quantity,
    // 						(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
    // 						from    osincubatorplant a 
    // 								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
    // 								LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
    // 						WHERE   a.partnership_id = $1
    // 								and b.incubator_plant_id= $2
    // 								and init_date >= $3
    // 								and init_date <= $4
    // 								And b.eggs_executed is not null
    // 								and (c.type_movements= 'ingreso' or c.type_movements is null)
    // 						ORDER BY b.eggs_storage_id ASC `,
    // 				[partnership_id, incubator_plant_id, dateDesde, dateHasta]);
};

exports.DBfindEntryEggs2 = function(partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id) {

    return conn.db.any(`select  b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, c.quantity,
		(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
		from    osincubatorplant a 
				LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id and origin = 1
				LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
		WHERE   b.scenario_id = $5 and a.partnership_id = $1
				and b.incubator_plant_id= $2
				and init_date >= $3
				and init_date <= $4
				And b.eggs_executed is not null
				and (c.type_movements= 'ingreso' or c.type_movements is null)
		ORDER BY b.lot asc`,
    [partnership_id, incubator_plant_id, dateDesde, dateHasta, scenario_id]);
};

exports.DBfindEntryEggsWithLot = function(partnership_id, incubator_plant_id, dateDesde, dateHasta, lot, scenario_id) {
	console.log(dateDesde, dateHasta)
    return conn.db.any(`select DISTINCT b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, (c.quantity + (select sum(CASE when gg.justification is not null then (Case when gg.type_movements = 'ingreso' then gg.quantity else -1*gg.quantity end) else 0 end) from txeggs_movements gg WHERE gg.lot = c.lot group by lot)) as quantity,
						(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
						from    osincubatorplant a 
								LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
								LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
						WHERE   b.scenario_id = $6 and a.partnership_id = $1
								and b.incubator_plant_id= $2
								--and (case when $3 is not null and $4 is not null then init_date between $3 and $4 else true end)
								and b.eggs_executed is not null
								and (c.type_movements= 'ingreso' or c.type_movements is null)
								and b.origin is null
								and c.description_adjustment is null
								and c.justification is null
								and b.lot = $5
						ORDER BY b.eggs_storage_id ASC `,
    [partnership_id, incubator_plant_id, dateDesde, dateHasta  , lot, scenario_id]);
    // return conn.db.any(`    select  b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, c.quantity,
	// 							(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
	// 							from    osincubatorplant a 
	// 									LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id
	// 									LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
	// 							WHERE   a.partnership_id = $1
	// 									and b.incubator_plant_id= $2
	// 									and init_date >= $3
	// 									and init_date <= $4
	// 									And b.eggs_executed is not null
	// 									and (c.type_movements= 'ingreso' or c.type_movements is null)
	// 									and b.origin is null
	// 									and c.description_adjustment is null
	// 									and b.lot = $5
	// 							ORDER BY b.eggs_storage_id ASC `,
    // [partnership_id, incubator_plant_id, dateDesde, dateHasta, lot]);
};
exports.DBfindEntryEggsWithLot2 = function(partnership_id, incubator_plant_id, dateDesde, dateHasta, lot, scenario_id) {

    return conn.db.any(`    select  b.eggs_storage_id, a.incubator_plant_id, a.name, b.lot, b.init_date, b.eggs_executed, c.type_movements, c.fecha_movements, c.quantity,
								(CASE WHEN c.fecha_movements IS NULL and c.quantity IS NULL THEN true ELSE false END) AS available
								from    osincubatorplant a 
										LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id and origin = 1 
										LEFT JOIN txeggs_movements c on b.eggs_storage_id = c.eggs_storage_id
								WHERE   b.scenario_id = $6 and a.partnership_id = $1
										and b.incubator_plant_id= $2
										--and (case when $3 is not null then init_date >= $3 else true end)
										--and (case when $4 is not null then init_date <= $4 else true end)
										and (case when $3 is not null and $4 is not null then init_date between $3 and $4 else true end)
										and b.eggs_executed is not null
										and (c.type_movements= 'ingreso' or c.type_movements is null)
										and b.lot = $5
								ORDER BY b.eggs_storage_id ASC `,
    [partnership_id, incubator_plant_id, dateDesde, dateHasta, lot, scenario_id]);
};

exports.DBaddEntryEggs = function(records){

    cs = conn.pgp.helpers.ColumnSet(["eggs_storage_id", "fecha_movements",  "lot" , "quantity" , "type_movements"],
        {table: "txeggs_movements", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));
};
exports.DBfindMaxLotPlexus = function(plexus) {
    let promise = conn.db.one("select MAX(CAST((substring(lot, 2, 10)) AS INTEGER)) from txeggs_movements where description_adjustment = $1", [plexus]);
    return promise;
};
exports.DBaddAdjustEntryEggs = function(records){

    cs = conn.pgp.helpers.ColumnSet(["eggs_storage_id", "fecha_movements",  "lot" , "quantity" , "type_movements", "description_adjustment"],
        {table: "txeggs_movements", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));
};
exports.DBaddAdjustEgressEggs = function(records){

    cs = conn.pgp.helpers.ColumnSet(["eggs_storage_id", "fecha_movements",  "lot" , "quantity" , "type_movements", "description_adjustment"],
        {table: "txeggs_movements", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));
};
exports.DBaddNewEntryEggs = function(records){
    return conn.db.any(`INSERT INTO public.txeggs_storage(incubator_plant_id, scenario_id, breed_id, init_date, end_date, lot, 
						eggs, eggs_executed, origin) VALUES $1 RETURNING eggs_storage_id`,
    Inserts("${incubator_plant_id},${scenario_id},${breed_id}, ${init_date}, ${end_date}, ${lot},"+ 
		"${eggs}, ${eggs_executed}, ${origin}",records));
    // cs = conn.pgp.helpers.ColumnSet(['incubator_plant_id', 'scenario_id',  'breed_id' , 'init_date' , 'end_date', 'lot', 'eggs', 'eggs_executed', 'origin'],
    // 								{table: 'txeggs_storage', schema: 'public'});
    // return conn.db.none(conn.pgp.helpers.insert(records, cs));
};

exports.DBfindMaxLotComp = function(scenario_id) {
    let promise = conn.db.one("select MAX(CAST((substring(lot, 2, 10)) AS INTEGER)) from txeggs_storage where scenario_id = $1 and origin = 1", [scenario_id]);
    return promise;
};


exports.DBfindProjectIncubator = function(scenario_id, init_date, end_date, incubator_plant_id, breed_id) {

    console.log("llegpo al modelo");
    console.log(scenario_id);
    console.log(init_date);
    console.log(end_date);
    console.log(incubator_plant_id);
    console.log(breed_id);

    return conn.db.any(`select a.eggs_movements_id, a.fecha_movements, a.lot, a.type_movements, a.eggs_storage_id, a.description_adjustment, a.justification ,
						b.eggs_storage_id, b.incubator_plant_id, b.scenario_id, b.breed_id, b.init_date, b.end_date, b.lot, b.eggs, b.origin,  b.eggs_executed,
						b.synchronized, b.lot_sap,
						(-1*(SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
						WHERE aa.programmed_disable is not true and lot = a.lot and type_movements = 'egreso' and programmed_disable is not true)) as residue,
						((SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
						WHERE aa.programmed_disable is not true and lot = a.lot and type_movements = 'ingreso')) as quantity
						from txeggs_movements a
						left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id 
						where b.scenario_id = $1 and CASE WHEN $2 IS NOT NULL AND $3 IS NOT NULL THEN a.fecha_movements between $2 and $3 ELSE TRUE END and b.incubator_plant_id = $4 and 
						b.breed_id = $5 and type_movements = 'ingreso' and a.justification is null and (a.description_adjustment is null or a.description_adjustment = 'Compra')
						order by a.fecha_movements`, [scenario_id, init_date, end_date, incubator_plant_id, breed_id]);
//     return conn.db.any(`select * ,
// 	(-1*(SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
// 	WHERE lot = a.lot and type_movements = 'egreso')) as residue
// from txeggs_movements a
// left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id 
// 	where b.scenario_id = $1 and a.fecha_movements between $2 and $3 and b.incubator_plant_id = $4 and 
// 	b.breed_id = $5 and type_movements = 'ingreso' and (a.description_adjustment is null or a.description_adjustment = 'Compra')`, [scenario_id, init_date, end_date, incubator_plant_id, breed_id]);
//     return conn.db.any(`select * ,
// 	(SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end FROM public.txincubator_lot
// 	WHERE eggs_movements_id = a.eggs_movements_id) +
// 	(-1*(SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
// 	WHERE lot = a.lot and type_movements = 'egreso')) as residue
// from txeggs_movements a
// left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id 
// 	where b.scenario_id = $1 and a.fecha_movements between $2 and $3 and b.incubator_plant_id = $4 and 
// 	b.breed_id = $5 and type_movements = 'ingreso' and (a.description_adjustment is null or a.description_adjustment = 'Compra')`, [scenario_id, init_date, end_date, incubator_plant_id, breed_id]);
    // return conn.db.any(`select * ,
	// 	(SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end as residue FROM public.txincubator_lot
	// 	WHERE eggs_movements_id = a.eggs_movements_id)
	// from txeggs_movements a
	// left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id 
	// where b.scenario_id = $1 and a.fecha_movements between $2 and $3 and b.incubator_plant_id = $4 and 
	// b.breed_id = $5 and type_movements = 'ingreso' and (a.description_adjustment is null or a.description_adjustment = 'Compra')`, [scenario_id, init_date, end_date, incubator_plant_id, breed_id]);

/*
	return conn.db.any(" SELECT a.incubator_plant_id, a.name , sum(b.eggs_executed) as total, "+
						" SUM(CASE WHEN (EXTRACT(DAY FROM(NOW() - init_date )) <=$2) THEN b.eggs_executed ELSE 0 END ) as aclimatized, "+
						" SUM(CASE WHEN (EXTRACT(DAY FROM(NOW() - init_date )) >$3 and EXTRACT(DAY FROM(NOW() - init_date )) <$4) THEN b.eggs_executed ELSE 0 END ) as suitable, "+
						" SUM(CASE WHEN (EXTRACT(DAY FROM(NOW() - init_date )) >=$5) THEN b.eggs_executed ELSE 0 END ) as expired "+
						" FROM  osincubatorplant a  "+
						" LEFT JOIN txeggs_storage b on a.incubator_plant_id = b.incubator_plant_id "+
						" WHERE partnership_id = $1 "+
						" and init_date <= NOW()  "+
						" And b.eggs_executed is not null "+
						" group by a.incubator_plant_id ",
						[partnership_id, rangeAclimatized, range1Suitable, range2Suitable, rangeExpired]);*/
};

exports.DBfindProjectIncubatorByParent = function(scenario_id, init_date, end_date, incubator_plant_id, breed_id, parentLot) {


    return conn.db.any(`select a.eggs_movements_id, a.fecha_movements, a.lot, a.type_movements, a.eggs_storage_id, a.description_adjustment, a.justification ,
						b.eggs_storage_id, b.incubator_plant_id, b.scenario_id, b.breed_id, b.init_date, b.end_date, b.lot, b.eggs, b.origin,  b.eggs_executed,
						b.synchronized, b.lot_sap,
						(-1*(SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
						WHERE aa.programmed_disable is not true and lot = a.lot and type_movements = 'egreso' and programmed_disable is not true)) as residue,
						((SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
						WHERE aa.programmed_disable is not true and lot = a.lot and type_movements = 'ingreso')) as quantity
						from txeggs_movements a
						left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id 
						where b.scenario_id = $1 and (case when $2 is not null and $3 is not null then a.fecha_movements between $2 and $3 else true end) and b.incubator_plant_id = $4 and 
						b.breed_id = $5 and SPLIT_PART(a.lot, '-', 1) = $6 and type_movements = 'ingreso' and a.justification is null and (a.description_adjustment is null or a.description_adjustment = 'Compra')
						order by a.fecha_movements`, [scenario_id, init_date, end_date, incubator_plant_id, breed_id, parentLot]);
};

exports.DBfindProjectIncubatorPlexusByParent = function(scenario_id, init_date, end_date, incubator_plant_id, plexus, parent) {

    console.log("llegpo al modelo");
    console.log(scenario_id);
    console.log(init_date);
    console.log(end_date);
    console.log(incubator_plant_id);
    console.log(plexus);

    return conn.db.any(`select *, a.lot,(-1*(SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
	WHERE aa.programmed_disable is not true and lot = a.lot and type_movements = 'egreso')) as residue
	from txeggs_movements a
	left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id
	where b.scenario_id = $1 and (case when $2 is not null and $3 is not null then a.fecha_movements between $2 and $3 else true end) and b.incubator_plant_id = $4 and 
	a.description_adjustment = $5 and type_movements = 'ingreso' and SPLIT_PART(a.lot, '-', 1) = $6 `, [scenario_id, init_date, end_date, incubator_plant_id, plexus, parent]);
};

exports.DBfindParentLots = function(breed_id, incubator_plant_id, scenario_id) {
	console.log("Heeeereeeee",breed_id, incubator_plant_id, scenario_id)
	return conn.db.any(`SELECT DISTINCT SPLIT_PART(em.lot, '-', 1) as lot, RIGHT(SPLIT_PART(em.lot, '-', 1), -1)::integer as ord from txeggs_movements em left join txeggs_storage es on em.eggs_storage_id = es.eggs_storage_id 
	WHERE es.incubator_plant_id = $2 and es.scenario_id = $3 and es.breed_id = $1  and (substring(em.lot, 1, 1) = 'H' OR substring(em.lot, 1, 1) = 'A') order by ord asc
	`,[breed_id, incubator_plant_id, scenario_id]);
	
};

exports.DBfindParentLotsPlexus = function(plexus) {

	return conn.db.any(`SELECT DISTINCT SPLIT_PART(lot, '-', 1) as lot, RIGHT(SPLIT_PART(lot, '-', 1), -1)::integer as ord from txeggs_movements
	WHERE description_adjustment= $1 and type_movements = 'ingreso' order by ord asc`,[plexus]);
	
};

exports.DBfindProjectIncubatorAll = function(scenario_id, init_date, end_date, incubator_plant_id, breed_id) {

    console.log("llegpo al modelo");
    console.log(scenario_id);
    console.log(init_date);
    console.log(end_date);
    console.log(incubator_plant_id);
    console.log(breed_id);

    return conn.db.any(`SELECT * ,
						(SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end as residue FROM public.txincubator_lot
		WHERE eggs_movements_id = a.eggs_movements_id), 
						w.name as name 
						FROM txeggs_movements a
						LEFT JOIN txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id 
						LEFT JOIN mdbreed w on w.breed_id = b.breed_id 
						WHERE b.scenario_id = $1 AND a.fecha_movements between $2 AND $3 AND b.incubator_plant_id = $4 
						AND type_movements = 'ingreso'`, [scenario_id, init_date, end_date, incubator_plant_id]);

};

exports.DBfindProjectIncubatorPlexus = function(scenario_id, init_date, end_date, incubator_plant_id, plexus) {

    console.log("llegpo al modelo");
    console.log(scenario_id);
    console.log(init_date);
    console.log(end_date);
    console.log(incubator_plant_id);
    console.log(plexus);

    return conn.db.any(`select *, a.lot,(-1*(SELECT case when sum(aa.quantity)> 0 then sum(aa.quantity) else 0 end FROM txeggs_movements aa
	WHERE aa.programmed_disable is not true and lot = a.lot and type_movements = 'egreso')) as residue
	from txeggs_movements a
	left join txeggs_storage b on a.eggs_storage_id = b.eggs_storage_id
	where b.scenario_id = $1 and CASE WHEN $2 IS NOT NULL AND $3 IS NOT NULL THEN a.fecha_movements between $2 and $3 ELSE END and b.incubator_plant_id = $4 and 
	a.description_adjustment = $5 and type_movements = 'ingreso' `, [scenario_id, init_date, end_date, incubator_plant_id, plexus]);
};


exports.DBgetMovementsByEntry= function(eggs_storage_id, type_movements, lot) {

    return conn.db.any(`   select eggs_movements_id, fecha_movements, lot, quantity, 
								type_movements, eggs_storage_id, description_adjustment 
								from public.txeggs_movements
								where eggs_storage_id= $1 and lot= $3 and description_adjustment is not null 
								and type_movements= $2 and programmed_disable is not true
								ORDER BY eggs_movements_id ASC `,
	[eggs_storage_id, type_movements, lot]);
	
// 	return conn.db.any(`   select eggs_movements_id, fecha_movements, lot, quantity, 
// 	type_movements, eggs_storage_id, description_adjustment 
// 	from public.txeggs_movements
// 	where eggs_storage_id= $1 and description_adjustment is not null 
// 	and type_movements= $2
// 	ORDER BY eggs_movements_id ASC `,
// [eggs_storage_id, type_movements]);

	   /*  return conn.db.any(`   select eggs_movements_id, use_date as fecha_movements,
								lot_breed as lot, execution_quantity as quantity, 
								eggs_storage_id, 'egreso' as type_movements
								from public.txprogrammed_eggs
								where eggs_storage_id= $1
								ORDER BY eggs_movements_id ASC `,
						[eggs_storage_id, type_movements]); */
};

exports.DBgetMovementsPlexusByEntry= function(lot, type_movements) {

    return conn.db.any(`   select eggs_movements_id, fecha_movements, lot, quantity, 
								type_movements, eggs_storage_id, description_adjustment 
								from public.txeggs_movements
								where lot = $1 and description_adjustment is not null 
								and type_movements= $2 and programmed_disable is not true
								ORDER BY eggs_movements_id ASC `,
    [lot, type_movements]);
};


exports.DBgetOutMovementsByEntryForDate= function(eggs_storage_id, type_movements, init_date, end_date){
    return conn.db.any(`   select eggs_movements_id, fecha_movements, lot, quantity, type_movements, eggs_storage_id
								from public.txeggs_movements
								where eggs_storage_id= $1
								and type_movements= $2
								and fecha_movements >= $3
								and fecha_movements <= $4
								and programmed_disable is not true
								ORDER BY fecha_movements ASC`,
    [eggs_storage_id, type_movements, init_date, end_date]);
},

exports.DBgetOutMovementsForDate= function(type_movements, init_date, end_date, scenario_id){

    return conn.db.any(`   select em.eggs_movements_id, em.fecha_movements, em.lot, em.quantity, 
								em.eggs_storage_id, em.type_movements, em.description_adjustment 
								from public.txeggs_movements em
								LEFT JOIN txeggs_storage es ON em.eggs_storage_id = es.eggs_storage_id
								where es.scenario_id = $4 and em.type_movements= $1
								and em.fecha_movements >= $2
								and em.fecha_movements <= $3
								and em.description_adjustment is not null
								and em.programmed_disable is not true
								ORDER BY em.fecha_movements ASC`,
    [type_movements, init_date, end_date, scenario_id]);
};


exports.DBgetOutMovementsForDateWithLot= function(type_movements, init_date, end_date, slot, scenario_id){

    return conn.db.any(`   select em.eggs_movements_id, em.fecha_movements, em.lot, em.quantity, 
							em.eggs_storage_id, em.type_movements, em.description_adjustment 
							from public.txeggs_movements em
							LEFT JOIN txeggs_storage es ON em.eggs_storage_id = es.eggs_storage_id
							where es.scenario_id = $5 and em.type_movements= $1
							and em.fecha_movements >= $2
							and em.fecha_movements <= $3
							and em.lot= $4
							and em.description_adjustment is not null
							and em.programmed_disable is not true
							ORDER BY em.fecha_movements ASC`,
    [type_movements, init_date, end_date, slot, scenario_id]);
};

exports.DBgetAllLots= function(incubator_plant_id, scenario_id){

    return conn.db.any(`   select   lot, count(*) as total
							from    txeggs_storage
							where   scenario_id = $2 and eggs_executed is not null
									and incubator_plant_id= $1
							group by lot
							order by lot`,
    [incubator_plant_id, scenario_id]);
};

exports.DBgetLots= function(incubator_plant_id, prefix, scenario_id){

    return conn.db.any(`select   em.lot, count(*) as total
						from    txeggs_storage em
						LEFT JOIN txeggs_storage es ON em.eggs_storage_id = es.eggs_storage_id
						where es.scenario_id = $3 and em.eggs_executed is not null
								and em.incubator_plant_id= $1 and LEFT(em.lot,1)=$2
						group by em.lot
						order by em.lot`,
    [incubator_plant_id, prefix, scenario_id]);
};
exports.DBgetLotsPlexus= function(incubator_plant_id, prefix, scenario_id){

    return conn.db.any(`select   em.lot, count(*) as total
						from    txeggs_movements em
						LEFT JOIN txeggs_storage es ON em.eggs_storage_id = es.eggs_storage_id
						where es.scenario_id = $3 and em.quantity is not null
								and LEFT(em.lot,1)=$2
						group by em.lot
						order by em.lot ASC`,
    [incubator_plant_id, prefix, scenario_id]);
};