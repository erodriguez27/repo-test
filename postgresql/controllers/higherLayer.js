const DBlayer = require("../models/higherLayer");
const DBsltx_breeding = require("../models/sltxBreeding");
const DBincubator = require("../models/sltxIncubatorDetail");
const DBbroiler = require("../models/sltxbroiler");
const DBbroiler_det = require("../models/sltxbroiler_detail");
const DBsales_purchases = require("../models/sltxSellsPurchase");
const DBPostureCurve = require("../models/sltxPostureCurve");
// Servicios genericos
async function redactMessage(msj, msg, mss) { 
    let ret = '',
        arr = [];
    arr.push(msj)
    arr.push(msg)
    arr.push(mss)
    await arr.forEach((itm, i) => {
        // console.log(itm)
        if(i!=0){
            // console.log("Aquiii", ret+'\n'+'-'+itm)
            if(ret!== ''){
                ret = ret + '\n' + '-' + itm;
            }else{
                ret = '-' + itm
            }
            // ret = (ret !== ''?itm:ret+'\n'+'-'+itm)
            // console.log("el ret::::", ret)
        }else{
            // console.log("baka shinji", itm)
            ret = '-' + itm
        }
    });

    console.log(ret)

    return ret;
}
exports.findScenarioBreedAndFarms = async function (req, res) {

    try {
        let scenarios,
            stage_id = req.body.stage_id,
            stage, scenarios_all = []; 
        


        switch (stage_id) {
            case 1: stage = "sltxbreeding"
                    scenarios_all = await DBlayer.DBfindAllScenario();
                
                break;
        
            case 2: stage = "sltxliftbreeding"
                
                break;
        
            case 3: stage = "sltxposturecurve"
                
                break;
        
            case 4: stage = "sltxsellspurchase"
                    scenarios_all = await DBlayer.DBfindAllScenario();
                
                break;
        
            case 5: stage = "sltxposturecurve"
                
                break;
        
            case 6: stage = "sltxincubator"
                
                break;
        
            case 7: stage = "sltxbroiler"
                
                break;
        }

        if(stage_id == 6){

            scenarios = await DBlayer.DBfindAllScenariosProgrammedForIncubator(stage);

        }
        else {

            if(stage_id == 7){

                scenarios = await DBlayer.DBfindAllScenariosProgrammedForBroiler(stage);
    
            }
            else{
            
                scenarios = await DBlayer.DBfindAllScenariosProgrammed(stage);
    
            }


        }

        if(scenarios.length===0){
            scenarios = await DBlayer.DBfindScenarioActive(); 
        }
        
        let lots = await DBPostureCurve.DBfindPostureCurveLot(scenarios[0].scenario_id, null, null);
        let breed = await DBlayer.DBfindBreed();
        let farms = await DBlayer.DBfindFarmByPartnership(req.body.partnership_id, req.body.farm_type_id);
        if (req.body.farm_type_id === 2) {
            let partition = await DBlayer.DBfindActiveEvictionPartition(),
                broiler_decrease = await DBlayer.DBfindProcessByIncStage(1),
                gender_class = await DBlayer.DBfindfindGenderClByGender(req.body.gender),
            res_status = 500,
                msgPart = '',
                msgProc = '',
                msgClas = '';

            console.log("partition:::", partition);
            console.log("broiler_decrease:::", broiler_decrease);
            if (broiler_decrease.length <= 0 || partition.length <= 0 || gender_class.length <= 0) {

                res_status = 409;
                msgPart = (partition.length > 0) ? "" : "No se encontró partición de desalojo activa. ";
                msgProc = (broiler_decrease.length > 0) ? "" : "No existe proceso de engorde. ";
                msgClas = (gender_class.length > 0) ? "" : "No existe clasificación de sexaje. "

                res.status(res_status).json({
                    statusCode: res_status,
                    msgPart: msgPart,
                    msgProc: msgProc,
                    msgClas: msgClas,
                });
            }else{
                res.status(200).json({
                    statusCode: 200,
                    scenarios: scenarios,
                    breed: breed,
                    farms: farms
                });
            }

        }else{

            res.status(200).json({
                statusCode: 200,
                scenarios: scenarios,
                scenarios_all: scenarios_all,
                lots: lots,
                breed: breed,
                farms: farms
            });
        }



    } catch (err) {
        console.log("error en findScenarioBreedAndFarms", err);

        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findAllScenariosProgrammedByStage = async function(req, res) {
    try {

        let stage_id = req.body.stage_id,
            stage,
            data;

        switch (stage_id) {
            case 1: stage = "sltxbreeding"
                
                break;
        
            case 2: stage = "sltxliftbreeding"
                
                break;
        
            case 3: stage = "sltxposturecurve"
                
                break;
        
            case 4: stage = "sltxsellspurchase"
                
                break;
        
            case 5: stage = "sltxposturecurve"
                
                break;
        
            case 6: stage = "sltxincubator"
                
                break;
        
            case 7: stage = "sltxbroiler"
                
                break;
        }

        if(stage_id === 6){

            data = await DBlayer.DBfindAllScenariosProgrammedForIncubator(stage);

        }
        else {

            if(stage_id === 7){

                data = await DBlayer.DBfindAllScenariosProgrammedForBroiler(stage);
    
            }
            else{
            
                data = await DBlayer.DBfindAllScenariosProgrammed(stage);
    
            }


        }

        if(data.length===0){
            data = await DBlayer.DBfindScenarioActive(); 
        }
                   
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log("error en findShedsByFarmAndAvailability:::: ",err);
        res.status(500).send(err);
    }
};

exports.findShedsByFarmAndAvailability = async function(req, res) {
    try {
        let data = [];

        if(req.body.eng !== null && req.body.eng !== undefined){
            data = await DBlayer.DBfindShedsByFarmAndAvailabilityB(req.body.farm_id);
        }else{
            data = await DBlayer.DBfindShedsByFarmAndAvailability(req.body.farm_id);
        }

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log("error en findShedsByFarmAndAvailability:::: ",err);
        res.status(500).send(err);
    }
};

exports.findIncPlantByPartnership = async function(req, res) {
    
        try {
            let data  = await DBlayer.DBfindIncPlantByPartnership(req.body.partnership_id);
            console.log("data -> ",data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        } catch (err) {
        //   console.log(err);
            res.status(500).send(err);
        }
    };
exports.findBreed = async function(req, res) {
        try {
            let data  = await DBlayer.DBfindBreed();
            console.log("data -> ",data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        } catch (err) {
        //   console.log(err);
            res.status(500).send(err);
        }
    };
exports.findBreedForGenderClass = async function(req, res) {
        try {
            let data  = await DBlayer.DBfindBreedForGenderClass();
            console.log("data -> ",data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        } catch (err) {
        //   console.log(err);
            res.status(500).send(err);
        }
    };

exports.deleteByStage = async function (req, res) {
    try {
        let stage_id = req.body.stage_id,
            slbreeding_id = req.body.slbreeding_id,
            slincubator_detail_id = req.body.slincubator_detail_id,
            slbroiler_detail_id = req.body.lot,
            scenario_id = req.body.scenario_id;

        if ((stage_id != undefined && stage_id != null) && (slbreeding_id != undefined || slbreeding_id != null || slincubator_detail_id != undefined || slincubator_detail_id != null || slbroiler_detail_id != undefined || slbroiler_detail_id != null)) {
            let resp,
                status=200,
                message = "",
                data = [],
                lots = [];
            switch (stage_id) {
                case 1:
                    let beginning = req.body.beginning,
                        ending = req.body.ending,
                        gender = req.body.gender;
                    resp = await DBlayer.DBbroiler_delete_cascade(slbroiler_detail_id);
                    data = await DBbroiler_det.DBfindBroilerDetailByWeek(beginning, ending, gender, scenario_id);
                    lots = await DBbroiler.DBfindBroilerDailyLots(beginning, ending, gender, scenario_id);
                    let sells = await DBsales_purchases.DBgetSalesByWeek(beginning, ending, scenario_id),
                        c_sell =sells[0].quantity, i = 0;
                        while (i < lots.length && c_sell > 0) {
                            if (lots[i].quantity > 0) {
                                if (lots[i].quantity - c_sell > 0) {
                                    lots[i].quantity = lots[i].quantity - c_sell;
                                    c_sell = 0;
                                } else {
                                    c_sell = c_sell - lots[i].quantity;
                                    lots[i].quantity = 0;
                                }
                            }
                            i++;
                        }
                    lots = lots.filter(item => (item.lot[0]==='A'&&item.quantity>0)||item.lot[0]!=='A');

                    break;
                case 2:
                    let incubator_id = req.body.incubator_id;
                    resp = await DBlayer.DBincubator_delete_cascade(slincubator_detail_id);
                    data = await DBincubator.DBfindProgrammedByIncId(incubator_id);
                    break;
                case 3:
                    let search = req.body.search;
                    resp = await DBlayer.DBproduction_delete_cascade(slbreeding_id);
                    data = await DBsltx_breeding.DBfindBreedingByFilter(search.farm_id,search.breed_id,search.date1,search.date2, search.partnership_id, search.scenario_id);
                    break;
            }

            if(resp.deleted===true){
                status = 200;
                message = "Eliminación exitosa"
            }else{
                status = 304;
                message = "No se puede eliminar el registro porque influye sobre una programación de engorde que ya ha sido sincronizada"
            }


            console.log(status, message)
            res.status(status).json({
                statusCode: status,
                data: data,
                msg : message,
                lots: lots
            });

        } else {
            res.status(204).json({
                statusCode: 204,
                error_msg: "Error no se recibió data en la solicitud"
            });
        }

    } catch (err) {
          console.log(err);
        res.status(500).send(err);
    }
};

// Controllers para servicios de la tabla slmdprocess

exports.findStageByBreedAvailable= async function(req, res) { //Busco las etapas que no tengan alguna raza sin asignar

    try{

        let data = await DBlayer.DBfindStageByBreedAvailable();
        console.log("La data recibida despues de consultar::: ",data)
        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findStageByBreedAvailable",err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};
exports.findBreedByStageid= async function(req, res) { //Busco las razas disponibles para la etapa seleccionada

    try{
        let stage_id = req.body.stage_id;

        if(stage_id!= undefined && stage_id!==null){
            let data = await DBlayer.DBfindBreedByStageid(stage_id);
            console.log("La data recibida despues de consultar::: ",data)
            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            res.status(500).json({
                statusCode: 500
            }); 
        }


    }catch (err) {
        console.log("error en findBreedByStageid",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.addProcess= async function(req, res) {

    try{
        // records: [{name,stage_id,breed_id,decrease,duration_process,sync_considered}]
        console.log("Recibe esto en el BackEnd addProcess: ");
        console.log(req.body);
        let records = req.body.records;

        if(records.length>0){

            await DBlayer.DBaddProcess(records);
            console.log("Pase la insercion")
            let data = await DBlayer.DBfindAllProcess();
            console.log("La data recibida despues de insertar::: ",data)
            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }


    }catch (err) {
        console.log("error en addProcess",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findAllProcess= async function(req, res) {

    try{

        let data = await DBlayer.DBfindAllProcess();
        console.log("La data recibida despues de consultar::: ",data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findAllProcess",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findProcessByStageAndBreed= async function(req, res) {

    try{
        let breed_id = req.body.breed_id,
            stage_id = req.body.stage_id;
            
        let data = await DBlayer.DBfindProcessByStageAndBreed(stage_id, breed_id);

        if(data.length > 0){
            res.status(200).json({
                statusCode: 200,
                data: data[0]
            });
        }
        else{
            res.status(409).json({
                statusCode: 409
            });
            
        }


    }catch (err) {
        console.log("error en findAllProcess",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findProcessByIncStage= async function(req, res) {

    try{
        let stage_id = req.body.stage_id;
            
        let data = await DBlayer.DBfindProcessByIncStage(stage_id),
            decrease = 0.0,
            duration_process = 0;

        data.forEach(itm => {
            decrease = decrease + itm.decrease;
            duration_process = duration_process + itm.duration_process;
        });

        decrease = parseFloat((decrease/data.length).toFixed(2));
        duration_process = parseInt( Math.ceil( ( duration_process/data.length ).toFixed(2) ) );
        data = {
            decrease: decrease,
            duration_process: duration_process 
        };

        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findProcessByIncStage",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateProcess= async function(req, res) {

    try{
        let record = req.body.records;


        // let cs = Object.keys(record[0]); //Estas linea es para sacar los nombres de las columnas
        // cs[0]='?'+cs[0];  //esta otra es para asignarle a la del id el ? para poder comparar en la query
        if(record!=undefined && record.length>0){
            record[0].decrease= parseFloat(record[0].decrease)
            await DBlayer.DBupdateProcess(record);
            // await DBlayer.DBupdateProcess(cs,record);
            let data = await DBlayer.DBfindAllProcess();
            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            res.status(500).json({
                statusCode: 500
            }); 
        }


    }catch (err) {
        console.log("error en updateProcess",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};
exports.updateDeletedProcess= async function(req, res) {

    try{
        let slprocess_id = req.body.slprocess_id;

        if(slprocess_id!=undefined && slprocess_id!=null){
            let record = [{slprocess_id:slprocess_id, sl_disable:true}];
            await DBlayer.DBupdateDeletedProcess(record);

            let data = await DBlayer.DBfindAllProcess();
            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{

            res.status(500).json({
                statusCode: 500
            }); 

        }


    }catch (err) {
        console.log("error en updateDeletedProcess",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


// Controllers para servicios de la tabla slmdmachinegroup

exports.findAllMachineGroup= async function(req, res) {

    try{
        let partnership_id = req.body.partnership_id;
        let data = await DBlayer.DBfindAllMachineGroup(partnership_id); 
        console.log("La data recibida despues de consultar::: ",data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findAllMachineGroup",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findMachineGroupByDayOfWork= async function(req, res) {

    try{
        let partnership_id = req.body.partnership_id,
            date = req.body.date,
            aDate = date.split("-"),
            nDate = new Date (aDate[0],aDate[1]-1,aDate[2]),
            aDays = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"]
            day = aDays[nDate.getDay()];
            console.log("fecha:::: ", nDate)
            console.log("dia:::: ", day)
            console.log("partnership_id:::: ", partnership_id)
        let data = await DBlayer.DBfindMachineGroupByDayOfWork(partnership_id, nDate, day); 
        console.log("La data recibida despues de consultar::: ",data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findAllMachineGroup",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.addMachineGroup= async function(req, res) {

    try{
        
        console.log("Recibe esto en el BackEnd addProcess: ");
        console.log(req.body);
        let records = req.body.records;
        let partnership_id = req.body.partnership_id;
        if(records.length>0){

            await DBlayer.DBaddMachineGroup(records);
            console.log("Pase la insercion")

            let data = await DBlayer.DBfindAllMachineGroup(partnership_id);
            console.log("La data recibida despues de insertar::: ",data)

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }


    }catch (err) {
        console.log("error en addMachineGroup",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateMachineGroup= async function(req, res) {

    try{
        let record = req.body.records;
        let partnership_id = req.body.partnership_id;
        if(record!=undefined && record.length>0){

            await DBlayer.DBupdateMachineGroup(record);

            let data = await DBlayer.DBfindAllMachineGroup(partnership_id);

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            res.status(500).json({
                statusCode: 500
            }); 
        }


    }catch (err) {
        console.log("error en updateMachineGroup",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateDeletedMachineGroup= async function(req, res) {

    try{
        let slmachinegroup_id = req.body.slmachinegroup_id;
        let partnership_id = req.body.partnership_id;
        if(slmachinegroup_id!=undefined && slmachinegroup_id!=null){

            let record = [{slmachinegroup_id:slmachinegroup_id, sl_disable:true}];

            await DBlayer.DBupdateDeletedMachineGroup(record);

            let data = await DBlayer.DBfindAllMachineGroup(partnership_id);

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            console.log("Error, aqui esta el body",req.body)
            res.status(500).json({
                statusCode: 500
            }); 

        }


    }catch (err) {
        console.log("error en updateDeletedMachineGroup",err);

        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

// Controllers para servicios de la tabla slmdgenderclassification
// "slgenderclassification_id", "name", "gender", "breed_id", "weight_gain", "age", "mortality", "sl_disable"

exports.findAllGenderCl= async function(req, res) {

    try{

        let data = await DBlayer.DBfindfindAllGenderCl();
        console.log("La data recibida despues de consultar::: ",data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findfindAllGenderCl",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.addGenderCl= async function(req, res) {

    try{
        
        console.log("Recibe esto en el BackEnd addProcess: ");
        console.log(req.body);
        let records = req.body.records;

        if(records.length>0){

            await DBlayer.DBaddGenderCl(records);
            console.log("Pase la insercion")

            let data = await DBlayer.DBfindfindAllGenderCl();
            console.log("La data recibida despues de insertar::: ",data)

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }


    }catch (err) {
        console.log("error en addGenderCl",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateGenderCl= async function(req, res) {

    try{
        let record = req.body.records;

        if(record!=undefined && record.length>0){

            await DBlayer.DBupdateGenderCl(record);

            let data = await DBlayer.DBfindfindAllGenderCl();

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            res.status(500).json({
                statusCode: 500
            }); 
        }


    }catch (err) {
        console.log("error en updateGenderCl",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateDeletedGenderCl= async function(req, res) {

    try{
        let slgenderclassification_id = req.body.slgenderclassification_id;
        
        if(slgenderclassification_id!=undefined && slgenderclassification_id!=null){

            let record = [{slgenderclassification_id:slgenderclassification_id, sl_disable:true}];

            await DBlayer.DBupdateDeletedGenderCl(record);

            let data = await DBlayer.DBfindfindAllGenderCl();

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            console.log("Error, aqui esta el body",req.body)
            res.status(500).json({
                statusCode: 500
            }); 

        }


    }catch (err) {
        console.log("error en updateDeletedGenderCl",err);

        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

// Controllers para servicios de la tabla slmdevictionpartition 
// ["slevictionpartition_id", "youngmale", "oldmale", "peasantmale", "youngfemale", "oldfemale", "active", "sl_disable"]

exports.findAllEvictionPartition= async function(req, res) {

    try{

        let data = await DBlayer.DBfindfindAllEvictionPartition();
        console.log("La data recibida despues de consultar::: ",data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });


    }catch (err) {
        console.log("error en findfindAllEvictionPartition",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.addEvictionPartition= async function(req, res) {

    try{
        
        console.log("Recibe esto en el BackEnd addProcess: ");
        console.log(req.body);
        let records = req.body.records;

        if(records.length>0){

            await DBlayer.DBaddEvictionPartition(records);
            console.log("Pase la insercion")

            let data = await DBlayer.DBfindfindAllEvictionPartition();
            console.log("La data recibida despues de insertar::: ",data)

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }


    }catch (err) {
        console.log("error en addEvictionPartition",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateEvictionPartition= async function(req, res) {

    try{
        let record = req.body.records;

        if(record!=undefined && record.length>0){

            await DBlayer.DBupdateEvictionPartition(record);

            let data = await DBlayer.DBfindfindAllEvictionPartition();

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            res.status(500).json({
                statusCode: 500
            }); 
        }


    }catch (err) {
        console.log("error en updateEvictionPartition",err);
        
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateDeletedEvictionPartition= async function(req, res) {

    try{
        let slevictionpartition_id = req.body.slevictionpartition_id;
        
        if(slevictionpartition_id!=undefined && slevictionpartition_id!=null){

            let record = [{slevictionpartition_id:slevictionpartition_id, sl_disable:true}];

            await DBlayer.DBupdateDeletedEvictionPartition(record);

            let data = await DBlayer.DBfindfindAllEvictionPartition();

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            console.log("Error, aqui esta el body",req.body)
            res.status(500).json({
                statusCode: 500
            }); 

        }


    }catch (err) {
        console.log("error en updateDeletedEvictionPartition",err);

        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateActiveEvictionPartition= async function(req, res) {

    try{
        let slevictionpartition_id = req.body.slevictionpartition_id,
            active = req.body.active;
        
        if(slevictionpartition_id!=undefined && slevictionpartition_id!=null){

            let record = [{slevictionpartition_id:slevictionpartition_id, active:active}];

            await DBlayer.DBupdateActiveEvictionPartition(record);
            if(active===true){
                await DBlayer.DBupdateNotActivePartitions(slevictionpartition_id, false);
            }

            let data = await DBlayer.DBfindfindAllEvictionPartition();

            console.log("La data recibida despues de consultar::: ",data);

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        }else{
            
            res.status(500).json({
                statusCode: 500
            }); 

        }


    }catch (err) {
        console.log("error en updateActiveEvictionPartition ",err);

        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};