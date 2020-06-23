const config = require("../../config");
const conn = require("../db");

// **** Inicio ConfTenica ****

/**
 * Busca en la tabla mdproduct relacionado con la tabla raza todos los registros ordenado por el nombre de forma ascendente
 *
 * @returns {Object} Product
 */
exports.DBfindAllProduct = function () {
    return conn.db.any("SELECT a.product_id, a.name, a.code, a.breed_id, b.name as breed, a.stage_id FROM public.mdproduct a LEFT JOIN public.mdbreed b on b.breed_id = a.breed_id  order by a.name ASC");
};

/**
 * Función para agregar un producto
 *
 * @param {Object} product
 * @returns {Object}
 */
exports.DBaddProduct = function (product) {
    return conn.db.one("INSERT INTO public.mdproduct (code, name, breed_id, stage_id) VALUES ($1, $2, $3, $4) RETURNING product_id", [product.code, product.name, product.breed, product.stage]);
};
/**
 *  Función para actualizar un producto específico
 *
 * @param {Object} product
 * @returns {Object}
 */
exports.DBupdateProduct = function (product) {
    return conn.db.none("UPDATE public.mdproduct SET name = $1, code = $2, breed_id = $4, stage_id = $5 WHERE product_id = $3", [product.name, product.code, product.product_id, product.breed, product.stage]);
};

/**
 * Función para eliminar un registro 
 *
 * @param {Number} product_id id del registro
 * @returns {Object} statusCode: , mgs:
 */
exports.DBdeleteProduct = function (product_id) {
    return conn.db.none("DELETE FROM public.mdproduct WHERE product_id = $1", [product_id]);
};

/**
 *  Función para verificar si una raza está siendo usada por otra entidad
 *
 * @param {Number} product_id id del registro 
 * @returns {Object}
 */
exports.DBisBeingUsed = function (product_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.process_id IS NOT NULL THEN TRUE ELSE FALSE END
                        FROM public.mdproduct a
                        LEFT JOIN mdprocess b on b.product_id = a.product_id
                        WHERE a.product_id = $1)) as used `, [product_id]);
};

/**
 * Busca los productos por etapa y raza 
 *
 * @param {Number} breed_id id de la raza
 * @param {Number} stage_id id de la etapa
 * @returns {Object}
 */
exports.DBfindProductsByBreedAndStage = function (breed_id, stage_id) {
    return conn.db.any("SELECT a.product_id, a.name, a.code, a.breed_id, b.name as breed FROM public.mdproduct a LEFT JOIN public.mdbreed b on b.breed_id = a.breed_id where a.breed_id = $1 and a.stage_id = $2 order by a.name ASC", [breed_id, stage_id]);
};
// **** Inicio ConfTenica ****

exports.DBfindProductsByBreed = function(breed_id) {
    return conn.db.any("SELECT a.product_id, a.name, a.code, a.breed_id, b.name as breed FROM public.mdproduct a LEFT JOIN public.mdbreed b on b.breed_id = a.breed_id where a.breed_id = $1 order by a.name ASC", [breed_id]);
};

exports.DBbulkAddProduct = function(products) {
    cs = conn.pgp.helpers.ColumnSet(["code", "name"], {table: "mdproduct", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(products, cs));
};

