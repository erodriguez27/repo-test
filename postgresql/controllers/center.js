const DBlayer = require("../models/center");
const DBlayerWarehouse = require("../models/warehouse");
const utils =  require("../../lib/utils");
const DBpartnership = require("../models/partnership");
const DBfarm = require("../models/farm");

//  **** Inicio ConfTecnica 

/**
 * @method addFarm
 * @description Petición POST que reciba la data de la vista y la envía a la función DBaddCenter del modelo center para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addCenter = function(req, res) {
    
    DBlayer.DBaddCenter(req.body.partnership_id, req.body.farm_id, req.body.name, req.body.code, req.body.os_disable) 

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

/**
 * @method findCenterByFarm
 * @description Petición POST, para recibe de la vista la selección de granja y devuelve los núcleos
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findCenterByFarm = function(req, res) {
    DBlayer.DBfindCenterByFarm(req.body.farm_id)
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

/**
 * @method updateCenter
 * @description Petición PUT que reciba la data de la vista y la envía a la función DBupdateCenter del modelo Center para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateCenter = async function(req, res) {

    try {
        await DBlayer.DBupdateCenter(req.body.center_id, req.body.code, req.body.name, req.body.os_disable);       
        res.status(200).json({
            statusCode: 200,
            msg: "Actualizado"
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
 * @method deleteCenter
 * @description Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función deleteCenter del modelo center para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteCenter = function(req, res) {
    DBlayer.DBdeleteCenter(req.body.center_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Nucleo Eliminado"
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};


/**
 * @method isBeingUsed
 * @description Petición POST, recibe de la vista el id de la empresa y llama a la función DBisBeingUsed del modelo center oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = function(req, res) {
    DBlayer.DBisBeingUsed(req.body.center_id)
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

//  **** Fin ConfTecnica 

exports.findCenterBycodes = function(req, res) {

    DBlayer.DBfindCenterBycodes(req.body.shed_code, req.body.farm_code)
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

exports.findAllCenter = function(req, res) {

    DBlayer.DBfindAllCenter()
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


exports.bulkAddCenter2 = utils.wrap(async function(req, res) {
    const centers = req.body.registers;
    const farms = await DBfarm.DbKnowFarmId2(centers);
    const errors = [];
    // console.log(farms)

    for (const center of centers) {
        const farmMatch = farms.find(farm => center.farmCode === farm.farm_code && center.partnershipCode === farm.partnership_code);
        if (farmMatch !== undefined) {
            center.farm_id = farmMatch.farm_id;
            center.partnership_id = farmMatch.partnership_id;
        }
        else {
            errors.push({object: center, message: `la combinacion de empresa: ${center.partnershipCode} y granja: ${center.farmCode} no existe`});
        }
        // console.log(farms)
        const duplicatedCenter = farms.find(f => 
            f.partnership_code === center.partnershipCode 
            && f.farm_code === center.farmCode
            && f.center_code === center.code
        );
        if (duplicatedCenter !== undefined) {
            errors.push({object: center, message: `La combinacion de empresa: ${center.partnershipCode}, granja: ${center.farmCode} y nucleo: ${center.code} ya existe`});
        }

    }
    
    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }

    const result = await DBlayer.DBbulkAddCenter(centers);
    res.status(200).json({
        statusCode: 200,
        data: result
    });

});

exports.bulkAddCenter = function(req, res) {
    let J = 0;
    let band = false;
    DBpartnership.DbKnowPartnership_id(req.body.registers).then(function (pa_id) {
        for (let index = 0; index < req.body.registers.length; index++) {
            while (J < pa_id.length && !band) {
                if (req.body.registers[index].partnership_id == pa_id[J].code) {
                    req.body.registers[index].partnership_id = pa_id[J].partnership_id;
                    band = true;
                }
                J++;
            }
            band = false;
            J = 0;
        }
        band = false;
        J = 0;
        DBfarm.DbKnowFarmId(req.body.registers).then(function (farm_id) {
            for (let index = 0; index < req.body.registers.length; index++) {
                while (J < farm_id.length && !band) {
                    if (req.body.registers[index].farm_id == farm_id[J].code) {
                        req.body.registers[index].farm_id = farm_id[J].farm_id;
                        band = true;
                    }
                    J++;
                }
                band = false;
                J = 0;
            }
            let centers = req.body.registers;
            utils.cleanObjects(centers);
            DBlayer.DBbulkAddCenter(centers).then(function(data){
                res.status(200).json({
                    statusCode: 200,
                    data: data
                });
            }).catch(function(err){
                console.log(err);
                res.status(500).send(err);
            });
        }).catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).send(err);
    });

  
};

exports.findCenterByFarm2 = function(req, res) {
    DBlayer.DBfindCenterByFarm2(req.body.farm_id)
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

exports.findWarehouseByCenter = async function(req, res) {

    try {

        let results = await DBlayerWarehouse.DBfindWarehouseByFarm(req.body.farm_id);
        let showRecords = await DBlayer.DBfindCenterAssociatedByWarehouse(req.body.center_id);


        showRecords.forEach(function(element0) {
            results.forEach(function(element1) {
                if(element0.warehouse_id==element1.warehouse_id){
                    element1.associated = true;
                }
            });
        });

        res.status(200).json({
            statusCode: 200,
            results: results,
            showRecords: showRecords
        });

    } catch (err) {
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findIdByCode = function(req, res) {
    DBlayer.DBfindIdByCode(req.body.center_code)
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

exports.updateCenterOrder = function (req, res) {
    DBlayer.DBupdateCenterOrder(req.body.data)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};