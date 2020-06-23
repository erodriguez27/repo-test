const DBlayer = require("../models/housingWayLot");
/*const DBbroiler_product = require('../models/broilerProduct');
 const DBslaughterhouse = require('../models/slaughterhouse');*/
exports.addHousinhWayLot = async function(req, res) {

    try {
        let records = await DBlayer.DBaddHousinhWayLot(req.body);
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


// exports.findAll = async function(req, res) {

//     try {
//         let records = await DBlayer.DBfindAll();
//         res.status(200).json({
//             statusCode: 200,
//             data: records
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             statusCode: 500,
//             pgErrorCode: err
//         });
//     }
// };

