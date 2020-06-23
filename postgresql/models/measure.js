const conn = require("../db");

// **** Inicio ConfTenica ****
/**
 * Busca en la tabla msmeasure todos los registros ordenado  por el nombre de forma ascendente
 *
 * @returns {Object} unidades de medida
 */
exports.DBfindAllMeasure = function () {
    return conn.db.any("SELECT * FROM public.mdmeasure order by name ASC");
};
/**
 * función para agregar una unidad de medida 
 *
 * @param {String} name nombre de la Unidad de medida
 * @param {String} abbreviation Abreviatura
 * @param {Number} originvalue valor Entero
 * @param {Number} valuekg equivalente del valor en Kg
 * @param {Boolean} is_unit boolean para decir que es unidad 1 a 1 (valor, equivalencia)
 * @returns {Object} devuelve el id del registro creado 
 */
exports.DBaddMeasure = function (name, abbreviation, originvalue, valuekg, is_unit) {
    return conn.db.one("INSERT INTO public.mdmeasure (name, abbreviation, originvalue, valuekg, is_unit ) VALUES ($1, $2, $3, $4, $5) RETURNING measure_id", [name.trim(), abbreviation.trim(), originvalue, valuekg, is_unit]);
};

/**
 * función para actualizar los registros 
 *
 * @param {String} name nombre de la Unidad de medida
 * @param {String} abbreviation Abreviatura
 * @param {Nimber} originvalue valor Entero
 * @param {Number} valuekg equivalente del valor en Kg
 * @param {Boolean} is_unit boolean para decir que es unidad 1 a 1 (valor, equivalencia)
 * @returns {Object} devuelve statusCode y data null
 */
exports.DBupdateMeasure = function (name, abbreviation, originvalue, valuekg, measure_id, is_unit) {
    return conn.db.none("UPDATE public.mdmeasure SET name = $1, abbreviation = $2, originvalue = $3, valuekg= $4, is_unit= $6 " +
        "WHERE measure_id = $5", [name.trim(), abbreviation.trim(), originvalue, valuekg, measure_id, is_unit]);
};

/**
 * función para eliminar un registro 
 *
 * @param {*} measure_id id del registro
 * @returns statusCode: , mgs:
 */
exports.DBdeleteMeasure = function (measure_id) {
    return conn.db.none("DELETE FROM public.mdmeasure WHERE measure_id = $1", [measure_id]);
};

/**
 * función para comparar el nombre con el valor de entrada que sea único. ILIKE condiciona mayúsculas y minúsculas
 *
 * @param {String} name valor de entrada
 * @param {String} excep excepcion
 * @returns {Object} devuelve el registro en caso de existir la coincidencia
 */
exports.DBchechNameMeasure = function (name, excep) {
    return conn.db.manyOrNone("SELECT name, abbreviation FROM public.mdmeasure " +
        " WHERE mdmeasure.name ILIKE $1 and  mdmeasure.name <> $2 limit 1", [name.trim(), excep.trim()]);
};

/**
 * función para comparar el nombre con el valor de entrada que sea único. ILIKE condiciona mayúsculas y minúsculas
 *
 * @param {String} name valor de entrada
 * @param {String} excep excepcion
 * @returns {Object} devuelve el registro en caso de existir la coincidencia
 */
exports.DBchechAbrevMeasure = function (name, excep) {
    return conn.db.manyOrNone("SELECT name, abbreviation FROM public.mdmeasure " +
        " WHERE mdmeasure.abbreviation ILIKE $1 and  mdmeasure.abbreviation <> $2 limit 1", [name.trim(), excep.trim()]);
};
// **** Fin ConfTenica ****

exports.DBbulkAddMeasure = function (measures) {
    let cs = conn.pgp.helpers.ColumnSet(["name", "abbreviation", "originvalue", "valuekg", "is_unit"], {
        table: "mdmeasure",
        schema: "public"
    });
    return conn.db.none(conn.pgp.helpers.insert(measures, cs));
};

exports.DbKnowmeasure_id = function (register) {
    let string = "SELECT name,measure_id FROM public.mdmeasure WHERE name = ";
    var index = 0;
    while (index < register.length) {
        if (index == 0) {
            string = string + "'" + register[index].measure_id + "'";
        } else {
            string = string + " or " + "name = " + "'" + register[index].measure_id + "'";
        }
        index++;
    }
    return conn.db.any(string);
};