const config = require("../../config");
const conn = require("../db");

exports.DBautomatedScheduling = function() {
    return conn.db.any(`select false as usado, null as date, b.name as plant, a.* 
                        from osincubator a
                        LEFT JOIN osincubatorplant b on b.incubator_plant_id = a.incubator_plant_id
                        where capacity = available and a.os_disable is not true and _order is not null
                        order by _order asc`);

};

// **** Inicio ConfTenica ****
/**
 * Filtra todas las máquinas que esten asociadas a la planta incubadora que recibe la función
 *
 * @param {Number} incubator_plant_id id de la Planta Incubadora
 * @returns {object} máquinas
 */
exports.DBfindIncubatorByPlant = function(incubator_plant_id) {
    return conn.db.any("SELECT * FROM public.osincubator "+
                       "WHERE incubator_plant_id=$1 "+
                       "order by name ASC", [incubator_plant_id]);
};

/**
 * agrega un registro 
 *
 * @param {Number} incubator_plant_id ID de la planta de Incubadora
 * @param {String} name Nombre de la incubadora 
 * @param {String} code Código de la incubadora 
 * @param {String} description Descripción de la incubadora 
 * @param {Number} capacity Capacidad de la incubadora 
 * @param {Number} sunday Marca los dias de trabajo de la incubadora 
 * @param {Number} monday Marca los dias de trabajo de la incubadora 
 * @param {Number} tuesday Marca los dias de trabajo de la incubadora 
 * @param {Number} wednesday Marca los dias de trabajo de la incubadora 
 * @param {Number} thursday Marca los dias de trabajo de la incubadora 
 * @param {Number} friday Marca los dias de trabajo de la incubadora 
 * @param {Number} saturday Marca los dias de trabajo de la incubadora 
 * @param {Number} available Indica si la incubadora está disponble
 * @returns {object} incubator_id Id del la máquina 
 */
exports.DBaddIncubator = function(incubator_plant_id,name, code, description, capacity,
    sunday, monday, tuesday, wednesday, thursday,
    friday, saturday, available, order) {

    return conn.db.one("INSERT INTO public.osincubator (incubator_plant_id, name, code, description, capacity, "+
                        "sunday, monday, tuesday, wednesday, thursday, "+
                        "friday, saturday, available, _order) "+
                        "VALUES ($1, $2 , $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING incubator_id", [
        incubator_plant_id,name, code, description, capacity,
        sunday, monday, tuesday, wednesday, thursday,
        friday, saturday, available, order]);
};

/**
 * Elimina el registro que ha seleccionado el usuario 
 *
 * @param {Number} incubator_id Id de la máquina
 * @returns
 */
exports.DBdeleteIncubator = function(incubator_id) {
    return conn.db.none("DELETE FROM public.osincubator WHERE incubator_id = $1",[incubator_id]);
};
/**
 * actualiza un registro 
 *
 * @param {Number} incubator_plant_id ID de la planta de Incubadora
 * @param {String} name Nombre de la incubadora 
 * @param {String} code Código de la incubadora 
 * @param {String} description Descripción de la incubadora 
 * @param {Number} capacity Capacidad de la incubadora 
 * @param {Number} sunday Marca los dias de trabajo de la incubadora 
 * @param {Number} monday Marca los dias de trabajo de la incubadora 
 * @param {Number} tuesday Marca los dias de trabajo de la incubadora 
 * @param {Number} wednesday Marca los dias de trabajo de la incubadora 
 * @param {Number} thursday Marca los dias de trabajo de la incubadora 
 * @param {Number} friday Marca los dias de trabajo de la incubadora 
 * @param {Number} saturday Marca los dias de trabajo de la incubadora 
 * @param {Number} available Indica si la incubadora está disponble
 * @returns
 */
exports.DBupdateIncubator = function(incubator_id, name, code, description, capacity,
    sunday, monday, tuesday, wednesday, thursday,
    friday, saturday,available, order) {
    return conn.db.none("UPDATE public.osincubator SET name = $1, code = $2 , description= $3, "+
                        "capacity= $4, sunday=$5 , monday=$6, tuesday=$7 , wednesday=$8 , thursday=$9, "+
                        "friday=$10 , saturday=$11, available = $13, _order = $14 "+
                        "WHERE incubator_id = $12", [name, code, description, capacity,
        sunday, monday, tuesday, wednesday, thursday,
        friday, saturday, incubator_id,available, order]);
};

/**
 *  Función para verificar si está siendo usada por otra entidad
 *
 * @param {*} incubator_id id del registro 
 * @returns {Object}
 */
exports.DBisBeingUsed = function (incubator_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.programmed_eggs_id IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.osincubator a
                    LEFT JOIN public.txprogrammed_eggs b on b.incubator_id = a.incubator_id
                    WHERE a.incubator_id=$1) ) as used`, [incubator_id]);
};
// **** fin ConfTenica ****

exports.DBfindIncubatorByPlantWithCapacity = function(incubator_plant_id) {
    return conn.db.any("SELECT * FROM public. "+
                       "WHERE incubator_plant_osincubatorid=$1 and available > 0"+
                       "order by name ASC", [incubator_plant_id]);
};

// exports.DBfindIncubatorByPlantAndDay = function(incubator_plant_id, day) {
//   console.log("recibido en el modelo")
//   console.log(incubator_plant_id)
//   console.log(day)
//     return conn.db.any("SELECT * FROM public.osincubator a "+
//                        "WHERE a.incubator_plant_id=$1 and a.$2 = true "+
//                        "order by name ASC", [incubator_plant_id, day]);
// };

exports.DBbulkAddIncubator = function(incubators){
    cs = conn.pgp.helpers.ColumnSet(["incubator_plant_id", "name", "code", "description", 
        "capacity", {prop: "capacity", name: "available"} ,"sunday", "monday", "tuesday", "wednesday", "thursday", "friday", 
        "saturday"], {table: "osincubator", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(incubators, cs));
};

exports.DBupdateIncubator2 = function(date) {
    return conn.db.none(`UPDATE public.osincubator a 
      SET available = capacity - i.quantity 
      FROM ( SELECT a.incubator_id as id, sum(a.eggs) as quantity 
                       FROM txprogrammed_eggs a 
                       WHERE ( a.use_date =$1 ) and a.programmed_disable is not true group by(a.incubator_id)) as i 
      WHERE i.id = a.incubator_id`, [date]);

};


exports.DBforceupdateIncubator = function() {
    return conn.db.none(`UPDATE public.osincubator a 
      SET available = capacity`);
};

exports.DBfindIncubatorByPlantAndDate = function(incubator_plant_id, date, day, qDays) {
    return conn.db.any(`SELECT DISTINCT inc.incubator_id, inc.incubator_plant_id, inc.name, inc.code, inc.description, inc.capacity, inc.sunday, 
                            inc.monday, inc.tuesday, inc.wednesday, inc.thursday, inc.friday, inc.saturday, inc.available, inc.os_disable
                        FROM osincubator inc
                        LEFT JOIN txprogrammed_eggs pe on inc.incubator_id = pe.incubator_id and pe.use_date between $2::date-22 and $2::date and pe.programmed_disable is not true
                        WHERE inc.incubator_plant_id= 1 and

                        (CASE WHEN pe.use_date+pe.diff_days between $2::date-$4 and $2::date
                                THEN (CASE WHEN pe.use_date + pe.diff_days = $2::date
                                            THEN true ELSE FALSE END) 
                                ELSE (CASE WHEN pe.use_date is null 
                                            THEN inc.code not in (SELECT ic.code FROM osincubator ic LEFT JOIN txprogrammed_eggs pg ON Ic.incubator_id = pg.incubator_id where pg.use_date+pg.diff_days=$2::date and pg.programmed_disable is not true) ELSE TRUE END) END
                        ) and inc.available >0 and inc.`+day+`= 1 
                        order by inc.name asc`
                        , [incubator_plant_id, date, day, qDays]);
//     return conn.db.any(`SELECT DISTINCT inc.incubator_id, inc.incubator_plant_id, inc.name, inc.code, inc.description, inc.capacity, inc.sunday, 
//     inc.monday, inc.tuesday, inc.wednesday, inc.thursday, inc.friday, inc.saturday, inc.available, inc.os_disable
//   FROM osincubator inc
//   LEFT JOIN txprogrammed_eggs pe on pe.incubator_id=inc.incubator_id  and pe.released is not true and pe.use_date+pe.diff_days-$2::DATE <=21 or pe.use_date is null 
//   WHERE inc.incubator_plant_id= $1  and 
//   ($2::DATE-pe.use_date+pe.diff_days=21 or pe.use_date+pe.diff_days <= $2::DATE- interval $4 or pe.use_date+pe.diff_days = $2::DATE or pe.use_date is null) 
//   and 
//   ( CASE WHEN inc.code in (SELECT DISTINCT v.code 
//         from osincubator v left join txprogrammed_eggs gg on gg.incubator_id=v.incubator_id AND gg.use_date+gg.diff_days= $2
//         where gg.use_date+gg.diff_days= $2) 
//   then inc.incubator_id in (SELECT DISTINCT vv.incubator_id 
//         from osincubator vv left join txprogrammed_eggs ggv on ggv.incubator_id=vv.incubator_id 
//         where ggv.use_date+ggv.diff_days= $2 and vv.code= inc.code) 
//   ELSE TRUE END)and inc.available > 0 order by inc.name asc`
//                         , [incubator_plant_id, date, day, qDays]);
  };



exports.DBupdateAvailableIncubator = function(incubator_id, available) {
    console.log("llego al update available");
    console.log(incubator_id);
    console.log(available);
    return conn.db.none("UPDATE public.osincubator SET available = available - $2 "+
                        "WHERE incubator_id = $1", [incubator_id, available]);
};

exports.DBfindIncubatorByPartnership = function(partnership_id,incubator_plant_id) {
    return conn.db.any("select b.name, capacity, sunday, monday, tuesday, wednesday, thursday, "+
                       "friday, saturday, b.incubator_id, b.available  "+
                       "FROM osincubatorplant a "+
                       "LEFT JOIN osincubator b on b.incubator_plant_id = a.incubator_plant_id "+
                       "where partnership_id = $1 and a.incubator_plant_id = $2 ", [partnership_id,incubator_plant_id]);
};

exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1"+
        "FROM public.osincubator ");
};