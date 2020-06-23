const conn = require("../db");

//  **** Inicio ConfTecnica ****
/**
 * Busca en la tabla mdbroiler_product todos los registros ordenado por el nombre de forma ascendente
 *
 * @returns {Object} Productos de Engorde
 */
exports.DBfindAllBroilerProduct = function () {
    return conn.db.any("SELECT * FROM public.mdbroiler_product order by name ASC");
};

/**
 * Función para agregar un producto de salida de la etapa de engorde hacia desalojo 
 *
 * @param {String} name Nombre de producto de engorde 
 * @param {Number} weight Peso estimado del producto de engorde para su salida 
 * @param {Number} day Días necesarios para el desalojo del producto de engorde 
 * @param {String} code Código del producto de engorde
 * @param {Number} breed_id ID de la raza del producto de engorde
 * @param {String} gender Sexo del producto de engorde 
 * @param {Number} min_days minimo de dias para el desalojo del producto de engorde
 * @param {Number} conver Porcentaje de conversión del producto de engorde liviano a pesado
 * @param {String} type_bird Tipo del producto de engorde
 * @param {(String|Null)} initial_product producto inicial 
 * @returns {Object}
 */
exports.DBaddBroilerProduct = function (name, weight, day, code, breed_id, gender, min_days, conver, type_bird, initial_product) {
    // console.log(name);
    return conn.db.one("INSERT INTO public.mdbroiler_product (name, weight, days_eviction, code, breed_id, gender, min_days_eviction, conversion_percentage, type_bird, initial_product) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING broiler_product_id", [name, weight, day, code, breed_id, gender, min_days, conver, type_bird, initial_product]);
};

/**
 * Actualiza el registro seleccionado por el usuario 
 * 
 * @param {String} name Nombre de producto de engorde 
 * @param {Number} weight Peso estimado del producto de engorde para su salida 
 * @param {Number} day Días necesarios para el desalojo del producto de engorde 
 * @param {String} code Código del producto de engorde
 * @param {Number} breed_id ID de la raza del producto de engorde
 * @param {String} gender Sexo del producto de engorde 
 * @param {Number} min_days minimo de dias para el desalojo del producto de engorde
 * @param {Number} conver Porcentaje de conversión del producto de engorde liviano a pesado
 * @param {String} type_bird Tipo del producto de engorde
 * @param {(String|Null)} initial_product producto inicial 
 * @returns {Object}
 */
exports.DBupdateBroilerProduct = function (broiler_product_id, name, weight, day, code, breed_id, gender, min_days, conver, type_bird, initial_product) {
    // console.log(broiler_product_id, name, weight, day);
    // console.log("UPDATE BD");
    return conn.db.none(`UPDATE public.mdbroiler_product 
                            SET name = $1 , weight = $2, days_eviction = $3, code = $4, breed_id = $6, gender = $7,  min_days_eviction = $8, 
                            conversion_percentage = (case when type_bird != $10 then (case when type_bird = 'L' then null else $9 end) else  $9 end), 
                            type_bird = $10, initial_product = $11
                            WHERE broiler_product_id = $5`, [name, weight, day, code, broiler_product_id, breed_id, gender, min_days, conver, type_bird, initial_product]);
};
/**
 * función para eliminar un registro 
 *
 * @param {Number} broiler_product_id ID del producto de engorde 
 * @returns
 */
exports.DBdeleteBroilerProduct = function (broiler_product_id) {
    // console.log(broiler_product_id);
    return conn.db.none("DELETE FROM public.mdbroiler_product WHERE broiler_product_id = $1",
        [broiler_product_id]);
};

/**
 * Función para verificar si una producto de engorde está siendo usado por otra entidad
 *
 * @param {Number} breed_id id producto de engorde 
 * @returns {Object}
 */
exports.DBisBeingUsed = function (broiler_product_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.broiler_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                      FROM public.mdbroiler_product a
                          LEFT JOIN txbroiler_detail b on b.broiler_product_id = a.broiler_product_id
                      WHERE a.broiler_product_id = $1)
                      OR (SELECT DISTINCT CASE WHEN b.broilereviction_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                          FROM public.mdbroiler_product a
                          LEFT JOIN txbroilereviction_detail b on b.broiler_product_id = a.broiler_product_id 
                      WHERE a.broiler_product_id = $1)) as used `, [broiler_product_id]);
};

//  **** Fin ConfTecnica ****

exports.DBfindLightProductByBreed = function (breed_id, code, initial_p) {
    console.log(breed_id, initial_p)
    return conn.db.any(`SELECT * FROM public.mdbroiler_product c WHERE type_bird = 'L' and breed_id = $1 and ((select COUNT(*) 
    from mdbroiler_product a left join mdbroiler_product b on a.initial_product = b.broiler_product_id 
    where a.initial_product = c.broiler_product_id) = 0 or c.broiler_product_id = $3) and gender = 'M' and code != $2 order by name ASC`, [breed_id, code, initial_p]);
};
exports.DBfindBroilerProductbyBreedIdWithoutType = function (breed_id) {
    return conn.db.any("SELECT * FROM public.mdbroiler_product WHERE breed_id = $1 order by name ASC", [breed_id]);
};

exports.DBfindBroilerProductbyBreedId = function (breed_id, type_bird) {
    return conn.db.any("SELECT * FROM public.mdbroiler_product WHERE breed_id = $1 and type_bird = $2 order by name ASC", [breed_id, type_bird]);
};
exports.DBfindBroilerProductbyBreedAndGender = function (breed_id, gender) {
    return conn.db.any("SELECT * FROM public.mdbroiler_product WHERE breed_id = $1 and gender = $2 order by name ASC", [breed_id, gender]);
};

exports.DBfindBroilerProductbyCode = function (code) {
    return conn.db.any(`SELECT a.broiler_product_id FROM public.mdbroiler_product a 
                        LEFT JOIN mdequivalenceproduct b on a.code = b.product_code
                        WHERE b.equivalence_code = $1 order by name ASC`, [code]);
};

exports.DBfindBroilerProductHbyCode = function (code) {
    return conn.db.any(`SELECT broiler_product_id FROM public.mdbroiler_product 
                        WHERE code = $1 order by name ASC`, [code]);
};