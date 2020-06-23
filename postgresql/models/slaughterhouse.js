const config = require("../../config");
const conn = require("../db");

/**
 * Lista todas las plantas de beneficio
 *
 * @returns
 */
exports.DBfindAllslaughterhouse = function() {
    return conn.db.any("SELECT * FROM public.osslaughterhouse order by name ASC");
};

/**
 * agrega una planta de beneficio
 *
 * @param {String} name Nombre de la planta de beneficio 
 * @param {String} description Descripción de la planta de beneficio 
 * @param {String} address Dirección de la planta de beneficio 
 * @param {String} code Código de la planta de beneficio 
 * @param {Number} capacity Capacidad de la planta de beneficio
 * @returns
 */
exports.DBaddslaughterhouse = function(name, description, address, code, capacity) {
    return conn.db.one("INSERT INTO public.osslaughterhouse (name, description, address, code, capacity) VALUES ($1, $2, $3, $4, $5) RETURNING slaughterhouse_id",
        [name, description, address, code, capacity]);
};

/**
 * actualiza una planta de beneficio
 *
 * @param {String} name Nombre de la planta de beneficio 
 * @param {String} description Descripción de la planta de beneficio 
 * @param {String} address Dirección de la planta de beneficio 
 * @param {Number} slaughterhouse_id ID de la planta de beneficio 
 * @param {String} code Código de la planta de beneficio 
 * @param {Number} capacity Capacidad de la planta de beneficio
 * @returns
 */
exports.DBupdateslaughterhouse = function(name, description, address, slaughterhouse_id, code, capacity) {
    return conn.db.none("UPDATE public.osslaughterhouse SET name = $1, description = $2, address = $3, code = $4, capacity = $6 "+
                        "WHERE slaughterhouse_id = $5", [name, description, address, code, slaughterhouse_id, capacity]);
};

/**
 * Elimina un registro
 *
 * @param {Number} slaughterhouse_id Id de la Planta de Beneficio
 * @returns
 */
exports.DBdeleteslaughterhouse = function(slaughterhouse_id) {
    return conn.db.none("DELETE FROM public.osslaughterhouse WHERE slaughterhouse_id = $1",[slaughterhouse_id]);
};