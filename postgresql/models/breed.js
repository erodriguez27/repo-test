
const conn = require("../db");

// **** Inicio ConfTeccnica ****
/**
 * Busca en la tabla mdbreed todos los registros ordenado por el nombre de forma ascendente
 *
 * @returns {Object} Razas
 */
exports.DBfindAllBreed = function () {
    return conn.db.any("SELECT * FROM public.mdbreed order by name ASC");
};

exports.DBfindAllBreedWP = function (raza) {
    return conn.db.any("SELECT * FROM public.mdbreed WHERE name != $1 order by name ASC", [raza]);
};

/**
 * Función para agregar una raza 
 *
 * @param {String} code código del registro
 * @param {String} name nombre del registro
 * @returns {Object} devuelve el id del registro creado 
 */
exports.DBaddBreed = function (code, name) {
    return conn.db.one("INSERT INTO public.mdbreed (code, name) VALUES ($1, $2) RETURNING breed_id", [code, name]);
};

/**
 * Actualiza el registro seleccionado por el usuario 
 *
 * @param {Number} breed_id id del registro 
 * @param {String} code código
 * @param {String} name nombre
 * @returns
 */
exports.DBupdateBreed = function (breed_id, code, name) {
    return conn.db.none("UPDATE public.mdbreed SET code = $1, name = $2 " +
        "WHERE breed_id = $3", [code, name, breed_id]);
};

/**
 * función para eliminar un registro 
 *
 * @param {Number} breed_id id del registro
 * @returns {Object} statusCode: , mgs:
 */
exports.DBdeleteBreed = function (breed_id) {
    return conn.db.none("DELETE FROM public.mdbreed WHERE breed_id = $1", [breed_id]);
};

/**
 *  Función para verificar si una raza está siendo usada por otra entidad
 *
 * @param {*} breed_id id del registro 
 * @returns {Object}
 */
exports.DBisBeingUsed = function (breed_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.housing_way_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdbreed a
                            LEFT JOIN txhousingway b on b.breed_id = a.breed_id
                            WHERE a.breed_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broiler_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdbreed a
                            LEFT JOIN txbroiler b on b.breed_id = a.breed_id
                        WHERE a.breed_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broilereviction_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdbreed a
                            LEFT JOIN txbroilereviction b on b.breed_id = a.breed_id 
                        WHERE a.breed_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.process_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdbreed a
                            LEFT JOIN mdprocess b on b.breed_id = a.breed_id
                            WHERE a.breed_id = $1)
                        OR (SELECT DISTINCT CASE WHEN b.shed_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.mdbreed a
                            LEFT JOIN osshed b on b.breed_id = a.breed_id
                        WHERE a.breed_id = $1)) as used`, [breed_id]);
};

/**
 * Busca las razas que no tengan curva de postura. 
 *
 * @returns {Object}
 */
exports.DBfindBreedByCurve = function () {
    return conn.db.any("SELECT name, code, breed_id FROM mdbreed WHERE breed_id not in (SELECT breed_id FROM txposturecurve group by breed_id)");

};

// **** Fin ConfTecninca ****

exports.DBfindBreedByCode = function (breed_id) {
    return conn.db.any("SELECT * FROM public.mdbreed WHERE breed_id = $1;", [breed_id]);

};

exports.DbKnowBreedid = function (register) {
    let string = "SELECT name,breed_id FROM public.mdbreed WHERE name = ";
    var index = 0;
    while (index < register.length) {
        if (index == 0) {
            string = string + "'" + register[index].breedName + "'";
        } else {
            string = string + " or " + "name = " + "'" + register[index].breedName + "'";
        }
        index++;
    }
    return conn.db.any(string);
};