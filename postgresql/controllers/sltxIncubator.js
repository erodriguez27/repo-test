const DBlayer = require("../models/sltxIncubator");
const DBsltxb_shed = require("../models/sltxb_Shed");
const DBhigherLayer = require("../models/higherLayer");


function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.findIncubator = async function(req, res) {
    
    try {

        let init_date= req.body.init_date, 
            end_date= req.body.end_date,
            scenario_id = req.body.scenario_id; 
        if(init_date != undefined && init_date!=null && end_date != undefined && end_date!=null && scenario_id != undefined && scenario_id!=null){
            let data = await DBlayer.DBfindIncubator(init_date, end_date, scenario_id);
            console.log("la data que recibo:::: ", data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            res.status(204).json({
                statusCode: 204,
                error_msg: "Error no se recibió data en la solicitud"
            });
        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findLotProduction = async function(req, res) {
    
    try {
        console.log(req.body)
        let resp = await DBlayer.DBfindLotProductionPurchase(req.body.date,req.body.scenario);
            
        console.log(resp);
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