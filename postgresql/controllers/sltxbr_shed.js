const DBsltxb_Shed = require("../models/sltxbr_shed");


exports.findShedsByLotProg = async function(req, res) {

    try {

        let lot = req.body.lot,
            quantity_p = req.body.housing_quantity;

        let sheds = await DBsltxb_Shed.DBfindShedsByLotProg(lot),
            quant_lot = Math.ceil(quantity_p/sheds.length);
        
        sheds = sheds.map(item => ({...item, quantity: quant_lot}));

        res.status(200).json({
            statusCode: 200,
            data: sheds
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};