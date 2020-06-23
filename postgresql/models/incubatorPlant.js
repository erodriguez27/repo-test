const config = require("../../config");
const conn = require("../db");

//  **** Inicio ConfTecnica 
/**
 * @method DBfindIncPlantByPartnetship
 * @description Filtra las plantas incubadoras asociadas a la empresa que se ha seleccionado
 *
 * @param {Number} partnership_id Id de la Empresa
 * @returns
 */
exports.DBfindIncPlantByPartnetship = function(partnership_id) {
    return conn.db.any("SELECT * FROM public.osincubatorplant "+
                       "WHERE partnership_id=$1 "+
                       "order by name ASC", [partnership_id]);
};
/**
 * @method DBaddIncubatorPlant
 * @description Agrega una planta incubadora
 *
 * @param {String} name Nombre de la planta incubadora 
 * @param {String} code Código de la planta incubadora 
 * @param {String} description Descripción de la planta incubadora 
 * @param {Number} partnership_id ID de la empresa a la cual pertenece 
 * @param {Number} max_storage Número máximo de almacenamiento
 * @param {Number} min_storage Número mínimo de almacenamiento
 * @param {boolean} acc Indica si se usará el valor aclimatado para la disponibilidad del inventario en almacén de huevo fértil
 * @param {boolean} app Indica si se usará el valor adecuado para la disponibilidad del inventario en almacén de huevo fértil
 * @param {boolean} exp Indica si se usará el valor expirado para la disponibilidad del inventario en almacén de huevo férti 
 * @returns
 */
exports.DBaddIncubatorPlant = function(name, code, description, partnership_id, max_storage, min_storage, acc, app, exp) {

    return conn.db.one("INSERT INTO public.osincubatorplant (name, code, description, partnership_id,  max_storage, min_storage,acclimatized,suitable,expired) "+
                        "VALUES ($1, $2 , $3, $4, $5, $6, $7, $8, $9) RETURNING incubator_plant_id", [
        name, code, description, partnership_id, max_storage, min_storage, acc, app, exp]);
};
/**
 * @method DBdeleteIncubatorPlant
 * @description Elimina el registro 
 *
 * @param {Number} incubator_plant_id Id de la planta Incubadora
 * @returns
 */
exports.DBdeleteIncubatorPlant = function(incubator_plant_id) {
    return conn.db.none("DELETE FROM public.osincubatorplant WHERE incubator_plant_id = $1",[incubator_plant_id]);
};

/**
 * @method DBupdateIncubatorPlant
 * @description Actualiza los datos del registro seleccionado
 *
 * @param {Number} incubator_plant_id ID de la planta incubadora 
 * @param {String} name Nombre de la planta incubadora 
 * @param {String} code Código de la planta incubadora 
 * @param {String} description Descripción de la planta incubadora 
 * @param {Number} max_storage Número máximo de almacenamiento
 * @param {Number} min_storage Número mínimo de almacenamiento
 * @param {boolean} acc Indica si se usará el valor aclimatado para la disponibilidad del inventario en almacén de huevo fértil
 * @param {boolean} app Indica si se usará el valor adecuado para la disponibilidad del inventario en almacén de huevo fértil
 * @param {boolean} exp Indica si se usará el valor expirado para la disponibilidad del inventario en almacén de huevo férti 
 * @returns
 */
exports.DBupdateIncubatorPlant = function(incubator_plant_id, name, code, description, max_storage, min_storage, acc, app, exp) {
    return conn.db.none("UPDATE public.osincubatorplant SET name = $1, code = $2 , description= $3, "+
                        "max_storage = $4, min_storage = $5, acclimatized = $6, suitable = $7, expired = $8 "+
                        "WHERE incubator_plant_id = $9", [name, code, description, max_storage, min_storage, acc, app, exp, incubator_plant_id]);
};

/**
 *  Función para verificar si una raza está siendo usada por otra entidad
 *
 * @param {*} incubator_plant_id id del registro 
 * @returns {Object}
 */
exports.DBisBeingUsed = function (incubator_plant_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.incubator_id IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.osincubatorplant a
                    LEFT JOIN public.osincubator b on b.incubator_plant_id = a.incubator_plant_id
                    WHERE a.incubator_plant_id=$1)
                    OR (SELECT DISTINCT CASE WHEN b.slbroiler_id IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.osincubatorplant a
                    LEFT JOIN public.sltxbroiler b on b.incubator_plant_id = a.incubator_plant_id
                    WHERE a.incubator_plant_id=$1)
                    OR (SELECT DISTINCT CASE WHEN b.slincubator IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.osincubatorplant a
                    LEFT JOIN public.sltxincubator b on b.incubator_plant_id = a.incubator_plant_id
                    WHERE a.incubator_plant_id=$1) ) as used`, [incubator_plant_id]);
};

//  **** Fin ConfTecnica 


exports.DBbulkAddIncubatorPlant = function(incubatorPlants) {
    cs = conn.pgp.helpers.ColumnSet(["name", "code", "description", "partnership_id", 
        "max_storage", "min_storage"], {table: "osincubatorplant", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(incubatorPlants, cs));
};

exports.DBfindIncPlantById = function(incubator_plant_id) {

    return conn.db.any("SELECT * FROM public.osincubatorplant "+
                       "WHERE incubator_plant_id=$1 "+
                       "order by name ASC", [incubator_plant_id]);
};

exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1"+
        "FROM public.osincubatorplant ");
};

exports.DbKnowincubatorPlan_id = function(register) {
    let string = "SELECT code,incubator_plant_id FROM public.osincubatorplant WHERE code = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].incubator_plant_id +  "'" ;
        }else{
            string = string +" or " + "code = "+ "'" + register[index].incubator_plant_id + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};

exports.DbKnowincubatorPlan_id2 = function(registers) {
    let string = `  SELECT incp.code as incubator_plant_code, incp.incubator_plant_id, p.code as partnership_code, p.partnership_id
                    FROM osincubatorplant incp
                    JOIN ospartnership p ON incp.partnership_id = p.partnership_id
                    WHERE `;
    let index = 0;
    while (index < registers.length) {
        if (index === 0) {
            string += `(incp.code = '${registers[index].incubatorPlantCode}' AND p.code = '${registers[index].partnershipCode}')`;
        }
        else {
            string += `or (incp.code = '${registers[index].incubatorPlantCode}' AND p.code = '${registers[index].partnershipCode}')`;
        }
        index++;
    }
    return conn.db.any(string);
};

exports.DBOptiDisp = function(incubator_plant_id) {
    return conn.db.any("SELECT incubator_plant_id,name,acclimatized,suitable,expired " +
    " FROM public.osincubatorplant WHERE incubator_plant_id = $1 " ,[incubator_plant_id] );
};
