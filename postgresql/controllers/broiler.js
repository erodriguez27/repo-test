const DBlayer = require("../models/broiler");
const DBbroiler_product = require("../models/broilerProduct");

function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.findprojectedbroiler = async function(req, res) {

    try {

        let partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            _date = req.body._date,
            nd_date = req.body.end_date,
            breed_id = req.body.breed_id;

        let aDate = _date.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let _end = nd_date.split("-"),
            end_date = `${_end[2]}-${_end[1]}-${_end[0]}`;

        let nDate = new Date(aDate[2], aDate[1] - 1, aDate[0]);
        console.log("antes del bdjk");
        // console.log(init_date, end_date) 
        let records = await DBlayer.DBfindprojectedbroiler(partnership_id, scenario_id, init_date, end_date, breed_id);
        console.log("despues del bdjk");  
        // let broiler_product = await DBbroiler_product.DBfindAllBroilerProduct();
        let broiler_product = await DBbroiler_product.DBfindBroilerProductbyBreedIdWithoutType(breed_id);
        console.log("fggrdhdjkgrj");
        console.log(records);
        console.log(broiler_product);
        res.status(200).json({
            statusCode: 200,
            data: records,
            product: broiler_product
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findBroilerLot = async function(req, res) {

    try {
        let scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            rDate = req.body._date,
            aDate = rDate.split("/"),
            _date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;


        let records = await DBlayer.DBfindBroilerLot(scenario_id, partnership_id, breed_id, _date);

        res.status(200).json({
            statusCode: 200,
            data: records
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }

};
