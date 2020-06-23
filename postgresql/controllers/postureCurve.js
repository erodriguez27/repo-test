const DBlayer = require("../models/postureCurve");
const DBbreed = require("../models/breed");
const utils = require("../../lib/utils");

// **** Inicio ConfTenica ****

/**
 * Petición GET que llama a la función DBfindAllPostureCurve del modelo PostureCurve y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllPostureCurve = function(req, res) {
    DBlayer.DBfindAllPostureCurve()
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
 * Petición GET recibe de la vista el id de la Raza seleccionada y llama a la función DBfindCurveByBreed del modelo PostureCurve para hacer búsqueda de su curva de postura
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findCurveByBreed = function(req, res) {
    DBlayer.DBfindCurveByBreed(req.body.breed_id)
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
 * Petición POST que reciba la data de la vista y la envía a la función DBaddPostureCurve del modelo PostureCurve para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addPostureCurve = async (req, res) => {
    try {

        let records = req.body.newRecords,
            breed_id = req.body.breed_id;

        records.forEach(item=>{
            item.breed_id = breed_id;
        });

        let results = await DBlayer.DBaddPostureCurve(records);

        res.status(200).send({
            statusCode: 200,
            data: results
        });

    } catch (err) {
        res.status(200).send({
            statusCode: 200,
            error: err.message,
            errorCode: err.code
        });
    }
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeletePostureCurveByBreed del modelo PostureCurve para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deletePostureCurveByBreed = function(req, res) {
    DBlayer.DBdeletePostureCurveByBreed(req.body.breed_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Curva Eliminada"
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdatePostureCurve del modelo CurvePosture para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updatePostureCurve = function(req, res) { 
    DBlayer.DBupdatePostureCurve(req.body) 
        .then(function(data) { 
            res.status(200).json({ 
                statusCode: 200, 
                mgs: "Curva Actualizada" 
            }); 
        }) 
        .catch(function(err) { 
            console.log(err); 
            res.status(500).send(err); 
        }); 
};

// **** Fin ConfTenica ****



exports.bulkAddPostureCurve = function (req, res) {
    let J = 0;
    let band = false;
    DBbreed.DbKnowBreedid(req.body.registers).then(function (Breedid) {
        if (Breedid.length > 0) {
            for (let index = 0; index < req.body.registers.length; index++) {
                while ( J < Breedid.length && !band) {
                    if ( req.body.registers[index].breed_id == Breedid[J].name) {
                        req.body.registers[index].breed_id = Breedid[J].breed_id;
                        band = true;
                    }
                    J++; 
                }
                band = false;
                J = 0;
            }
            let postureCurves = req.body.registers;
            utils.cleanObjects(postureCurves);
            DBlayer.DBbulkAddPostureCurve(postureCurves).then(function (data) {
                res.status(200).json({
                    statusCode: 200,
                    data: data
                });
            }).catch(function (err) {
                console.log(err);
                res.status(500).send(err);
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

exports.bulkAddPostureCurve2 = utils.wrap(async function(req, res) {
    // throw new Error('holaa')
    const weeks = req.body.registers;
    const errors = [];
    utils.cleanObjects(weeks);

    const breeds = await DBbreed.DbKnowBreedid(weeks);
    console.log(breeds);
    for (const week of weeks) {

        const breedMatch = breeds.find(breed => breed.name === week.breedName);
        if (breedMatch !== undefined) {
            week.breed_id = breedMatch.breed_id;
        }
        else {
            errors.push({object: week, message: `La raza : ${week.breedName} no existe`});
        }
    }

    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }

    const result = await DBlayer.DBbulkAddPostureCurve(weeks);
    res.status(200).json({
        statusCode: 200,
        data: result
    });
    
});

exports.findCurveByBreed = function(req, res) {
//   console.log(req.body.breed_id);
    DBlayer.DBfindCurveByBreed(req.body.breed_id)
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