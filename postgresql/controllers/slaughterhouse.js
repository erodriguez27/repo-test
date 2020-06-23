const DBlayer = require("../models/slaughterhouse");

/**
 * Función GET que devuelve todas las plantas de beneficio
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllSlaughterhouse = function(req, res) {
    DBlayer.DBfindAllslaughterhouse()
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

/**
 * Petición POST que reciba la data de la vista y la envía a la función DBaddslaughterhouse del modelo slaughterhouse para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addSlaughterhouse = function(req, res) {
    DBlayer.DBaddslaughterhouse(req.body.name, req.body.description,req.body.address, req.body.code, req.body.capacity )
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateslaughterhouse del modelo slaughterhouse para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateslaughterhouse = function(req, res) {
    DBlayer.DBupdateslaughterhouse(req.body.name, req.body.description,req.body.address, req.body.slaughterhouse_id, req.body.code, req.body.capacity)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteslaughterhouse del modelo slaughterhouse para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteslaughterhouse = function(req, res) {
    DBlayer.DBdeleteslaughterhouse(req.body.slaughterhouse_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Empresa Eliminada"
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};
