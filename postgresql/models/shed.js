const conn = require("../db");

exports.DBautomatedScheduling = function(type, date, partnership_id) {
    console.log("el modelo ", type, date, partnership_id)
    return conn.db.any(`select a.shed_id, b._order as orderFarm, b.name, a.shed_id, a.code as shed, 
                        ROUND(a.stall_height * a.stall_width * capacity_max) as maximo, 
                        ROUND(a.stall_height * a.stall_width * capacity_min) as minimo, TO_CHAR(a.avaliable_date, 'YYYY-MM-DD') as avaliable_date , 
                        a._order as orderShed, a.rotation_days
                        from osshed a
                        LEFT JOIN osfarm b on a.farm_id = b.farm_id 
                        where b.farm_type_id = $1 and a.avaliable_date <= $2 and a.statusshed_id = 1 
                        and b.partnership_id = $3 and a.os_disable is not true 
                        and a._order is not null and b._order is not null and a.avaliable_date is not null
                        order by b._order asc, a._order asc`, [type, date, partnership_id]);
};
//  **** Inicio ConfTecnica ****

/**
 * @method DBcheckUpdateStatusShed
 * @description Actualiza los galpones con estatus 3 y que la fecha de habilitado sea menor a la actual
 *
 * @returns {Object}
 */
exports.DBcheckUpdateStatusShed = function () {
    return conn.db.any(`update public.osshed
                        set avaliable_date= null, statusshed_id= 1
                        where statusshed_id= 3
                        and avaliable_date <= current_date`);
};

/**
 * @method DBfindShedByCenter3
 * @description Consulta los galpones que esta relacionado con el Núcleo seleccionado
 *
 * @param {Number} center_id Id del Núcleo
 * @returns {object}
 */
exports.DBfindShedByCenter3 = function (center_id) {
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
    (capacity_min) as capmin, 
    (capacity_max) as capmax,a.stall_height, a.stall_width, a.environment_id, rotation_days, 
    statusshed_id, avaliable_date,a._order, false As availableOrder, os_disable, breed_id, rehousing      
    FROM public.osshed a 
    WHERE center_id = $1 order by a._order ASC`, [center_id]);
};

/**
 * @method DBaddShed
 * @description Agrega un registro a la base de datos
 *
 * @param {Number} partnership_id ID de la empresa a la cual pertenece
 * @param {Number} farm_id ID de la granja a la cual pertenece 
 * @param {Number} center_id ID del núcleo al cual pertenece
 * @param {String} code Código del galpón 
 * @param {Number} status_id  ID del estado actual del galpón 
 * @param {Number} stall_height Indica el ancho del galpón 
 * @param {Number} stall_width Indica el alto del galpón 
 * @param {Number} capacity_min Capacidad mínima 
 * @param {Number} capacity_max Capacidad máxima 
 * @param {Number} rotation_days Días de rotación 
 * @param {(Boolean|null)} os_disable Indica si el galpón está activo
 * @param {(Boolean|null)} rehousing Indica si el galpón se puede realojar
 * @param {Number} order Orden a Alojamiento
 * @returns {Object} id Galpon
 */
exports.DBaddShed = function (partnership_id, farm_id, center_id, code, status_id, stall_height, stall_width, capacity_min, capacity_max, rotation_days, os_disable, rehousing, order, available_date) {
    return conn.db.one(`INSERT INTO public.osshed (partnership_id, farm_id, center_id, 
                        code, statusshed_id, stall_height, stall_width, capacity_min, capacity_max, rotation_days, os_disable, rehousing, _order, avaliable_date) 
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING shed_id`, [partnership_id,
        farm_id, center_id, code, status_id, stall_height, stall_width, capacity_min,
        capacity_max, rotation_days, os_disable, rehousing, order, available_date 
    ]);
};

/**
 * @method DBupdateShed
 * @description Actualiza un registro 
 *
 * @param {Number} shed_id id de Galpon
 * @param {String} code Código del galpón 
 * @param {Number} status_id  ID del estado actual del galpón 
 * @param {Number} stall_height Indica el ancho del galpón 
 * @param {Number} stall_width Indica el alto del galpón 
 * @param {Number} capacity_min Capacidad mínima 
 * @param {Number} capacity_max Capacidad máxima 
 * @param {Number} rotation_days Días de rotación 
 * @param {(Boolean|null)} os_disable Indica si el galpón está activo
 * @param {(Boolean|null)} rehousing Indica si el galpón se puede realojar
 * @param {Number} order Orden a Alojamiento
 * @returns
 */
exports.DBupdateShed = function (shed_id, code, status_id, stall_height, stall_width, capacity_min, capacity_max, rotation_days, os_disable, rehousing, order) {
    return conn.db.none(`UPDATE public.osshed SET code = $1, statusshed_id = $2, stall_height = $3, stall_width = $4, 
                            capacity_max = $5, capacity_min = $6, rotation_days = $7,
                            os_disable = $9, rehousing=$10, _order = $11
                            WHERE shed_id = $8`, [code,
        status_id, stall_height, stall_width, capacity_max, capacity_min, rotation_days, shed_id, os_disable, rehousing, order
    ]);
};
/**
 * @method DBdeleteShed
 * @description Elimina el galpón seleccionado por el usuario 
 *
 * @param {Number} shed_id Id del Galpón
 * @returns
 */
exports.DBdeleteShed = function (shed_id) {
    return conn.db.none("DELETE FROM public.osshed WHERE shed_id = $1", [shed_id]);
};

/**
 * @method DBisBeingUsed
 * @description Consulta para saber si el galpón esta siendo usado, antes de ser eliminado. 
 *
 * @param {Number} shed_id id del Galpón
 * @returns
 */
exports.DBisBeingUsed = function (shed_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.housingway_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.osshed a
                            LEFT JOIN txhousingway_detail b on b.shed_id = a.shed_id or b.executionshed_id = a.shed_id
                            WHERE a.shed_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broiler_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.osshed a
                            LEFT JOIN txbroiler_detail b on b.shed_id = a.shed_id or b.executionshed_id = a.shed_id
                        WHERE a.shed_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broilereviction_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.osshed a
                            LEFT JOIN txbroilereviction_detail b on b.shed_id = a.shed_id 
                        WHERE a.shed_id=$1)) as used `, [shed_id]);
};

//  **** Fin ConfTecnica ****


exports.DBfindAllShed = function() {
    return conn.db.any("SELECT * FROM public.osshed order by code ASC");
};

exports.DBbulkAddShed = function(sheds){
    cs = conn.pgp.helpers.ColumnSet(["partnership_id", "farm_id", "center_id", 
        "code", "statusshed_id", "type_id", "building_date",
        "stall_width", "stall_height", "capacity_min","capacity_max", "environment_id", 
        "rotation_days", "nests_quantity", "cages_quantity",
        "birds_quantity", "capacity_theoretical"], {table: "osshed", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(sheds, cs));
};


exports.DBfindShedByCenter = function(center_id) {
    console.log("I'm slim shady, yes i'm the real shady!");
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
    (a.stall_height * a.stall_width * capacity_min) as capmin, 
    (a.stall_height * a.stall_width * capacity_max) as capmax,a.stall_height, a.stall_width, a.environment_id, rotation_days, 
    statusshed_id, avaliable_date,a.order, false As availableOrder, os_disable, breed_id     
    FROM public.osshed a 
    WHERE center_id = $1 order by a.order ASC` , [center_id]);
};
exports.DBfindShedByCenter2 = function(center_id) {
    console.log("I'm slim shady, yes i'm the real shady!");
    console.log(center_id);
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax,a.stall_height, a.stall_width, a.environment_id, rotation_days, 
                        statusshed_id, avaliable_date,a._order, false As availableOrder, os_disable, breed_id, rehousing      
                        FROM public.osshed a 
                        WHERE center_id = $1 and a.os_disable is not true order by a._order ASC` , [center_id]);
};


exports.DBupdateRehousingShed = function(shed_id, rehousing) {

    return conn.db.none(`UPDATE public.osshed SET rehousing = $2
                        WHERE shed_id = $1`, [ shed_id,rehousing]);
};

exports.DBupdateRotationDays = function(shed_id, rotation_days, capacity_theoretical) {
//   console.log(shed_id, rotation_days, capacity_theoretical);
    return conn.db.none("UPDATE public.osshed SET rotation_days = $1, capacity_theoretical = $2 "+
                        "WHERE shed_id = $3", [rotation_days, capacity_theoretical, shed_id]);
};

//Buscar una granja especifica
exports.DBfindShedsByFarm = function(farm_id) {
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax, rotation_days, 
                        statusshed_id, avaliable_date,a._order, a.os_disable, 
                        CASE WHEN a._order is not null THEN false ELSE true END As availableOrder    
                        FROM public.osshed a 
                        WHERE a.farm_id = $1 order by a._order ASC`, [farm_id]);
};
exports.DBfindShedsByFarm2 = function(farm_id) {
    // console.log("- ", farm_id);
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax, rotation_days, 
                        statusshed_id, avaliable_date,a.order, a.os_disable, 
                        CASE WHEN a.order is not null THEN false ELSE true END As availableOrder    
                        FROM public.osshed a 
                        WHERE a.farm_id = $1 and a.os_disable is not true order by a.order ASC`, [farm_id]);
};

//Buscar todas las granjas y determinar las capacidades
exports.DBfindShedsByFarms = function(farms) {
//   console.log("Sin formato: ", farms);
    farms= JSON.parse(farms);
    // console.log("- ", farms);
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax, rotation_days, a.os_disable  
                        FROM public.osshed a 
                        WHERE a.farm_id in ($1:csv) order by farm_id, capmax DESC`, [farms]);
};
exports.DBfindShedsByFarms2 = function(farms) {
//   console.log("Sin formato: ", farms);
    farms= JSON.parse(farms);
    // console.log("- ", farms);
    return conn.db.any(`SELECT a.shed_id, a.code, partnership_id, farm_id, 
                        (a.stall_height * a.stall_width * capacity_min) as capmin, 
                        (a.stall_height * a.stall_width * capacity_max) as capmax, rotation_days, a.os_disable  
                        FROM public.osshed a 
                        WHERE a.farm_id in ($1:csv) and a.os_disable is not true order by farm_id, capmax DESC`, [farms]);
};

exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1"+
        "FROM public.osshed ");
};

exports.DBupdateStatusShed = function(shed_id, status) {
    console.log("status: ", status, shed_id);
    return conn.db.any("UPDATE public.osshed SET statusshed_id = $1 "+
                        "WHERE shed_id = $2 "+
                        " RETURNING shed_id, rotation_days, current_date as act_date ", [status, shed_id]);
};

exports.DBupdateAvaliableDateShed = function(shed_id, adate= null) {
    return conn.db.any( " UPDATE public.osshed SET avaliable_date =$1 "+
                            " WHERE shed_id = $2 "+
                            " RETURNING shed_id, avaliable_date, rotation_days ", [adate, shed_id]);
};


exports.DBcheckUpdateStatusShedForReprod = function(farm_id) {
    return conn.db.any(`update public.osshed
                        set avaliable_date= null, statusshed_id= 1
                        where statusshed_id= 2 and farm_id = $1 
                        and avaliable_date <= current_date`, [farm_id]);
};
exports.DBcheckUpdateStatusShedForReprodByCenter = function(center_id) {
    return conn.db.any(`update public.osshed
                        set avaliable_date= null, statusshed_id= 1
                        where statusshed_id= 2 and center_id = $1 
                        and avaliable_date <= current_date`, [center_id]);
};



exports.DBfindShedById = function(id) {
    return conn.db.any("SELECT * FROM public.osshed WHERE shed_id = $1 ",[id]);
};

exports.DBforceFreeShedById = function(id) {
    return conn.db.any("update osshed set statusshed_id = 1, avaliable_date= null"+
                        " WHERE shed_id = $1 ",[id]);
};
exports.DBupdateShedOrder = function(records) {
    return conn.db.none(conn.pgp.helpers.update(records, ["?shed_id", {name: "order",cast: "integer"}], "osshed") + " WHERE v.shed_id = t.shed_id");
};

// exports.DBcheckFreeShed= function(){
//     return conn.db.any(`
//         update public.osshed as a
//         SET statusshed_id= 3
//         FROM (
//                 select t.shed_id
//                 from public.txbroilereviction_detail t
//                 where t.shed_id not in (
//                     select a.shed_id
//                     from public.txbroilereviction_detail a
//                     where a.execution_quantity = 0 or a.execution_quantity= null
//                     group by a.shed_id
//                 )
//                 group by t.shed_id
//             ) as t
//         WHERE a.shed_id = t.shed_id
//         Returning a.shed_id
//     `);
// }
