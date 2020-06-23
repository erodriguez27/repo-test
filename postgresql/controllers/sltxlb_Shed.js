const DBsltxlb_shed = require("../models/sltxlb_Shed");

exports.saveShedsByLiftBreeding = async function(req, res) {

    try {

        let liftbreedingsheds = req.body.liftbreedingsheds;
            

        let resp = await DBsltxlb_shed.DBinsertShedsByLiftBreeding(liftbreedingsheds);

        res.status(200).json({
            statusCode: 200,
            data: resp
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findShedsByLiftBreedingId = async function(req, res) {

    try {

        let id = req.body.liftbreeding_id
        console.log("id, body:::: ", id, req.body)
        let code_sheds = await DBsltxlb_shed.DBfindShedsByLiftBreedingId(id)
        console.log("lo que recibo:::: ", code_sheds)
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