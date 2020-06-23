const DBlayer = require("../models/housingWayDetail");
const DB_housingWay = require("../models/housingWay");
const DB_process = require("../models/process");
const DB_postureCurve = require("../models/postureCurve");
const BD_scenarioPostureCurve = require("../models/scenarioPostureCurve");
const DB_eggsPlanning = require("../models/eggsPlanning");
const DBincubatorPlant = require("../models/incubatorPlant");
const DBeggsStorage = require("../models/eggsStorage");
const DB_shed = require("../models/shed");

const status_disponible= 1;
const status_ocupado= 2;
const status_vacio= 3;
const status_inhabiliado= 4;
const status_reservado= 5;

exports.DBfindHousingWayDetByHw = function(req, res) {

    console.log("entro en lo que quiero ver hoy hoy");
    console.log(req.body.housing_way_id);


    let arr = req.body.records;
    console.log("arr");
    console.log(arr);
    let long = arr.length;
    console.log("long");
    console.log(long);

    // DBlayer.DBfindHousingWayDetByHw222(req.body.housing_way_id)
    DBlayer.DBfindHousingWayDetByHw(arr, long)
        .then(function(data) {
            console.log("la data");
            console.log(data);

            let residue_programmed = 0;
            data.forEach(item => {
                residue_programmed += item.scheduled_quantity;
            });
            console.log("residue_programmed: ", residue_programmed);
            res.status(200).json({
                statusCode: 200,
                data: data,
                residue: residue_programmed
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.DBfindHousingWayDetByHw2 = function(req, res) {

    console.log("entro en lo que quiero ver hoy hoy con el 2");
    console.log(req.body.housing_way_id);




    DBlayer.DBfindHousingWayDetByHw(req.body.housing_way_id)
        .then(function(data) {

            let residue_programmed = 0;
            data.forEach(item => {
                residue_programmed += item.scheduled_quantity;
            });
            console.log("residue_programmed: ", residue_programmed);
            res.status(200).json({
                statusCode: 200,
                data: data,
                residue: residue_programmed
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};


exports.DBfindHousingWayDetByHwdId = function(req, res) {
    console.log("entre por id");
    console.log(req.body);
    console.log("despues del body");
    let partnership = req.body.partnership_id;
    console.log("la partnership ",partnership);
    DBlayer.DBfindHousingWayDetByHwdId(req.body.housing_way_id)
        .then(async function(data) {
            let incP = await DBincubatorPlant.DBfindIncPlantByPartnetship(partnership);
            console.log("las incubator plants ",incP);
            console.log("data",data);
            console.log("creo el available");
            data[0]["available"] = (data[0]["execution_date"]=== null && (data[0]["execution_quantity"]=== null || results[0]["execution_quantity"]<= 0) && data[0]["executedfarm_id"]=== null && data[0]["executedcenter_id"]=== null&& data[0]["executedshed_id"]=== null)? true: false;
            console.log("termino de crear el available");
            let residue_programmed = 0;
            data.forEach(item => {
                residue_programmed += item.scheduled_quantity;
            });
            console.log("residue_programmed: ", residue_programmed); 
            console.log(data);
            res.status(200).json({
                statusCode: 200,
                data: data,
                residue: residue_programmed,
                incubatorPlant: incP
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};


async function createLotCyL(scenario_id){
    let lot = "C1";
    let lote = await DBlayer.DBfindMaxLotCyL(scenario_id);
    console.log("el ultimo lote");
    console.log(lote.max);
    if(lote.max != null)
    {
    // let prefijo = (lote.max).substr(0,1)
        let numeracion = parseInt((lote.max));
        // console.log("prefijo")
        // console.log(prefijo)
        console.log(numeracion);
        numeracion++;
        console.log(numeracion);
        lot = "C"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
  
    return lot;
}

async function createLotProd(scenario_id){
    let lot = "P1";
    let lote = await DBlayer.DBfindMaxLotProd(scenario_id);
    console.log("el ultimo lote");
    console.log(lote.max);
    if(lote.max != null)
    {
    // let prefijo = (lote.max).substr(0,1)
        let numeracion = parseInt((lote.max));
        // console.log("prefijo")
        // console.log(prefijo)
        console.log(numeracion);
        numeracion++;
        console.log(numeracion);
        lot = "P"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
  
    return lot;
}

exports.addHousingWayDetail = async function(req, res) {
    try {
      
        let stage_id = parseInt(req.body.liftBreedingStage),
            scenario_id = req.body.scenario_id;
        console.log("stage_id");
        console.log(stage_id);

        let detail  = await DBlayer.DBaddHousingWayDetail(req.body.records[0].housing_way_id,
            req.body.scheduled_date, req.body.records.reduce((result, act) => result + act.quantity, 0), req.body.farm_id,
            req.body.shed_id, req.body.center_id, req.body.confirm, req.body.incubator_plant_id);
            let rehous = await DB_shed.DBupdateRehousingShed(req.body.shed_id,false);
        console.log("lo retornado despues de guardar");
        console.log(detail.housingway_detail_id);
        for (const record of req.body.records) {
            let ins = await DBlayer.DBaddHousingWayLot(detail.housingway_detail_id, record.housing_way_id, record.quantity, stage_id);

        }

        let shed= await DB_shed.DBupdateStatusShed(req.body.shed_id, status_reservado);
        /* if (shed.length>0) {
          // let dd= new Date(shed[0].act_date);
          let dd= new Date(req.body.scheduled_date);
          dd.setDate(dd.getDate()+shed[0].rotation_days);
          DB_shed.DBupdateAvaliableDateShed(shed[0].shed_id, dd);
      } */
        // console.log("DEtail: ", detail);


        if(stage_id==5)
        {
            let lotenew = await createLotCyL(scenario_id);
            console.log("lote new");
            console.log(lotenew);
            let updateLot = await DBlayer.DBupdateLot(lotenew, detail.housingway_detail_id);
        }
        if (stage_id==3) 
        {
            let lotenew = await createLotProd(scenario_id);
            console.log("lote new");
            console.log(lotenew);
            let updateLot = await DBlayer.DBupdateLot(lotenew, detail.housingway_detail_id);
        }
        // else
        // {
        //   let respPredecessor = await DBlayer.DBfindPredecessor(req.body.housing_way_id);
        //   console.log("respPredecessor: ", respPredecessor[0].predecessor_id);
        //   let respLot = await DBlayer.DBfindLot(respPredecessor[0].predecessor_id);
        //   console.log("respLot: ", respLot[0].lot);
        //   let updateLot = await DBlayer.DBupdateLot(lotenew , detail.housingway_detail_id);
        // }
        console.log(req.body.records.map(record => record.housing_way_id));
        let data = await DBlayer.DBfindHousingWayDetByHw(req.body.records.map(record => record.housing_way_id), req.body.records.length);

        let residue_programmed = 0;
        data.forEach(item => {
            residue_programmed += item.scheduled_quantity;
        });


        res.status(200).json({
            statusCode: 200,
            data: data,
            residue: residue_programmed
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }

};

function addDays(nDate, nDay){
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

function calculateAnnualPostureCurve(records, breed_id){
    return new Promise((resolve, reject)=>{

        let month = records[0].posture_date.getMonth()+1;
        let year = records[0].posture_date.getFullYear();

        let sumMonth = 0,
            planned_eggs = [];
        records.forEach((item,i)=>{
            let band = false;
            if((month==item.posture_date.getMonth()+1) && (year==item.posture_date.getFullYear()) ){
                sumMonth += item.eggs;
                band = true;
                //console.log("Fecha: ",item.posture_date ,"item.eggs: ", item.eggs, "sumMonth: ", sumMonth);
            }else{

                let obj = {};
                obj.scenario_id = item.scenario_id;
                obj.year_planning = year;
                obj.month_planning = month;
                obj.planned = sumMonth;
                obj.breed_id = breed_id;
                planned_eggs.push(obj);
                //console.log("Mes insertado");

                month = item.posture_date.getMonth()+1;
                year = item.posture_date.getFullYear();
                sumMonth = item.eggs;
                //console.log("item.eggs: ", item.eggs, "sumMonth: ", sumMonth);
            }

            if(i == (records.length - 1 )){
                let obj2 = {};
                obj2.scenario_id = item.scenario_id;
                obj2.year_planning = year;
                obj2.month_planning = month;
                obj2.planned = sumMonth;
                obj2.breed_id = breed_id;
                planned_eggs.push(obj2);
                //console.log("Ultimo - item.eggs: ", item.eggs, "sumMonth: ", sumMonth);
            }
        });
        //console.log("planned: ", planned_eggs);
        resolve(planned_eggs);

    });

}

exports.updateHousingWayDetail = async function(req, res) {

    console.log("el body ",req.body);

    //console.log(JSON.parse(req.body));
    //console.log(req.body.records[0].housingway_detail_id);
    console.log(typeof req.body.scenario_id);
    let records = req.body.records,
        stage_id = req.body.stage_id,
        housing_way_id = req.body.housing_way_id,
        housingwaydetail_id = records[0].housingway_detail_id,
        pDate = records[0].execution_date.split("/"),
        scenario_id = req.body.scenario_id;
    if(pDate.length==3){
        var nDate = `${pDate[0]}-${pDate[1]}-${pDate[2]}`;
        console.log(nDate);
        records[0].execution_date = nDate;
    }
    console.log(records[0].sales_quantity);
    console.log("housing_way_id: ", housing_way_id, " stage_id: "+ stage_id);
    console.log(housingwaydetail_id);
    try {

        //Dependiendo del process_class_id debemos insertar un nuevo registro a la siguiente etapa
        switch (stage_id) {
        case 1:
            //Engorde

            console.log("Reproduccion: ", records);
            for(let i = 0; i < records.length; i++){
                if(records[i].execution_date !== null ){

                    let aDate = records[i].execution_date.split("-");
                    records[i].execution_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
                    let updateHW = await DBlayer.DBupdateHousingWayDetail(records[i].execution_date,records[i].execution_quantity,records[i].housingway_detail_id, records[i].executionfarm_id, records[i].executioncenter_id,records[i].executionshed_id);
                    let shed= await DB_shed.DBupdateStatusShed(records[i].executionshed_id, status_ocupado);
                }
            }

            break;

        case 2:
            //Incubacion

            break;

        case 3:
            //Reproduccion

            //console.log("Reproduccion: ", records);
            for(let i = 0; i < records.length; i++){
                if(records[i].execution_date !== null ){

                    let aDate = records[i].execution_date.split("-");
                    records[i].execution_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
                    try
                    {
                        let oldshed= await DBlayer.DBgetOldShed(records[i].housingway_detail_id);
                        await DBlayer.DBupdateHousingWayDetail(records[i].execution_date,records[i].execution_quantity,records[i].housingway_detail_id, records[i].executionfarm_id, records[i].executioncenter_id,records[i].executionshed_id);
                        let rehous = await DB_shed.DBupdateRehousingShed(records[i].executionshed_id,false);
                        let shed= await DB_shed.DBupdateStatusShed(records[i].executionshed_id, status_ocupado);//actualiza el status del galpon
                        if (shed.length>0) {//si se actualizo el status, ahora actualzia la fecha de disponibilidad
                            let dd= new Date(records[i].execution_date);
                            dd.setDate(dd.getDate()+shed[0].rotation_days);
                            DB_shed.DBupdateAvaliableDateShed(shed[0].shed_id, dd);//actualiza la fecha 
                        }

                        if(oldshed[i].shed_id!= shed[i].shed_id){
                            DB_shed.DBforceFreeShedById(oldshed[i].shed_id);
                        }


                        //obtener el galpon predecesor
                        let shed_id= await DBlayer.DBgetPredecesorShed(records[i].housingway_detail_id);
                        DB_shed.DBupdateStatusShed(shed_id[0].executionshed_id, status_vacio);
                    }catch(err){
                        console.log("el catch" + err);
                    }

                    //Buscar todos los datos del registro actualizado
                    let recordHWD = await DBlayer.DBfindHousingWayDetailById(records[i].housingway_detail_id);
                    console.log("recordHWD: ", recordHWD);

                    //Buscar los datos de la planta de almacenamiento del resgistro que se actualizo
                    let recordPlant = await DBincubatorPlant.DBfindIncPlantById(recordHWD[0].incubator_plant_id);
                    console.log("recordPlant: ", recordPlant);

                    let aBreed_id = await DB_housingWay.DBfindBreedByHousingWay(records[i].housing_way_id),
                        breed_id = aBreed_id[0].breed_id;
                    console.log("hoy 1");

                    let aPostureCurve = await DB_postureCurve.DBfindCurveByBreed(breed_id);
                    console.log("hoy 2");

                    //Paso de la curva Semanal a diaria
                    let aPostureCurveByDay = [];
                    aPostureCurve.forEach(item => {
                        let day = item.theorical_performance/7;
                        let objDay = {
                            "theorical_performance": day
                        };
                        aPostureCurveByDay.push(objDay,objDay,objDay,objDay,objDay,objDay,objDay);

                    });

                    console.log(aPostureCurveByDay.length);
                    //fin

                    let newCurve = [];

                    let initDate = new Date(aDate[2], aDate[1]-1, aDate[0]);

                    for(let j = 0; j<aPostureCurveByDay.length; j++){
                        let obj = {};
                        let nDate = new Date(initDate.getTime());
                        obj.posture_date = `${nDate.getFullYear()}-${nDate.getMonth()+1}-${nDate.getDate()}`;
                        obj.eggs = aPostureCurveByDay[j].theorical_performance;
                        obj.scenario_id = scenario_id;
                        obj.housingway_detail_id = records[i].housingway_detail_id;
                        obj.breed_id = breed_id;
                        newCurve.push(obj);
                        initDate = addDays(initDate, 1);
                    }
                    //console.log("NewCurve: ", newCurve);
                    let insertPostureCurve = await BD_scenarioPostureCurve.DBaddPostureCurve(newCurve);
                    //Si la longitud es cero matar el proceso y decir que no existe la curva la postura para la raza
                    console.log("hoy 3");

               
                    let aScenarioPostureCurve = await BD_scenarioPostureCurve.DBfindPostureCurveByScenario(scenario_id, breed_id);
                    console.log("hoy 4");
                    let annualPostureCurve = await calculateAnnualPostureCurve(aScenarioPostureCurve, breed_id);
                    console.log("hoy 5");
                    //console.log("annualPostureCurve: ", annualPostureCurve);
                    let deletePostureCurve = await DB_eggsPlanning.DBdeleteEggsPlanningByScenario(scenario_id, breed_id);
                    console.log("hoy 6");
                    let insertScenarioPostureCurve = await DB_eggsPlanning.DBaddPlannedEggs(annualPostureCurve);
                    console.log("hoy 7");

                    //Insertar los almacenamientos de cada registro de la curva anual de postura
                    // console.log("recordPlant: ", recordPlant);
                    let storage = recordPlant[0].min_storage,
                        storageData = [];
                    //console.log("newCurve: ", newCurve);
                    console.log("LA LONGITUD DE LA CURVA DE POSTURA");
                    console.log(newCurve.length);
                    for(let j = 0; j<newCurve.length; j++){
                        //console.log("storage: ", storage);
                        //console.log("newCurve[j].posture_date: ", newCurve[j].posture_date);
                        let aDateAPC = newCurve[j].posture_date,
                            aaDateAPC = aDateAPC.split("-");
                        let newDateAPC = new Date(aaDateAPC[0],aaDateAPC[1]-1,aaDateAPC[2]),
                            addDateAPC = addDays(newDateAPC, storage);

                        let obj3 = {};
                        obj3.incubator_plant_id = recordHWD[0].incubator_plant_id;
                        obj3.scenario_id = newCurve[j].scenario_id;
                        obj3.breed_id = newCurve[j].breed_id;
                        obj3.init_date = newCurve[j].posture_date;

                        //console.log("*********** ", aDateAPC, newDateAPC, addDateAPC);
                        obj3.end_date = `${addDateAPC.getFullYear()}-${addDateAPC.getMonth()+1}-${addDateAPC.getDate()}`;
                        let lote = recordHWD[0].lot;
                        lote = lote.substring(1);
                        let nro = (j+1).toString();
                        nro = nro.padStart(3, 0);
                        let lote1 = "H"+lote + "-"+ nro;
                        console.log(lote1);

                        obj3.lot = lote1;
                        //console.log(newCurve[j].eggs, records[i].execution_quantity);
                        obj3.eggs = newCurve[j].eggs*records[i].execution_quantity;
                        storageData.push(obj3);
                    }
                    //console.log("storageData: ", storageData);
                    let insertEggsStorage = await DBeggsStorage.DBaddEggsStorage(storageData);


                }

            }
            break;

        case 5:
            //Cria y levante
            console.log("Levante y Cria");
            /*records.forEach(item => {
              console.log("item.execution_date: ", item);
              if(item.execution_date !== null){
                let aDate = item.execution_date.split("-");
                item.execution_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
              }
            });*/
            for(let i = 0; i < records.length; i++){
                if(records[i].execution_date !== null ){

                    let aDate = records[i].execution_date.split("-");
                    records[i].execution_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
                    console.log("sales: ", records[i].sales_quantity);
                    let oldshed= await DBlayer.DBgetOldShed(records[i].housingway_detail_id);
                    await DBlayer.DBupdateHousingWayDetail(records[i].execution_date,records[i].execution_quantity,records[i].housingway_detail_id, records[i].executionfarm_id, records[i].executioncenter_id,records[i].executionshed_id );
                    let rehous = await DB_shed.DBupdateRehousingShed(records[i].executionshed_id,false);
                    let shed= await DB_shed.DBupdateStatusShed(records[i].executionshed_id, status_ocupado);//actualiza el status del galpon
                    if (shed.length>0) {//si se actualizo el status, ahora actualzia la fecha de disponibilidad
                        let dd= new Date(records[i].execution_date);
                        dd.setDate(dd.getDate()+shed[0].rotation_days);
                        DB_shed.DBupdateAvaliableDateShed(shed[0].shed_id, dd);//actualiza la fecha 
                    }

                    if(oldshed[i].shed_id!= shed[i].shed_id){
                        DB_shed.DBforceFreeShedById(oldshed[i].shed_id);
                    }

                    let abreed_id = await DB_housingWay.DBfindBreedByHousingWay(records[i].housing_way_id);
                    //console.log(abreed_id);
                    let breed_id = abreed_id[0].breed_id;
                    //console.log(stage_id, breed_id);
                    let info = await DB_process.DBfindProcessByStageBreed(stage_id, breed_id, abreed_id[0].scenario_id) ;
                    console.log("Info: ", info);
                    let execution_quantity = records[i].execution_quantity - (records[i].execution_quantity * (info[0].decrease_goal/100));
                    //console.log("execution_quantity: ", execution_quantity);
                    let new_date = new Date(aDate[2], aDate[1]-1, aDate[0]);
                    console.log(new_date);
                    let next_date = addDays(new_date , info[0].duration_goal);
                    console.log("next day: ", new_date, " ", info[0].duration_goal);
                    let final_date = `${next_date.getFullYear()}-${next_date.getMonth()+1}-${next_date.getDate()}`;
                    //console.log("Fecha: ", final_date, "Duracion: ", info[0].duration_goal);

                    //housingWay de la etapa anterior, para obtener el lote
                    let predecessor_id = records[i].housingway_detail_id;

                    //Insertar el proyectado de la siguiente etapa
                    let liftbreding = await DB_housingWay.DBaddHousingWay(execution_quantity, next_date, 3, abreed_id[0].partnership_id, abreed_id[0].scenario_id, breed_id, predecessor_id);
                    //Insertar el detalle de la siguiente etapa, debido que: las gallinas ya estan en el sitio por lo tanto proyectado y programado debe ser igual
                    console.log(liftbreding);
                    /*
                * Ddebo cambiar los parametros 7 y 10 granja y galpon
                */
                    //let liftbredingDetail = await DBlayer.DBaddHousingWayDetail(liftbreding.housing_way_id, next_date, execution_quantity, 7, 10,0);

                }else{
                    console.log("No entre");
                }
            }
            break;

        default:
            console.log("MALL");
            break;
        }
        let data = await DBlayer.DBfindHousingWayDetByHwdId(housingwaydetail_id);
        //let updateHW = await DBlayer.DBupdateHousingWayDetail(records);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
exports.updateDisabledHousingWayDetail = async function(req, res) {

    console.log("el body ",req.body);

    
    let housingway_detail_id = req.body.housingway_detail_id,
        shed_id = req.body.shed_id,
        selectedRecords = req.body.records_selected;
        
    try {
        let updateHW = await DBlayer.DBupdateDisabledHousingWayDetail(housingway_detail_id);
        let shed= await DB_shed.DBupdateStatusShed(shed_id, status_disponible);
        //Dependiendo del process_class_id debemos insertar un nuevo registro a la siguiente etapa

        let data = await  DBlayer.DBfindHousingWayDetByHw222(req.body.housing_way_id),
            residue = await  DBlayer.DBgetNewResidue(selectedRecords);
        let residue_programmed = 0;
        data.forEach(item => {
            residue_programmed += item.scheduled_quantity;
        });
        console.log("residue_programmed: ", residue);
        //let updateHW = await DBlayer.DBupdateHousingWayDetail(records);
        res.status(200).json({
            statusCode: 200,
            data: data,
            residue: residue
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};


exports.deleteHousingWayDetail = async function(req, res) {

    try {
        //Verificar si puedo eliminar el resgistro
        let verify = await  DBlayer.DBHousingWayDetailVerify(req.body.housingway_detail_id);
        console.log(req.body.housingway_detail_id);
        console.log(verify.length);
        if(verify.length === 0 ){
            return res.status(423).send({error: false, msg: "No se puede eliminar un registro sincronizado"});
        }

        // Busco el predecesor del que quiero eliminar
        let pred = await  DB_housingWay.DBfindHousinWayByPredecessor(req.body.housingway_detail_id);

        //Elimino en cascada, busco el pred en detail
        let pred_detail = [];
        if(pred.length>0){
            pred_detail = await DBlayer.DBfindHousingWayDetailConfirm(pred[0].housing_way_id);
            console.log("pd: ", pred_detail);
        }

        let isConfirmPre = [];
        if(pred.length>0 && pred_detail.length <= 0){
            isConfirmPre = await DBlayer.DBfindHousingWayDetailConfirm(pred[0].housing_way_id, 0);
            let suce = await DB_housingWay.DBdeleteHousingWayById(pred[0].housing_way_id);
        }
        // elimino el detail
        let isDelete = await DBlayer.DBdeleteHousingWayDetail(req.body.housingway_detail_id);

        // Eliminar el almacenamiento de huevo en caso que deleteHousingWayDetail
        if(isConfirmPre.length>0){
            let deleteStorage = await DBeggsStorage.DBdeleteStorageByLot(isConfirmPre[0].lot);
        }

        let data = await DBlayer.DBfindHousingWayDetByHw(req.body.housing_way_id);
        let residue_programmed = 0;
        data.forEach(item => {
            residue_programmed += item.scheduled_quantity;
        });

        res.status(200).json({
            statusCode: 200,
            data: data,
            residue: residue_programmed
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }



};

exports.findAllDateQuantityFarmProduct = function(req, res) {
    DBlayer.DBfindAllDateQuantityFarmProduct()
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.findAllDateQuantityFarmProductReproductora = function(req, res) {
    DBlayer.DBfindAllDateQuantityFarmProductReproductora()
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};


exports.findShedAndFarmProjection = function(req, res) {
    DBlayer.DBfindShedAndFarmProjection(req.body.housing_way_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.findPredecesorLot = function(req, res) {
    DBlayer.DBgetPredecesorLot(req.body.housingway_detail_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });

};

exports.findHousingwayDetailByLotSap = async (req, res) => {

    try {
        console.log(req.body.lot_sap);
        // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindHousingwayDetailByLotSap(req.body.lot_sap);
        console.log("la data de programmedEggs by lot sap");
        console.log(records);
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};
exports.findHousingwayDetailByLotSapLiftB = async (req, res) => {

    try {
        console.log(req.body.lot_sap);
        // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindHousingwayDetailByLotSapLiftB(req.body.lot_sap);
        console.log("la data de programmedEggs by lot sap");
        console.log(records);
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};
exports.findHousingwayDetailByLotSapBreedingP = async (req, res) => {

    try {
        console.log(req.body.lot_sap);
        // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindHousingwayDetailByLotSapBreedingP(req.body.lot_sap);
        console.log("la data de programmedEggs by lot sap");
        console.log(records);
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};
