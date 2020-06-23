const DBsltx_breeding = require("../models/sltxBreeding");
const DBsltxb_shed = require("../models/sltxb_Shed");
const DBincubator = require("../models/sltxIncubator");
const DBsltxlb_shed = require("../models/sltxlb_Shed");
const DBsltx_liftbreeding = require("../models/sltxLiftBreeding");
const DBhigherLayer = require("../models/higherLayer");
const DBsltx_posturecurve = require("../models/sltxPostureCurve");
const DBsltx_incubator_curve = require("../models/sltxincubator_curve");

function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.saveBreedingProgrammed = async function(req, res) {
    console.log(req.body)
    try {

        let stage_id = req.body.stage_id,
            scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            farm_id = req.body.farm_id,
            programmed_quantity = req.body.programmed_quantity,
            housing_date = req.body.housing_date,
            start_posture_date = req.body.posture_date,
            sheds = req.body.shed_id,
            lot = req.body.lot,
            b_shed_array = [];
             
        let id_breeding = await DBsltx_breeding.DBinsertBreedingProgrammed(stage_id, scenario_id, partnership_id,
            breed_id, farm_id, programmed_quantity, housing_date, start_posture_date, lot);
        console.log("despues del id", id_breeding.slbreeding_id);
        

        for (let i = 0; i < sheds.length; i++) {

            let id_center = await DBsltx_breeding.DBfindCenterById(sheds[i],farm_id);
            console.log("id center", id_center.center_id);

            let b_shed = {

                slbreeding_id : id_breeding.slbreeding_id,
                center_id : id_center.center_id,
                shed_id : sheds[i]
            };
            
            b_shed_array.push(b_shed);
            
        }

        let id_b_shed = await DBsltxb_shed.DBinsertBreedingShedProgrammed(b_shed_array);
        let recordview = await DBsltx_breeding.DBfindBreedingById(id_breeding.slbreeding_id);
        console.log("recordview",recordview)
        
        recordview.slbreeding_id = id_breeding.slbreeding_id;
        let scenarios = await DBhigherLayer.DBfindAllScenariosProgrammed("sltxbreeding");
        res.status(200).json({
            statusCode: 200,
            data: recordview,
            scenarios: scenarios 
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findBreedingByFilter = async function(req, res) {

    try {

        let farm_id = req.body.farm_id,
            breed_id = req.body.breed_id,
            date1 = req.body.date1,
            date2 = req.body.date2,
            partnership_id = req.body.partnership_id,
            breedings,
            scenario_id = req.body.scenario_id;
            
        if((scenario_id != undefined && scenario_id!=null) || (date1 != undefined && date1!=null && date2 != undefined && date2!=null) || (breed_id != undefined && breed_id!=null) || (farm_id != undefined && farm_id!=null)){
            
            breedings = await DBsltx_breeding.DBfindBreedingByFilter(farm_id,breed_id,date1,date2, partnership_id, scenario_id);
            
            res.status(200).json({
                statusCode: 200,
                data: breedings
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

exports.saveProjection = async function(req, res) {

    try {

        console.log("saveprojection",req.body)

        let stage_id = req.body.stage_id,
            scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            farm_id = req.body.farm_id,
            programmed_quantity = req.body.programmed_quantity,
            housing_date = req.body.housing_date,
            slbreeding_id = req.body.slbreeding_id,
            decrease = req.body.decrease,
            duration = req.body.duration,
            lengS = req.body.table,
            sheds = await DBsltxb_shed.DBfindShedByIdBreeding(slbreeding_id),
            sheds_ids = sheds.map(item => item.shed_id),
            data

            //saveposturecurve

            posturecurve = req.body.posturecurve,
            posture_date = req.body.start_posture_date,
            programmed_quantity = req.body.programmed_quantity,
            search = req.body.search,
            config = posturecurve.map(item => ({...item,weekly_curve:item.posture_quantity,posture_quantity: parseFloat((item.posture_quantity*programmed_quantity).toFixed(2)),slbreeding_id : slbreeding_id, scenario_id : scenario_id, breed_id : breed_id}));
            
        
        console.log("Config :",config)
        let structure = posture_date.split("-");
        let day_s = structure[2].split("T")
        let date1 = new Date(structure[0],structure[1]-1,day_s[0]);

        console.log("fecha1",date1)

        config[0].posture_date =  date1;

        let date = new Date(date1),
            inc_curve_ins = []
            first_inc = await DBincubator.DBfindProjectionByDateAndScenarioForCurve(config[0].posture_date, config[0].scenario_id),
            inc_curve_ins.push({
                slincubator_id: first_inc[0].slincubator,
                quantity: 0
            });
        for (let i = 1; i < config.length; i++) {

            config[i].posture_date = await addDays(date,7);
            date = new Date(date);

            let inc_proy = await DBincubator.DBfindProjectionByDateAndScenarioForCurve(config[i].posture_date, config[i].scenario_id)
            
                inc_curve_ins.push({
                    slincubator_id: inc_proy[0].slincubator,
                    quantity: 0
                });
        }

        let resp_p = await DBsltx_posturecurve.DBinsertPostureCurve(config);
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
        
        //saveprojection

        structure = housing_date.split("/");
        date1 = new Date(structure[2],structure[1]-1,structure[0]);
        console.log("fecha",date1) 
    
        // let process = await DBhigherLayer.DBfindProcessByStageAndBreed(stage_id,breed_id);
        // console.log("datos de proceso", process);

        let demand_birds = programmed_quantity / (1-(decrease/100))
        console.log("result",demand_birds)

        let scheduled_date = addDays(date1,-duration)

        let lbfarm = await DBhigherLayer.DBfindLiftBreadingFarmByRepFarm(farm_id);
        let lbfarm_id = lbfarm[0].farm_id;
        console.log("id lbfarm",farm_id, lbfarm[0].farm_id,sheds,lbfarm_id);

        let lbsheds = await DBhigherLayer.DBfindLiftBreadingShedsByFarm(sheds_ids,lbfarm_id);
        console.log("lbsheds",lbsheds)

        let resp = await DBsltx_liftbreeding.DBinsertProjectionByBreedingProgrammed(stage_id,scenario_id,partnership_id,breed_id,lbfarm_id,
            demand_birds,scheduled_date,slbreeding_id);
        console.log("status projection", resp);

        lbsheds.forEach(position => {

            position.slliftbreeding_id = resp.slliftbreeding_id
            
        });

        let updateBreeding = {
            slbreeding_id : slbreeding_id,
            decrease : decrease,
            duration : duration
        }

        let resp2 = await DBsltxlb_shed.DBinsertShedsByLiftBreeding(lbsheds);
        let resp3 = await DBsltx_breeding.DBupdateBreedingProjected([updateBreeding]);

        let result = {
            slliftbreeding_id : resp.slliftbreeding_id,
            sheds : resp2
        }
        console.log("search:::: ", search, lengS)
        if(lengS>1){
            data = await DBsltx_breeding.DBfindBreedingByFilter(search.farm_id,search.breed_id,search.date1,search.date2, search.partnership_id, search.scenario_id);
        }else{
            data = [await DBsltx_breeding.DBfindBreedingById(slbreeding_id)];
        }
        console.log("dataaaaa:::: ",data)
        res.status(200).json({
            statusCode: 200,
            data: data,
            result: result,
            resp_p: resp_p
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.saveProjectionByBreedingProgrammed = async function(req, res) {

    try {
console.log("el body:::: ", req.body)
        let stage_id = req.body.stage_id,
            scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            farm_id = req.body.farm_id,
            programmed_quantity = req.body.programmed_quantity,
            housing_date = req.body.housing_date,
            slbreeding_id = req.body.slbreeding_id,
            decrease = req.body.decrease,
            duration = req.body.duration,
            search = req.body.search,
            lengS = req.body.table,
            sheds = await DBsltxb_shed.DBfindShedByIdBreeding(slbreeding_id),
            sheds_ids = sheds.map(item => item.shed_id),
            data
            start_posture_date = req.body.posture_date;

        let structure = housing_date.split("/");
        let date1 = new Date(structure[2],structure[1]-1,structure[0]);
        console.log("fecha",date1) 
     
        // let process = await DBhigherLayer.DBfindProcessByStageAndBreed(stage_id,breed_id);
        // console.log("datos de proceso", process);

        let demand_birds = programmed_quantity * (1+(decrease/100))
        console.log("result",demand_birds)

        let scheduled_date = addDays(date1,-duration)

        let lbfarm = await DBhigherLayer.DBfindLiftBreadingFarmByRepFarm(farm_id);
        let lbfarm_id = lbfarm[0].farm_id;
        console.log("id lbfarm",farm_id, lbfarm[0].farm_id,sheds,lbfarm_id);

        let lbsheds = await DBhigherLayer.DBfindLiftBreadingShedsByFarm(sheds_ids,lbfarm_id);
        console.log("lbsheds",lbsheds)

        let resp = await DBsltx_liftbreeding.DBinsertProjectionByBreedingProgrammed(stage_id,scenario_id,partnership_id,breed_id,lbfarm_id,
            demand_birds,scheduled_date,slbreeding_id);
        console.log("status projection", resp);

        lbsheds.forEach(position => {

            position.slliftbreeding_id = resp.slliftbreeding_id
            
        });

        let updateBreeding = {
            slbreeding_id : slbreeding_id,
            decrease : decrease,
            duration : duration
        }

        let resp2 = await DBsltxlb_shed.DBinsertShedsByLiftBreeding(lbsheds);
        let resp3 = await DBsltx_breeding.DBupdateBreedingProjected([updateBreeding]);

        let result = {
            slliftbreeding_id : resp.slliftbreeding_id,
            sheds : resp2
        }
        console.log("search:::: ", search, lengS)
        if(lengS>1){
            data = await DBsltx_breeding.DBfindBreedingByFilter(search.farm_id,search.breed_id,search.date1,search.date2, search.partnership_id, search.scenario_id);
        }else{
            data = [await DBsltx_breeding.DBfindBreedingById(slbreeding_id)];
        }
        console.log("dataaaaa:::: ",data)
        res.status(200).json({
            statusCode: 200,
            data: data,
            result: result
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.saveExecutionsByBreedingProjected = async function(req, res) {

    try {

        let executions = req.body.executions;
            

        let resp = await DBsltx_breeding.DBupdateBreeding(executions);

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

exports.saveExecutions = async function(req, res) {

    try {

        let execution = req.body.execution,
            search = req.body.data;
        

        execution.executed = true;
            

        let resp = await DBsltx_breeding.DBupdateBreedingExecuted([execution]);
        console.log("longitud",resp.length)
        if(resp.length>0){

            let resp2 = await DBsltx_breeding.DBfindBreedingByFilter(search.farm_id,search.breed_id,search.date1,search.date2,search.partnership_id, search.scenario_id)

            res.status(200).json({
                statusCode: 200,
                data: resp2
            });
        }else{

            res.status(409).json({
                statusCode: 200,
                error: "No se pudo ejecutar la programacion"
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

exports.findPostureCurveByBreed = async function(req, res) {

    try {

        let breed_id = req.body.breed_id,
            start_posture_day = req.body.start_posture_date;
            //scenario_id = req.body.scenario_id;
            console.log("findPostureCurveByBreed",req.body)
            console.log(breed_id!==null , breed_id!==undefined , breed_id!=="" , start_posture_day!==null , start_posture_day!==undefined , start_posture_day!=="")
        if(breed_id!==null && breed_id!==undefined && breed_id!=="" && start_posture_day!==null && start_posture_day!==undefined && start_posture_day!==""){
            
            let resp = await DBsltx_breeding.DBfindPostureCurveByBreed(breed_id);
                // aDate = start_posture_day.split("-"),
                // copy = new Date(aDate[0],aDate[1]-1,aDate[2]),
                // band = true,
                // i = 0;
                // console.log("length:::", resp.length)
            // while (band === true && i < resp.length) {
            //     console.log("Fecha en el ciclo ",i,copy)
            //     let tmp = await DBincubator.DBfindProjectionByDateAndScenarioForCurve(copy, scenario_id);
            //     // console.log(tmp)
            //     band = band && tmp.length>0;
            //     i++;
            //     copy = addDays(copy, 7);
            // };

            //if(band === true){
                res.status(200).json({
                    statusCode: 200,
                    data: resp
                });
            // }else{
            //     res.status(409).json({
            //         statusCode: 409,
            //         msj: "No se pudo ejecutar porque no existe demanda de huevos para una de las semanas involucradas en la producción"
            //     });
            // }

        
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


exports.findPostureProcessAndCurveByBreed = async function(req, res) {

    try {

        let breed_id = req.body.breed_id,
            stage_id = req.body.stage_id,
            start_posture_day = req.body.start_posture_date,
            status = 500,
            process = [],
            resp = [];


        if(breed_id!==null && breed_id!==undefined && breed_id!=="" && stage_id!==null && stage_id!==undefined && stage_id!=="" && start_posture_day!==null && start_posture_day!==undefined && start_posture_day!==""){
            
            process = await DBhigherLayer.DBfindProcessByStageAndBreed(stage_id, breed_id);
            resp = await DBsltx_breeding.DBfindPostureCurveByBreed(breed_id);
            status = (process.length > 0)?200:409;
            
            res.status(status).json({
                statusCode: status,
                curve: resp,
                process: process
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

exports.existLot = async function(req, res) {

    try {

        let lot = req.body.lot;
            

        let resp = await DBsltx_breeding.DBexistLot(lot);

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

exports.existDemandAndLot = async function(req, res) {

    try {

        let breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            start_posture_date = req.body.start_posture_date,
            lot = req.body.lot;

            console.log("existDemandAndLot", req.body)

        
        let resp = await DBsltx_breeding.DBfindLengthPostureCurveByBreed(breed_id),
            aDate = start_posture_date.split("-"),
            copy = new Date(aDate[0],aDate[1]-1,aDate[2]),
            band = true,
            i = 0;
            console.log("length pc", resp[0].count)
        while (band === true && i < resp[0].count) {
            console.log("Fecha en el ciclo ",i,copy)
            let tmp = await DBincubator.DBfindProjectionByDateAndScenarioForCurve(copy, scenario_id);
            //console.log(tmp)
            band = band && tmp.length>0;
            i++;
            copy = addDays(copy, 7);
        };
            

        let resp2 = await DBsltx_breeding.DBexistLot(lot);

        let validation = {
            lot : resp2.exist,
            start_posture_date : band
        }

        console.log("validation",validation)
        res.status(200).json({
            statusCode: 200,
            data: validation
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};