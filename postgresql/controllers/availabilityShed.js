const DBlayer = require("../models/availabilityShed");

exports.findDateRange = async function(req, res) {
    console.log(req.body.init_date, req.body.end_date, req.body.shed_id);
    try {
        let data  = await DBlayer.DBfindDateRange(req.body.init_date, req.body.end_date, req.body.shed_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.addAvailabilityShed = async function(req, res) {

    try {
        let availabilityShed = JSON.parse(req.body.availabilityShed),
            data = [];
          
        //console.log("Aqui ** ",req.body.availabilityShed, availabilityShed.length);
        if(availabilityShed.length>0){
            data  = await DBlayer.DBaddAvailabilityShed(availabilityShed);
        }

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
