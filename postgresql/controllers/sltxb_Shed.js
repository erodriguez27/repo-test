const DBsltxb_Shed = require("../models/sltxb_Shed");
//const DBbroiler_product = require("../models/broilerProduct");

exports.saveBreedingShedProgrammed = async function(req, res) {

    try {

        let sheds = req.body.shed_id;//debe ser un array de objetos donde cada propiedad debe ser llamada como cada campo de la tabla

        let inserted = DBsltxb_Shed.DBinsertBreedingShedProgrammed(sheds)

        res.status(200).json({
            statusCode: 200,
            data: inserted
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findShedsByBreedingId = async function(req, res) {

    try {

        let id = req.body.breeding_id

        let code_sheds = await DBsltxb_Shed.DBfindShedByIdBreeding(id)

        res.status(200).json({
            statusCode: 200,
            data: code_sheds
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};