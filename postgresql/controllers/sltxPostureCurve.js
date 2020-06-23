const DBsltx_posturecurve = require("../models/sltxPostureCurve");
const DBsltx_breeding = require("../models/sltxBreeding");
const DBincubator = require("../models/sltxIncubator");
const DBsltx_incubator_curve = require("../models/sltxincubator_curve");

function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.savePostureCurve = async function(req, res) {

    try {

        let posturecurve = req.body.posturecurve,
            slbreeding_id_ = req.body.slbreeding_id,
            scenario_id_ = req.body.scenario_id, 
            breed_id_ = req.body.breed_id,
            posture_date = req.body.start_posture_date,
            //execution_date = req.body.execution_date,
            execution_quantity = req.body.execution_quantity,
            //lot = req.body.lot,
            search = req.body.search,
            lengS = req.body.table, data,
            config = posturecurve.map(item => ({...item,weekly_curve:item.posture_quantity,posture_quantity: parseFloat((item.posture_quantity*execution_quantity).toFixed(2)),slbreeding_id : slbreeding_id_, scenario_id : scenario_id_, breed_id : breed_id_}));
            // updateBreeding = {
            //     slbreeding_id : slbreeding_id_,
            //     execution_date : execution_date,
            //     execution_quantity : execution_quantity,
            //     start_posture_date : posture_date,
            //     lot : lot
            // }
            
            console.log("saveposturecurve",req.body)
            console.log("wwwwww",config)
            let structure = posture_date.split("-");
            let day_s = structure[2].split("T")
            console.log("structure",day_s)
            let date1 = new Date(structure[0],structure[1]-1,day_s[0]);

            console.log("fecha1",date1)

            config[0].posture_date =  date1;

            let date = new Date(date1),
                // i =1,
                inc_curve_ins = []
                first_inc = await DBincubator.DBfindProjectionByDateAndScenarioForCurve(config[0].posture_date, config[0].scenario_id),
                // exist = first_inc.length > 0;
            // if(exist){
                inc_curve_ins.push({
                    slincubator_id: first_inc[0].slincubator,
                    quantity: 0
                });
            // }
            // while(exist && i<config.length){
            for (let i = 1; i < config.length; i++) {

                config[i].posture_date = await addDays(date,7);
                date = new Date(date);

                let inc_proy = await DBincubator.DBfindProjectionByDateAndScenarioForCurve(config[i].posture_date, config[i].scenario_id)
                // console.log("El inc proy de la fecha ", config[i].posture_date, inc_proy)
                // exist = exist && inc_proy.length > 0;
                // if(exist){
                    inc_curve_ins.push({
                        slincubator_id: inc_proy[0].slincubator,
                        quantity: 0
                    });
                // }
                // i++;
            }

        //if(exist){

            let resp_p = await DBsltx_posturecurve.DBinsertPostureCurve(config);
            //console.log("update",updateBreeding)
            //let resp_b = await DBsltx_breeding.DBupdateBreedingExecuted([updateBreeding]);
            console.log("lasids al insertar::: ", resp_p)
            
            let inc_ins = inc_curve_ins.map((item, i) => (
                {
                    ...item,
                    slposturecurve_id: resp_p[i].slposturecurve_id
                }
            ));
                console.log("El insert de incubator posture", inc_ins)
            await DBsltx_incubator_curve.DBinsertIncubatorPosture(inc_ins); 
            console.log("Las length:", config.length, inc_ins.length)
    
            
            // for (let i = 0; i < config.length; i++) {
    
            //     DBincubator.DBupdateScheduledQuantity(config[i].posture_date, config[i].posture_quantity, config[i].scenario_id);
                
            // }
            if(lengS>1){
                data = await DBsltx_breeding.DBfindBreedingByFilter(search.farm_id,search.breed_id,search.date1,search.date2, search.partnership_id);
            }else{
                data = [await DBsltx_breeding.DBfindBreedingById(req.body.slbreeding_id)];
            }
    
            res.status(200).json({
                statusCode: 200,
                data: data,
                resp_p: resp_p
            });
        // }else{
        //     res.status(409).json({
        //         statusCode: 409,
        //         msj: "No se pudo ejecutar porque no existe demanda de huevos para una de las semanas involucradas en la producción"
        //     });
        // }
            


    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findPostureCurve = async function(req, res) {
    console.log(req.body)
    try {

        let init_date= req.body.init_date, 
            end_date= req.body.end_date, 
            breed_id= req.body.breed_id, 
            partnership_id= req.body.partnership_id, 
            farm_id= req.body.farm_id,
            lot = req.body.lot,
            scenario_id = req.body.scenario_id; 
        if((scenario_id != undefined && scenario_id!=null) || (init_date != undefined && init_date!=null && end_date != undefined && end_date!=null) || (breed_id != undefined && breed_id!=null) || (farm_id != undefined && farm_id!=null)||(lot != undefined && lot!=null)){
            let data = await DBsltx_posturecurve.DBfindPostureCurve(init_date, end_date, breed_id, farm_id, partnership_id, scenario_id, lot);
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

exports.findPostureCurveLot = async function(req, res) {
    console.log(req.body)
    try {

        let breed_id= req.body.breed_id,
            farm_id= req.body.farm_id,
            scenario_id = req.body.scenario_id; 
        if((scenario_id != undefined && scenario_id!=null) || (breed_id != undefined && breed_id!=null) || (farm_id != undefined && farm_id!=null)){
            console.log("antes", breed_id, scenario_id, farm_id)
            let data = await DBsltx_posturecurve.DBfindPostureCurveLot(scenario_id, breed_id, farm_id);
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