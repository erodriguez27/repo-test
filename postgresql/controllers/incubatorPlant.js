const DBlayer = require("../models/incubatorPlant");
const utils = require("../../lib/utils");
const DBpartnership = require("../models/partnership");

//  **** Inicio ConfTecnica 
/**
 * Función POST que envia la empresa seleccionada y devuelve las plantas incubadoras asociadas
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findIncPlantByPartnetship = async function (req, res) {
    try {
        let data = await DBlayer.DBfindIncPlantByPartnetship(req.body.partnership_id);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        res.status(500).send(err);
    }
};

/**
 * Petición POST que reciba la data de la vista y la envía a la función addIncubatorPlant del modelo incubatorPlant para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addIncubatorPlant = async function (req, res) {
    try {
        let data = await DBlayer.DBaddIncubatorPlant(req.body.name, req.body.code,
            req.body.description, req.body.partnership_id, req.body.max_storage,
            req.body.min_storage, req.body.acclimatized, req.body.suitable, req.body.expired);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        //   console.log(err);
        res.status(500).send(err);
    }
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteIncubatorPlant del modelo IncubatorPlant para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteIncubatorPlant = function (req, res) {
    DBlayer.DBdeleteIncubatorPlant(req.body.incubator_plant_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Planta Eliminada"
            });
        })
        .catch(function (err) {
            //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateIncubatorPlant del modelo IncubatorPlant para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateIncubatorPlant = function(req, res) {
    DBlayer.DBupdateIncubatorPlant(req.body.incubator_plant_id, req.body.name,
        req.body.code, req.body.description, req.body.max_storage,
        req.body.min_storage,req.body.acclimatized,req.body.suitable,req.body.expired)
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
 * Petición POST, recibe de la vista el id llama a la función DBisBeingUsed del modelo Parameter para verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = async function(req, res) {
    DBlayer.DBisBeingUsed(req.body.incubator_plant_id)
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

//  **** Fin ConfTecnica 


exports.incubatorStatus = function(req, res) {
    let a = req.body.incubator_plant_id;
    console.log("que es lo que");
    console.log(req.body.incubator_plant_id);
 
    DBlayer.DBOptiDisp(req.body.incubator_plant_id).then(function(data) {
        console.log(data);
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


exports.bulkAddIncubatorPlant2 = utils.wrap(async function(req, res) {
    const incubatorPlants = req.body.registers;
    const partnerships = await DBpartnership.DbKnowPartnership_id2(incubatorPlants);
    const errors = [];

    for (const incubatorPlant of incubatorPlants) {
        const partnershipMatch = partnerships.find(partnership => partnership.code === incubatorPlant.partnershipCode);
        if (partnershipMatch !== undefined) {
            incubatorPlant.partnership_id = partnershipMatch.partnership_id;
        }
        else {
            errors.push({object: incubatorPlant, message: `la empresa con el codigo: ${incubatorPlant.partnershipCode} no existe`});
        }

        const duplicatedIncubatorPlant = partnerships.find(p => p.code === incubatorPlant.partnershipCode && p.incplant_code === incubatorPlant.code);
        if (duplicatedIncubatorPlant !== undefined) {
            errors.push({object: incubatorPlant, message: `La combinacion de empresa: ${incubatorPlant.partnershipCode} y planta incubadora: ${incubatorPlant.code} ya existe`});
        }

    
    }

    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }
    
    const result = await DBlayer.DBbulkAddIncubatorPlant(incubatorPlants);
    res.status(200).json({
        statusCode: 200,
        data: result
    });
});

exports.bulkAddIncubatorPlant = function(req, res) {
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
        let incubatorPlants = req.body.registers;
        utils.cleanObjects(incubatorPlants);
        DBlayer.DBbulkAddIncubatorPlant(incubatorPlants).then(function(data){
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
   
};