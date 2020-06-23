const DBlayer = require("../models/partnership");
const utils = require("../../lib/utils");


// **** Inicio ConfTenica ****

/**
 * Función GET que devuelve todos las empresas
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllPartnership = function(req, res) {
    DBlayer.DBfindAllPartnership()
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
 * Petición POST que reciba la data de la vista y la envía a la función DBaddPartnership del modelo partnership para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addPartnership = function(req, res) {
    DBlayer.DBaddPartnership(req.body.name, req.body.description,req.body.address, req.body.code, req.body.os_disable  )
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
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdatePartnership del modelo partnership para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updatePartnership = function(req, res) {
    DBlayer.DBupdatePartnership(req.body.name, req.body.description,req.body.address, req.body.partnership_id, req.body.code, req.body.os_disable)
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
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeletePartnership del modelo partnership para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deletePartnership = function(req, res) {
    DBlayer.DBdeletePartnership(req.body.partnership_id)
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

/**
 * Petición POST, recibe de la vista el id de la empresa y llama a la función DBisBeingUsed del modelo partnership oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = function(req, res) {
    DBlayer.DBisBeingUsed(req.body.partnership_id)
        .then(function(data) {
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

// **** Fin ConfTenica ****


exports.findPartnershipByFarmType = function(req, res, next) {
 
    DBlayer.DBfindPartnershipByFarmType(req.body.farm_type)
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

exports.bulkAddPartnership = function(req, res) {
    //console.log(req.body.registers);
    let partnerships = req.body.registers;
    utils.cleanObjects(partnerships);
    DBlayer.DBbulkAddPartnership(partnerships).then(function(data){
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }).catch(function(err){
        console.log(err);
        res.status(500).send(err);
    });
};

exports.bulkAddPartnership2 = utils.wrap(async function(req, res) {
    let partnerships = req.body.registers;
    const dbPartnerships = await DBlayer.DBfindAllPartnership();
    const errors = [];

    utils.cleanObjects(partnerships);

    for (const partnership of partnerships) {
        const partnershipMatch = dbPartnerships.find(p => partnership.code === p.code);
        if (partnershipMatch) {
            errors.push({object: partnership, message: `El código de empresa ${partnership.code} ya existe`});
        }
    }
    
    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }

    const result = await DBlayer.DBbulkAddPartnership(partnerships);
    
    res.status(200).json({
        statusCode: 200,
        data: result
    });

});

exports.findFarmByPartnership = function(req, res) {
//   console.log(req.body.partnership_id);
    DBlayer.DBfindFarmByPartnership(req.body.partnership_id)
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

exports.findIdByCode = function(req, res) {
    console.log(req.body.partnership_code);
    DBlayer.DBfindPartnershipByCode(req.body.partnership_code)
        .then(function(data) {
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
