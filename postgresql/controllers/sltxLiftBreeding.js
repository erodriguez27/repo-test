const DBlayer = require("../models/sltxLiftBreeding");
const DBsltxb_shed = require("../models/sltxb_Shed");
const DBhigherLayer = require("../models/higherLayer");


function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.findLiftBreedingProgrammed = async function(req, res) {
    console.log(req.body)
    try {

        let init_date= req.body.init_date, 
            end_date= req.body.end_date, 
            breed_id= req.body.breed_id, 
            partnership_id = req.body.partnership_id, 
            farm_id= req.body.farm_id,
            scenario_id = req.body.scenario_id; 
        if((init_date != undefined && init_date!=null && end_date != undefined && end_date!=null) || (breed_id != undefined && breed_id!=null) || (farm_id != undefined && farm_id!=null) || (scenario_id != undefined && scenario_id!=null)){
            let data = await DBlayer.DBfindLiftBreedingProgrammed(init_date, end_date, breed_id, farm_id, partnership_id, scenario_id);
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

exports.executeLiftBreeding = async function(req, res) {
    console.log(req.body)
    try {

        let records = req.body.records,
            init_date= req.body.init_date, 
            end_date= req.body.end_date, 
            breed_id= req.body.breed_id, 
            partnership_id = req.body.partnership_id, 
            farm_id= req.body.farm_id,
            scenario_id = req.body.scenario_id;
        
            await DBlayer.DBexecuteLiftBreeding(records);
console.log("partnership en execution::: ", partnership_id)
        let data = await DBlayer.DBfindLiftBreedingProgrammed(init_date, end_date, breed_id, farm_id, partnership_id, scenario_id);
        console.log("la data que recibo:::: ", data);
        
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

exports.projectLiftBreeding = async function(req, res) {
// exports.projectLiftBreeding = async function(req, res) {
    // console.log("El body en el project:::: ",req.body)
    try {

        let record = req.body.record,
            init_date= req.body.init_date, 
            end_date= req.body.end_date, 
            partnership_id = req.body.partnership_id, 
            farm_id= req.body.farm_id,
            breed_id = record[0].breed_id,
            breed_find = req.body.breed_id,
            slbreeding_id = record[0].slbreeding_id,
            slliftbreeding_id = record[0].slliftbreeding_id,
            execution_date = record[0].execution_date,
            rec_birds =  record[0].received_birds,
            programmed_quantity = record[0].programmed_quantity,
            decrease = req.body.decrease,
            duration = parseInt(req.body.duration),
            scenario_id = req.body.scenario_id; 

        // console.log("El process:::: ", process) 
        console.log("nigger::: ",execution_date, req.body)
        let nDate = execution_date.split("-");
        let mortality = ((rec_birds-programmed_quantity)/rec_birds)*100;
            // date = new Date(nDate[0],nDate[1]-1,nDate[2]),
            // nAmount =rec_birds / (1+ (decrease/100)),
            

// console.log("dat:::: ", date, nDate, execution_date)
//         date = addDays(date, duration);

        let rec_update = [{
            slbreeding_id: slbreeding_id,
            slliftbreeding_id: slliftbreeding_id,
            // execution_quantity: nAmount,
            // execution_date: date,
            mortality: parseFloat(mortality.toFixed(2)),
            decrease: decrease,
            duration: duration
        }];
        console.log("el rec_update:::: ", rec_update)
        await DBlayer.DBprojectIntoBreeding(rec_update)
        await DBlayer.DBsaveLiftBreedingDecrease(rec_update)

        let data = await DBlayer.DBfindLiftBreedingProgrammed(init_date, end_date, breed_find, farm_id, partnership_id, scenario_id);

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
