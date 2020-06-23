const DBlayer = require("../models/broilerProduct");

//  **** Inicio ConfTecnica 
/**
 * Petición GET que llama a la función DBfindAllBroilerProduct del modelo broilerProduct y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllBroilerProduct = async function (req, res) {
    try {
        let results = await DBlayer.DBfindAllBroilerProduct();
        res.status(200).json({
            statusCode: 200,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

/**
 * Petición POST que reciba la data de la vista y la envía a la función DBaddBroilerProduct del modelo broilerProduct para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addBroilerProduct = async function (req, res) {
    try {
        let name = req.body.name;
        let weight = req.body.weight;
        let day = req.body.days_eviction;
        let code = req.body.code;
        let gender = req.body.gender;
        let breed_id = req.body.breed_id;
        let min_days = req.body.min_days;
        let conver = req.body.conver;
        let type_bird = req.body.type_bird;
        let initial_product = req.body.initial_product;
        let results = await DBlayer.DBaddBroilerProduct(name, weight, day, code, breed_id, gender, min_days, conver>0?conver:0, type_bird, initial_product);

        res.status(200).json({
            statusCode: 200,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateBroilerProduct del modelo broilerProduct para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateBroilerProduct = async function (req, res) {
    try {
        let name = req.body.name;
        let broiler_product_id = req.body.broiler_product_id;
        let weight= req.body.weight;
        let day= req.body.days_eviction;
        let code = req.body.code;
        let gender = req.body.gender;
        let breed_id = req.body.breed_id;
        let min_days = req.body.min_days;
        let conver = req.body.conver | 0;
        let type_bird = req.body.type_bird;
        let initial_product = req.body.initial_product;
        let results = await DBlayer.DBupdateBroilerProduct(broiler_product_id, name, weight, day, code, breed_id, gender, min_days, conver, type_bird, initial_product);

        res.status(200).json({
            statusCode: 200,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteBroilerProduct del modelo broilerProduct para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteBroilerProduct = async function (req, res) {
    try {
        let broiler_product_id = req.body.broiler_product_id;
        let results = await DBlayer.DBdeleteBroilerProduct(broiler_product_id);

        res.status(200).json({
            statusCode: 200,
            data: results
        });
    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

/**
 * Petición POST, recibe de la vista el id de la raza y llama a la función DBisBeingUsed del modelo broilerProduct oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = function(req, res) {
    DBlayer.DBisBeingUsed(req.body.broiler_product_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.error(err);
            res.status(500).send(err);
        });
};
//  **** Fin ConfTecnica 

exports.findLightProductByBreed = async function (req, res) {
    console.log(req.body);

    try {
        let breed_id = req.body.breed_id, code = req.body.code, initial_p = req.body.initial_p;
        let results = await DBlayer.DBfindLightProductByBreed(breed_id,code, initial_p);

        res.status(200).json({
            statusCode: 200,
            data: results
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

