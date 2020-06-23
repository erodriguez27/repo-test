const config = require("../../config");
const conn = require("../db");

exports.DBfindAllHousingWay = function() {
    return conn.db.any("SELECT birds_group, TO_CHAR(date_housing, 'DD/MM/YYYY') as date_housing , group_number FROM public.txhousingway order by group_number ASC");
};

exports.DBfindGroupByPartnership = function(partnership_id) {

    return conn.db.any("SELECT birds_group , TO_CHAR(date_housing, 'DD/MM/YYYY') as date_housing, "+
                       "group_number "+
                       "FROM public.txhousingway "+
                       "WHERE partnership_id = $1 "+
                       "order by group_number ASC", [partnership_id]);
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
/*
exports.DBaddHousingWay = function(group) {
  console.log("group: ", group);
  group = JSON.parse(group);
  console.log("group JSON: ", group);
  return conn.db.none('INSERT INTO public.txhousingway (birds_group,date_housing,group_number, partnership_id ) VALUES $1',
      Inserts('${birds_group}, ${date_housing}, ${group_number}, ${partnership_id} ',group));

};*/

exports.DBaddHousingWay = function(quantity, date, stage_id, partnership_id, scenario_id, breed_id, predecessor_id) {

    return conn.db.one("INSERT INTO public.txhousingway (projected_quantity, projected_date, stage_id, "+
                     "partnership_id, scenario_id, breed_id, predecessor_id) "+
                     "VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING housing_way_id ",
    [quantity, date, stage_id, partnership_id, scenario_id, breed_id, predecessor_id]);

};


exports.DBdeleteHousingWay = function(partnership_id) {

    return conn.db.none("DELETE FROM public.txhousingway WHERE partnership_id = $1", [partnership_id]);

};

// exports.DBdeleteHousingWayById = function(housing_way_id) {

//     return conn.db.none("DELETE FROM public.txhousingway WHERE housing_way_id_id = $1", [housing_way_id]);

// };
exports.DBisProgrammedHousingway = function(housing_id) {

    return conn.db.any(`SELECT DISTINCT CASE WHEN b.housing_way_id IS NOT NULL THEN true ELSE false END as programmed, b.programmed_disable
                        FROM public.txhousingway a 
                        LEFT JOIN txhousingway_detail b on a.housing_way_id = b.housing_way_id
                        WHERE a.housing_way_id = $1`, [housing_id]);

};

exports.DBHousingWByPartnership = function(partnership_id) {
    return conn.db.any("SELECT * FROM public.txhousingway WHERE partnership_id=$1 ", [partnership_id]);
};


exports.DBfindHousingByStage = function(stage_id, partnership_id, scenario_id) {

    // return conn.db.any("SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, "+
    //                    "(SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end as residue FROM public.txhousingway_lot WHERE housingway_id = a.housing_way_id),(SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) "+
    //                    "FROM public.txhousingway a "+
    //                    "LEFT JOIN mdbreed b on a.breed_id = b.breed_id "+
    //                    "WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3 order by pd, housing_way_id ASC  ", [partnership_id, stage_id, scenario_id]);
    return conn.db.any(`SELECT a.housing_way_id, a.projected_quantity, TO_CHAR(a.projected_date, 'DD/MM/YYYY') as projected_date, a.projected_date as pd, a.stage_id, 
    (CASE WHEN a.evictionprojected is null THEN false ELSE true END) AS evictionprojected,

    a.partnership_id, a.scenario_id, b.name as breed_name,
    
    (SELECT case when sum(lo.quantity)> 0 then sum(lo.quantity) else 0 end as residue 
      FROM public.txhousingway_lot lo
      left join txhousingway_detail hw on lo.production_id = hw.housingway_detail_id
      WHERE lo.housingway_id = a.housing_way_id and hw.programmed_disable is null or false),

    (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) 
    
FROM public.txhousingway a
LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
WHERE partnership_id=$1  and stage_id=$2 and scenario_id=$3 and projected_disable IS NOT TRUE and 
  (
    CASE WHEN ($2 = 5) 
    THEN true
    ELSE
      (a.evictionprojected is null or (a.evictionprojected is true and a.housing_way_id IN 
          (
            select housingway_id from txhousingway_lot where production_id IN
            (
              select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
            )
          )))
    END) 
order by pd, housing_way_id ASC`, [partnership_id, stage_id, scenario_id]);




};

exports.DBfindHousingByFilters = function(stage_id, partnership_id, scenario_id, lot) {

    return conn.db.any(`SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, 
                        (CASE WHEN a.evictionprojected is null THEN false ELSE true END) AS evictionprojected,                    
                        (SELECT case when sum(quantity)> 0  
            then sum(quantity) else 0 end as residue FROM public.txhousingway_lot lo
            left join txhousingway_detail hw on production_id = hw.housingway_detail_id
            WHERE housingway_id = a.housing_way_id and hw.programmed_disable is null or false),
                        (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) 
                        FROM public.txhousingway a 
                        LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
                        WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3
                        and housing_way_id IN 
                        (select housingway_id 
                          from txhousingway_lot
                          where production_id = 
                          (
                            select housingway_detail_id
                            from txhousingway_detail
                            where lot = $4 and programmed_disable is null or false
                          )
                        )
                        order by pd, housing_way_id ASC`, [partnership_id, stage_id, scenario_id, lot]);
};

exports.DBfindHousingByProgrammed = function(stage_id, partnership_id, scenario_id) {

    return conn.db.any(`SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, 
                          (CASE WHEN a.evictionprojected is null THEN false ELSE true END) AS evictionprojected, 

                          (SELECT case when sum(quantity)> 0 then sum(quantity) else 0 end as residue 
                          FROM public.txhousingway_lot lo
                          left join txhousingway_detail hw on production_id = hw.housingway_detail_id
                          WHERE housingway_id = a.housing_way_id and hw.programmed_disable is null or false),
                        
                          (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id)

                        FROM public.txhousingway a 
                        LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
                        WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3 and

                        (
                          CASE WHEN $2 = 5
                          THEN (housing_way_id IN 
                            (
                              select housingway_id from txhousingway_lot where production_id IN 
                              (
                                select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
                              )
                            ))
                          ELSE 
                            ((a.evictionprojected is null or a.evictionprojected is true) and housing_way_id IN 
                                (
                                  select housingway_id from txhousingway_lot where production_id IN 
                                  (
                                    select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
                                  )
                                ))
                          END)
                        order by pd, housing_way_id ASC`, [partnership_id, stage_id, scenario_id]);

                        //lo que estaba anteriormente 31/10
                        // housing_way_id IN 
                        // (
                        //   select housingway_id from txhousingway_lot where production_id IN 
                        //   (
                        //     select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
                        //   )
                        // )
                        // order by pd, housing_way_id ASC




//     return conn.db.any(`SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, 
//     (SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txhousingway_detail WHERE housing_way_id = a.housing_way_id AND disable IS NULL OR FALSE) as residue, (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) 
//     FROM public.txhousingway a 
//     LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
//     WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3 and
// (SELECT DISTINCT CASE WHEN b.housing_way_id IS NOT NULL THEN true ELSE false END as programmed
//      FROM public.txhousingway aw 
//      LEFT JOIN txhousingway_detail b on aw.housing_way_id = b.housing_way_id
//      WHERE aw.housing_way_id = a.housing_way_id and b.disable is null or false) is true`, [partnership_id, stage_id, scenario_id]);
};
// 
exports.DBfindHousingByNotProgrammed = function(stage_id, partnership_id, scenario_id) {

    return conn.db.any(`SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, 
                        (CASE WHEN a.evictionprojected is null THEN false ELSE true END) AS evictionprojected,
                        (SELECT case when sum(quantity)> 0  
                          then sum(quantity) else 0 end as residue FROM public.txhousingway_lot lo
                          left join txhousingway_detail hw on production_id = hw.housingway_detail_id
                          WHERE housingway_id = a.housing_way_id and hw.programmed_disable is null or false),
                        (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) 
                        FROM public.txhousingway a 
                        LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
                        WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3 and 
                        
                        (CASE WHEN $2 = 5
                          THEN
                            (housing_way_id NOT IN 
                              (
                                select housingway_id from txhousingway_lot where production_id IN
                                (
                                  select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
                                )
                            ))
                          ELSE
                            (a.evictionprojected is null and housing_way_id NOT IN 
                            (
                              select housingway_id from txhousingway_lot where production_id IN
                              (
                                select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
                              )
                            ))
                          END)
                          order by pd, housing_way_id ASC`, [partnership_id, stage_id, scenario_id]);

                          //lo que estaba anteriormente 31/10
                          // housing_way_id NOT IN 
                          // (
                          //   select housingway_id from txhousingway_lot where production_id IN
                          //   (
                          //     select housingway_detail_id from txhousingway_detail where programmed_disable is null or false
                          //   )
                          // )
                          // order by pd, housing_way_id ASC


//     return conn.db.any(`SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, 
//     (SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txhousingway_detail WHERE housing_way_id = a.housing_way_id AND disable IS NULL OR FALSE) as residue, (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) 
//     FROM public.txhousingway a 
//     LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
//     WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3 and
// (SELECT DISTINCT CASE WHEN b.housing_way_id IS NOT NULL THEN true ELSE false END as programmed
//      FROM public.txhousingway aw 
//      LEFT JOIN txhousingway_detail b on aw.housing_way_id = b.housing_way_id
//      WHERE aw.housing_way_id = a.housing_way_id and b.disable is null or false) is not true`, [partnership_id, stage_id, scenario_id]);
};
exports.DBfindHousingByLot = function(stage_id, partnership_id, scenario_id, lot) {

    return conn.db.any(`SELECT a.housing_way_id, projected_quantity, TO_CHAR(projected_date, 'DD/MM/YYYY') as projected_date, projected_date as pd, stage_id, partnership_id, scenario_id, b.name as breed_name, 
    (SELECT case when sum(scheduled_quantity)> 0 then sum(scheduled_quantity) else 0 end as residue FROM public.txhousingway_detail WHERE housing_way_id = a.housing_way_id AND programmed_disable IS NULL OR FALSE) as residue, (SELECT lot FROM public.txhousingway_detail WHERE a.predecessor_id = housingway_detail_id) 
    FROM public.txhousingway a 
    LEFT JOIN mdbreed b on a.breed_id = b.breed_id 
    WHERE partnership_id=$1  and stage_id=$2 and scenario_id= $3 and
(SELECT DISTINCT CASE WHEN b.housing_way_id IS NOT NULL THEN true ELSE false END as programmed
     FROM public.txhousingway aw 
     LEFT JOIN txhousingway_detail b on aw.housing_way_id = b.housing_way_id
     WHERE aw.housing_way_id = a.housing_way_id and b.programmed_disable is null or false) is true and (SELECT bw.housing_way_id from txhousingway aw 
	left join txhousingway_detail bw on bw.housing_way_id = aw.housing_way_id 
	where bw.lot = $4 ) = a.housing_way_id `, [partnership_id, stage_id, scenario_id, lot]);

};




exports.DBfindBreedByHousingWay = function(housing_way_id) {

    return conn.db.any("SELECT breed_id, a.scenario_id, partnership_id "+
                       "FROM public.txhousingway a "+
                       "LEFT JOIN public.mdscenario b on a.scenario_id= b.scenario_id "+
                       "WHERE housing_way_id=$1 ", [housing_way_id]);
};


exports.DBfindCalendarByHousingWay = function(housing_way_id, stage_id) {

    return conn.db.any("SELECT breed_id, a.scenario_id, partnership_id "+
                       "FROM public.txhousingway a "+
                       "LEFT JOIN public.mdscenario b on a.scenario_id= b.scenario_id "+
                       "LEFT JOIN public.mdprocess c on a.breed_id = c.breed_id "+
                       "WHERE housing_way_id=$1 and stage_id ", [housing_way_id]);
};

exports.DBfindHousinWayByPredecessor = function(predecessor_id) {

    return conn.db.any("SELECT housing_way_id "+
                       "FROM public.txhousingway a "+
                       "WHERE predecessor_id = $1 ", [predecessor_id]);
};

exports.DBdeleteHousingWayById = function(housing_way_id) {

    return conn.db.none("DELETE FROM public.txhousingway WHERE housing_way_id = $1 ", [housing_way_id]);

};

exports.DBupdateDisableHousingWayById = function(housing_way_id) {

    return conn.db.none("update public.txhousingway set projected_disable = true WHERE housing_way_id = $1 ", [housing_way_id]);

};
