const DBlayer = require("../models/product");


// **** Inicio ConfTenica ****
/**
 * Petición GET que llama a la función DBfindAllProduct del modelo Product y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllProduct = function(req, res) {
    DBlayer.DBfindAllProduct()
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.log(err)
            res.status(500).send(err);
        });
};

/**
 * Petición POST que reciba la data de la vista y la envía a la función DBaddProduct del modelo Product para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP

 */
exports.addProduct = function(req, res) {
    DBlayer.DBaddProduct(req.body)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateProduct del modelo Product para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateProduct = function(req, res) {
    DBlayer.DBupdateProduct(req.body)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Elimina un producto
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteProduct = function(req, res) {
    DBlayer.DBdeleteProduct(req.body.product_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición POST, recibe de la vista el id de la raza y llama a la función DBisBeingUsed del modelo Product oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = function(req, res) {
    DBlayer.DBisBeingUsed(req.body.product_id)
        .then(function(data) {
            console.log("mi data: ", data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};
/**
 * busca los productos relacionao con la raza y etapa. 
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findProductsByBreedAndStage = function(req, res) {
    DBlayer.DBfindProductsByBreedAndStage(req.body.breed_id, req.body.stage_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.log(err)
            res.status(500).send(err);
        });
};

// **** Fin ConfTenica ****

exports.findProductsByBreed = function(req, res) {
    DBlayer.DBfindProductsByBreed(req.body.breed_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};


exports.bulkAddProduct = function(req, res) {
    //console.log(req.body.registers);
    let products = req.body.registers;
    //utils.cleanObjects(products);
    DBlayer.DBbulkAddProduct(products).then(function(data){
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }).catch(function(err){
        console.log(err);
        res.status(500).send(err);
    });
};