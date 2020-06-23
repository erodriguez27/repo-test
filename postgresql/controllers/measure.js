/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const DBlayer = require("../models/measure");


// **** Inicio ConfTenica ****
/**
 * Petición GET que llama a la función DBfindAllMeasure del modelo Measure y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllMeasure = function (req, res) {
    DBlayer.DBfindAllMeasure()
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
 * Petición POST que reciba la data de la vista y la envía a la función DBaddMeasure del modelo Measure para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addMeasure = function (req, res) {
    DBlayer.DBaddMeasure(req.body.name, req.body.abbreviation, req.body.originvalue, req.body.valuekg, req.body.is_unit)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateMeasure del modelo Measure para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateMeasure = function (req, res) {
    DBlayer.DBupdateMeasure(req.body.name, req.body.abbreviation, req.body.originvalue, req.body.valuekg, req.body.measure_id, req.body.is_unit)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteMeasure del modelo Measure para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteMeasure = function (req, res) {
    DBlayer.DBdeleteMeasure(req.body.measure_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Medida Eliminada"
            });
        })
        .catch(function (err) {
            //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición GET recibe de la vista el valor de la entrada por cada interacción del usuario y lo envía a la función DBchechNameMeasure del modelo measure para buscar la coincidencia 
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.changeName = function (req, res) {

    let name = req.body.name;
    let excep = req.body.diff;
    DBlayer.DBchechNameMeasure(name, excep)
        .then(function (data) {
            // console.log('result: ', data)
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
 * Petición GET recibe de la vista el valor de la entrada por cada interacción del usuario y lo envía a la función DBchechNameMeasure del modelo measure para buscar la coincidencia 
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.changeAbrev = function (req, res) {
    let name = req.body.name;
    let excep = req.body.diff;
    // console.log('in:: ',name, excep )
    DBlayer.DBchechAbrevMeasure(name, excep)
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

// **** Fin ConfTenica ****


exports.bulkAddMeasure = function (req, res) {
    //console.log(req.body.registers);
    let measures = req.body.registers;
    //utils.cleanObjects(measures);
    DBlayer.DBbulkAddMeasure(measures).then(function (data) {
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).send(err);
    });
};