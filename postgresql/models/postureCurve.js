const conn = require("../db");

// **** Inicio ConfTenica ****

/**
 * Busca en la tabla msmeasure todos los registros ordenado  por el nombre de forma ascendente
 *
 * @returns {Object} unidades de medida
 */
exports.DBfindAllPostureCurve = function() {
    return conn.db.any("SELECT a.breed_id, " +
                       "(SELECT name FROM mdbreed where a.breed_id = breed_id) " +
                       "FROM txposturecurve a group by a.breed_id order by name");
};
/**
 * Función DBfindCurveByBreed recibe como parámetro desde el controlador el id la de raza (breed_id) seleccionada para hacer la búsqueda eventual de su curva de postura
 *
 * @param {Number} breed_id
 * @returns {Object} 
 */
exports.DBfindCurveByBreed = function(breed_id) {
    return conn.db.any("SELECT * FROM public.txposturecurve WHERE breed_id = $1 order by week ASC", [breed_id]);
};
/**
 * Recibe los Values y la data para ser procesada indivialmente
 *
 * @param {String} template Values
 * @param {Object} data objeto con la información
 * @returns {Object}
 */
function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }

    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}
/**
 * Función para agregar una curva de postura
 *
 * @param {Object} records data que contiene la información de la curva de postura
 * @returns {Object}
 */
exports.DBaddPostureCurve = function(records) {
    let promise = conn.db.none("INSERT INTO txposturecurve (week, breed_id, theorical_performance, "+
                             " historical_performance, theorical_accum_mortality, historical_accum_mortality, "+
                             " theorical_uniformity, historical_uniformity, type_posture) VALUES $1",
    Inserts("${week}, ${breed_id}, ${theorical_performance}, ${historical_performance}, ${theorical_accum_mortality}, "+
              "${historical_accum_mortality}, ${theorical_uniformity}, ${historical_uniformity}, ${type_posture} ", records));
    return promise;
};

/**
 * Elimina un registro seleccionado por el usuario
 *
 * @param {Number} breed_id id de la raza
 * @returns {Object}
 */
exports.DBdeletePostureCurveByBreed = function(breed_id) {
    return conn.db.none("DELETE FROM public.txposturecurve WHERE breed_id = $1",[breed_id]);
};

/**
 * Función para actualizar un registro especfico 
 * 
 * @param {Object} record objeto con la data modificada
 * @returns {Object}
 */
exports.DBupdatePostureCurve = function(record){  
    cs = conn.pgp.helpers.ColumnSet(["posture_curve_id",          
        {name: "theorical_performance", 
            init: col => { 
                return parseFloat(col.value);} 
        }], {table: "txposturecurve", schema: "public"}); 
    return conn.db.none(conn.pgp.helpers.update(record.arra2, cs)+ "WHERE v.posture_curve_id = t.posture_curve_id"); 
 
};
// **** Inicio ConfTenica ****

exports.DBbulkAddPostureCurve = function(postureCurves){
    cs = conn.pgp.helpers.ColumnSet(["breed_id","week", "theorical_performance", 
        "historical_performance","theorical_accum_mortality", "historical_accum_mortality",
        "theorical_uniformity", "historical_uniformity", "type_posture"], {table: "txposturecurve", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(postureCurves, cs));
};
