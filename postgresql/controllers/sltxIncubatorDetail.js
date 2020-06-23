const DBlayer = require("../models/sltxIncubatorDetail");
const DBbroiler = require("../models/sltxBroiler");
const DBhigherLayer = require("../models/higherLayer");


function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

function sumQuantities(records){
    let acc = 0;

    records.forEach(itm => {
        acc = acc+parseInt(itm.quantity);
    });

    return acc;
};

exports.findProgrammedByIncId = async function(req, res) {
    
    try {

        let slincubator= req.body.slincubator; 
        if(slincubator != undefined && slincubator!=null){
            let data = await DBlayer.DBfindProgrammedByIncId(slincubator);
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

exports.addNewProgrammed = async function(req, res) {
    
    try {

        let record= req.body.record,
            inc_lots = req.body.lots;
        console.log("El body", req.body)
        console.log("El body")
        if(record != undefined && record!=null && record.length>0 && inc_lots != undefined && inc_lots!=null && inc_lots.length>0){
            record[0].programmed_quantity = sumQuantities(inc_lots);
            let prev = await DBlayer.DBfindLastIdentifier(),
                n_ident = prev.identifier + 1;
            record[0].identifier = n_ident;
            let programmed_ids = await DBlayer.DBaddNewProgrammed(record);
            let lots_ins = inc_lots.map(item => ({... item, slincubator_detail_id: programmed_ids[0].slincubator_detail_id
                }
            ))
            await DBlayer.DBaddIncubatorLot(lots_ins);
            let data = await DBlayer.DBfindProgrammedByIncId(record[0].incubator_id);
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

exports.projectIncubator = async function(req, res) {
    // record: "slincubator_detail_id", "incubator_id", "decrease", "duration"
    // slincubator_detail_id, incubator_id, programmed_date, slmachinegroup_id, prog_date, programmed_quantity, decrease, real_decrease, duration, incubatorplant_id
    // a.slincubator_detail_id, a.incubator_id, a.programmed_date, a.slmachinegroup_id, TO_CHAR(a.programmed_date, 'DD/MM/YYYY') as prog_date, a.programmed_quantity, a.decrease, a.real_decrease, a.duration, 
    // mg.name as incubator_name, ip.name as incubatorplant, incubatorplant_id

        try {
            
            let record = req.body.record,
                decrease = record[0].decrease,
                duration = record[0].duration,
                pQuantity = record[0].programmed_quantity,
                dateO = record[0].prog_date,
                aDate = dateO.split("/"),
                nDate = new Date(aDate[2], aDate[1]-1, aDate[0]),
                dSum = addDays(nDate, duration); 

            pQuantity =  (pQuantity * ( 1-(decrease/100) ) );
            
                // let broilersF = await DBbroiler.DBfindBroilerByDate(dSum),
                    flex_update = [],
                    flex = []; 
                    
                    flex.push({
                        scheduled_date : dSum,
                        scheduled_quantity : Math.ceil(pQuantity/2),
                        incubatorplant_id : record[0].incubatorplant_id,
                        slincubator_detail_id: record[0].slincubator_detail_id,
                        gender : 'M'
                    });
                    
                    flex.push({
                        scheduled_date : dSum,
                        scheduled_quantity : Math.ceil(pQuantity/2),
                        incubatorplant_id : record[0].incubatorplant_id,
                        slincubator_detail_id: record[0].slincubator_detail_id,
                        gender : 'H'
                    });
                    console.log("My new broiler:::", flex)
                    let broiler = await DBbroiler.DBaddNewBroiler(flex);
                    
                    
                // }

            await DBlayer.DBsaveIncubatorDecrease(record)
            let data = await DBlayer.DBfindProgrammedByIncId(record[0].incubator_id);
    
            res.status(200).json({
                statusCode: 200,
                data: data
            });
    
        } catch (err) {
            console.log(err);
            res.status(500).json({
                statusCode: 500,
                pgErrorCode: err
            });
        }
};

exports.executeIncubator = async function(req, res) {
    // record: "slincubator_detail_id", "programmed_quantity", "real_decrease", "newdate", "incubator_id"

        try {
    
            let record = req.body.record,
                rec_update = [];
console.log(record)

            record.forEach(itm => {
                // const  nQuantiy = itm.programmed_quantity;
                    // aDate = itm.new_date.split("/"),
                    // dFind = new Date (aDate[2], aDate[1]-1, aDate[0]);

                // const nQuantiy = itm.programmed_quantity - ( itm.programmed_quantity * (itm.real_decrease/100) );

                rec_update.push({
                    slincubator_detail_id: itm.slincubator_detail_id,
                    real_quantity: Math.ceil( (itm.programmed_quantity * (itm.real_decrease/100) )/2)
                });

            });
            console.log("el broiler a updetear::: ", rec_update)
            let broiler = await DBbroiler.DBupdateBroilerRealQuantity(rec_update);
            let incubator = await DBlayer.DBexecuteIncubator(record);
            let data = await DBlayer.DBfindProgrammedByIncId(record[0].incubator_id);

            res.status(200).json({
                statusCode: 200,
                data: data
            });
    
        } catch (err) {
            console.log(err);
            res.status(500).json({
                statusCode: 500,
                pgErrorCode: err
            });
        }
};

exports.findProgrammedByRangeAndPlant = async function(req, res) {
    
    try {

        let slincubator= req.body.slincubator,
            init_date = req.body.init_date,
            end_date = req.body.end_date,
            incubator_plant_id = req.body.incubator_plant_id; 
            
        if((init_date != undefined && init_date!=null && end_date != undefined && end_date!=null) || (incubator_plant_id != undefined && incubator_plant_id!=null) || (slincubator != undefined && slincubator!=null)){
            let data = await DBlayer.DBfindProgrammedByRangeAndPlant(slincubator, init_date, end_date, incubator_plant_id);
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
    