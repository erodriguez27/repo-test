const DBlayer = require("../models/breed");


//  **** Inicio ConfTecnica 
/**
 * Petición GET que llama a la función DBfindAllBreed del modelo Breed y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllBreed = function (req, res) {

    DBlayer.DBfindAllBreed()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

/**
 * Funcion GET que devuelve todas las razas
 * 
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllBreedWP = function (req, res) {

    DBlayer.DBfindAllBreedWP("Plexus")
        .then(function (data) {
            console.log(data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición POST que reciba la data de la vista y la envía a la función DBaddBreed del modelo Breed para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addBreed = function (req, res) {
    console.log("llegue: " + req);
    DBlayer.DBaddBreed(req.body.code, req.body.name)
        .then(function (data) {
            console.log(data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateBreed del modelo Breed para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateBreed = function (req, res) {
    DBlayer.DBupdateBreed(req.body.breed_id, req.body.code, req.body.name)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteBreed del modelo Breed para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteBreed = function (req, res) {
    DBlayer.DBdeleteBreed(req.body.breed_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Raza Eliminada"
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición POST, recibe de la vista el id de la raza y llama a la función DBisBeingUsed del modelo Breed oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = function (req, res) {
    DBlayer.DBisBeingUsed(req.body.breed_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición GET que llama a la función findAllBreedWP del modelo Breed y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findBreedByCurve = function (req, res) {
    DBlayer.DBfindBreedByCurve()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

//  **** Fin ConfTecnica 

exports.findBreedByCode = function (req, res) {
    DBlayer.DBfindBreedByCode(req.params.code)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};