const DBlayer = require("../models/lot");

exports.findLotByFarm = async function(req, res) {

    try {
        // console.log("--- ", req.body);
        let data  = await DBlayer.DBfindLotByFarm(req.body.status, req.body.farm_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.updateLots = async function(req, res) {
    // console.log(JSON.parse(req.body.aLots));
    try {

        let lots = JSON.parse(req.body.aLots);
        for(let i = 0; i<lots.length;i++){
            let sDate = lots[i].sheduled_date.split("-");
            // console.log(sDate);
            let sheduled_date = new Date(sDate[2], sDate[1] - 1, sDate[0]);
            let data  = await DBlayer.DBupdateLots(lots[i].lot_id, sheduled_date, lots[i].sheduled_quantity);
        }

        res.status(200).json({
            statusCode: 200
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.addlots = async function(req, res) {

    try {
        let lots = JSON.parse(req.body.lots);

        if(lots.length>0){
            let data  = await DBlayer.DBaddLots(lots);
        }

        res.status(200).json({
            statusCode: 200
        });

    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};
