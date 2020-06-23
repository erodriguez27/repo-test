const DBlayer = require("../models/Parameter");
const DBprocess = require("../models/process");
const DBmeasure = require("../models/measure");
const utils = require("../../lib/utils");

// **** Inicio ConfTecnica ****

/**
 * Petición GET que llama a la función DBfindParameter del modelo Parameter y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findParameter = function(req, res) {

    DBlayer.DBfindParameter()
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
 * Petición POST que reciba la data de la vista y la envía a la función DBaddParameter del modelo Parameter para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addParameter = function(req, res) {

    DBlayer.DBaddParameter(req.body)
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
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateParameter del modelo Parameter para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateParameter = function(req, res) {

    DBlayer.DBupdateParameter(req.body)
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
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteParameter del modelo Parameter para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteParameter = async function(req, res) {
    
    await DBlayer.DBdeleteScenarioParameterDayByParameter(req.body.parameter_id);
    DBlayer.DBdeleteParameter(req.body.parameter_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

/**
 * Petición POST, recibe de la vista el id llama a la función DBisBeingUsed del modelo Parameter para verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = async function(req, res) {
    DBlayer.DBisBeingUsed(req.body.process_id)
        .then(function (data) {
            console.log(data)
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

// **** Fin ConfTecnica ****

/*
  Funcion POST : Se encarga de insertar un parametro a la DB
  Param: calendar_id Se envia en el cuerpo
*/
exports.findAllParameter = function(req, res) {

    DBlayer.DBfindAllParameter(req, res)
        .then(function(data) {
            res.status(200).json({
                status: "sucess",
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.findParameterByType = function(req, res) {
    DBlayer.DBfindParameterByType(req.params.type)
        .then(function(data) {
            res.status(200).json({
                status: "sucess",
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};


exports.changeName = function(req, res) {

    let name = req.body.name;
    let excep = req.body.diff;
    DBlayer.DBcheckNameParameter(name,excep)
        .then(function(data){
            console.log("result: ", data);
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

exports.bulkAddParameter = utils.wrap(async function(req, res) {
    const parameters = req.body.registers;
    const procesos = await DBprocess.DBKnowProcessid2(parameters);
});

exports.bulkAddParameter = function(req, res) {
    let J = 0;
    let band = false;
    DBprocess.DBKnowProcessid(req.body.registers).then(function (Processid) {
        if (Processid.length > 0) {
            for (let index = 0; index < req.body.registers.length; index++) {
                while ( J < Processid.length && !band) {
                    if ( req.body.registers[index].process_id == Processid[J].name) {
                        req.body.registers[index].process_id = Processid[J].process_id;
                        band = true;
                    }
                    J++; 
                }
                band = false;
                J = 0;
            }

            band = false;
            J = 0;
            index = 0;
            DBmeasure.DbKnowmeasure_id(req.body.registers).then(function (measureid) {
                for (let index = 0; index < req.body.registers.length; index++) {
                    while (J < measureid.length && !band) {
                        if (req.body.registers[index].measure_id == measureid[J].name) {
                            req.body.registers[index].measure_id = measureid[J].measure_id;
                            band = true;
                        }
                        J++;
                    }
                    band = false;
                    J = 0;
                }

                let parameter = req.body.registers;
                utils.cleanObjects(parameter);
                DBlayer.DBbulkAddparameter(parameter).then(function (data) {
                    res.status(200).json({
                        statusCode: 200,
                        data: data
                    });
                }).catch(function (err) {
                    console.log(err);
                    res.status(500).send(err);
                });
            });

        }else{
            res.status(401).json({
                statusCode: 401
            });
        }
    }).catch(function (err) {
        console.log(err);
        res.status(500).send(err);
    });
};
