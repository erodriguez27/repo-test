const conn = require("../db");

// **** Inicio ConfTecnica ****

/**
 * Busca en la tabla mdparameter todos los registros combinando con las tablas mdprocess y mdmeasure
 *
 * @returns {Object} parametros
 */
exports.DBfindParameter = function () {
    return conn.db.any("SELECT a.parameter_id, a.description, a.type, a.measure_id, c.name as measure, a.name, b.process_id, " +
        "b.name as name_process , c.is_unit " +
        "FROM mdparameter a " +
        "LEFT JOIN mdprocess b on a.process_id = b.process_id " +
        "LEFT JOIN mdmeasure c on a.measure_id = c.measure_id ");
};

/**
 * función para agregar un parámetro
 *
 * @param {Object} parameter
 * @returns {Object}
 */
exports.DBaddParameter = function (parameter) {
    return conn.db.one("INSERT INTO public.mdparameter (description, type, measure_id, process_id, name ) VALUES ($1, $2, $3, $4, $5) RETURNING parameter_id",
        [parameter.description, 'Salida', parameter.measure_id, parameter.process_id, parameter.name]);
};

/**
 * Actualizar un registro seleccionado por el usuario. 
 * 
 * @param {Object} parameter
 * @returns {Object}
 */
exports.DBupdateParameter = function (parameter) {
    return conn.db.none("UPDATE public.mdparameter SET description = $1, type = $2, measure_id = $3, process_id = $4, name = $5 WHERE parameter_id = $6",
        [parameter.description, parameter.type, parameter.measure_id, parameter.process_id, parameter.name, parameter.parameter_id]);
};

/**
 * función para eliminar un registro
 *
 * @param {Number} parameter_id id del registro 
 * @returns {Object}
 */
exports.DBdeleteParameter = function (parameter_id) {
    //   console.log(parameter_id);
    return conn.db.none("DELETE FROM public.mdparameter WHERE parameter_id = $1", [parameter_id]);
};

/**
 * función para eliminar un registro de la tabla txscenarioparameterday, esta funcion es llamada desde controlador de Parameter en la funcion deleteParameter
 *
 * @param {Number} parameter_id id del registro 
 * @returns {Object}
 */
exports.DBdeleteScenarioParameterDayByParameter = (parameter_id) => {
    let promise = conn.db.none("DELETE FROM public.txscenarioparameterday WHERE parameter_id = $1", [parameter_id]);

    return promise;
};

/**
 *  Función para verificar si una raza está siendo usada por otra entidad
 *
 * @param {*} parameter_id id del registro 
 * @returns {Object}
 */
exports.DBisBeingUsed = function (parameter_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.scenario_formula_id IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.mdparameter a
                    LEFT JOIN public.txscenarioformula b on b.parameter_id = a.parameter_id
                    WHERE a.parameter_id=$1)
                    OR (SELECT DISTINCT CASE WHEN b.scenario_parameter_id IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.mdparameter a
                    LEFT JOIN public.txscenarioparameter b on b.parameter_id = a.parameter_id
                    WHERE a.parameter_id=$1) 
                    OR (SELECT DISTINCT CASE WHEN b.scenario_parameter_day_id IS NOT NULL THEN TRUE ELSE FALSE END
                    FROM public.mdparameter a
                    LEFT JOIN public.txscenarioparameterday b on b.parameter_id = a.parameter_id
                    WHERE a.parameter_id=$1)  ) as used`, [parameter_id]);
};

// **** Fin ConfTecnica ****

exports.DBfindAllParameter = function () {
    return conn.db.any("SELECT * FROM public.mdparameter");
};

exports.DBfindParameterByType = function (type) {
    return conn.db.any("SELECT * FROM public.mdparameter WHERE type=$1", [type]);
};

exports.DBcheckNameParameter = function (name, excep) {
    console.log("DBcheckNameParameter", name, excep);
    return conn.db.manyOrNone("SELECT name FROM public.mdparameter " +
        " WHERE mdparameter.name = $1 and  mdparameter.name <> $2 limit 1",
        [name.trim(), excep.trim()]);
};


exports.DBbulkAddparameter = function (parameter) {
    console.log(parameter);
    cs = conn.pgp.helpers.ColumnSet(["name", "description", "type", "process_id",
        "measure_id"
    ], {
        table: "mdparameter",
        schema: "public"
    });
    return conn.db.none(conn.pgp.helpers.insert(parameter, cs));
};