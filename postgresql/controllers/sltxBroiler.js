const DBlayer = require("../models/sltxBroiler");
const DBsales_purchases = require("../models/sltxSellsPurchase");


function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.findBroilerByDateRange = async function(req, res) {

    try {
        let beginning = req.body.beginning,
            ending = req.body.ending,
            scenario_id = parseInt(req.body.scenario_id); 
            
        if (scenario_id !== undefined && scenario_id !== null && beginning !== undefined && beginning !== null && ending !== undefined && ending !== null) {
            let records = await DBlayer.DBfindBroilerByDateRange(beginning, ending, scenario_id).map(item => ({...item, births: true}));
            let records_sales = await DBsales_purchases.DBgetSalesAndPurchasesByWeek(beginning, ending, scenario_id)
            // console.log("Las sales y purchases::::: ",records_sales)
            for (let i = 0; i < records_sales.length; i++) {
                let found = false;
                if(records_sales[i].purchases !== null || records_sales[i].sales !== null){
                    await records.forEach(elm =>{
                        
                        if(elm.week===records_sales[i].week){
                            
                            elm.scheduled_quantity = parseInt(elm.scheduled_quantity) - ((records_sales[i].sales !== null) ? records_sales[i].sales : 0) + ((records_sales[i].purchases !== null) ? records_sales[i].purchases : 0);
                            elm.balance_quantity = parseInt(elm.balance_quantity) - ((records_sales[i].sales !== null) ? records_sales[i].sales : 0) + ((records_sales[i].purchases !== null) ? records_sales[i].purchases : 0);
                            found = true
                        }
                    });
                    if(!found){
                        let res_purch_h = await DBsales_purchases.DBgetResiduePurchaseByWeek(records_sales[i].week_number, 'H', scenario_id);
                        let res_purch_m = await DBsales_purchases.DBgetResiduePurchaseByWeek(records_sales[i].week_number, 'M', scenario_id);
                        records_sales[i].residue = res_purch_h.residue
                        records_sales[i].scheduled_quantity = ((records_sales[i].purchases !== null) ? records_sales[i].purchases : 0) - ((records_sales[i].sales !== null) ? records_sales[i].sales : 0),
                        records_sales[i].balance_quantity = ((records_sales[i].purchases !== null) ? records_sales[i].purchases : 0) - ((records_sales[i].sales !== null) ? records_sales[i].sales : 0),
                        records_sales[i].real_quantity = 0;
                        records_sales[i].gender = 'H';
                        records_sales[i].births = false;
                        records.push(records_sales[i])
                        records.push({...records_sales[i], gender:'M', residue: res_purch_m.residue})
                    }
                }
            }
            await records.sort((record, item) =>  item.week_number - record.week_number );
            // console.log( records)
            res.status(200).json({
                statusCode: 200,
                data: records
            });

        } else {
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

exports.findBroilerDailyLot = async function(req, res) {
    
    try {

        let beginning = req.body.beginning,
            ending = req.body.ending,
            gender = req.body.gender; 

        if(beginning !== undefined && beginning!== null && ending !== undefined && ending!== null && gender !== undefined && gender!== null){

            let data = await DBlayer.DBfindBroilerDailyLots(beginning, ending, gender),
                sells = await DBsales_purchases.DBgetSalesByWeek(beginning, ending);
            console.log("la data que recibo:::: ", data, sells);

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