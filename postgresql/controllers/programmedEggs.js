const DBlayer = require("../models/programmedEggs");
const DBeggsStorage = require("../models/eggsStorage");
const DBprogrammedEggs = require("../models/programmedEggs");
const DBincubator = require("../models/incubator");
const DB_process = require("../models/process");
const DB_housingWay = require("../models/housingWay");
const DB_broiler = require("../models/broiler");
const breedingStage = 1; /*Etapa para Engorde*/
const DBeggsMovements = require("../models/eggsMovements");
const DBcoldRoom = require("../models/coldRoom");


async function createLotInc(scenario_id){
    let lot = "I1";
    let lote = await DBlayer.DBfindMaxLotInc(scenario_id);
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
        lot = "I"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
  
    return lot;
}


exports.addProgrammed = async(req, res) => {
    console.log("llego al addProgrammed", req.body);
    const stage_id = 2;
    try{
        console.log("lo que recibe controlador de back");
        console.log(req.body );
        console.log("lo que termina");

        let lot = req.body.records;

        let breed_id = req.body.breed_id,
            lot_breed = req.body.lot_breed,
            // eggs_storage_id = req.body.eggs_storage_id,
            eggs_movements_id = req.body.eggs_movements_id,
            scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id;
        let lot2 = lot;
        console.log("el lot 2");
        console.log(lot2);
        console.log("final el lot 2");
        lot = lot.reduce((result, act) => {
            const lot = act.lot.split("-")[0];
            console.log("el lot 58");
            console.log(lot);
            console.log(lot.substring(0,1));
            console.log("finalizo el lot 58");
            let obj;
            // const obj = result.find(item => item.lot === lot);
            if (lot.substring(0,1) === "X") {
                obj = result.find(item => item.lot.substring(0,1) === lot.substring(0,1));
            }
            else{
                obj = result.find(item => item.lot === lot);
            }
            if (obj) {
                console.log("el if");
                obj.quantity_eggs += act.quantity_eggs;
                obj.ids.push({
                    eggs_movements_id: act.eggs_movements_id,
                    quantity_eggs: act.quantity_eggs,
                    eggs_storage_id: act.eggs_storage_id,
                    lot: act.lot
                });
            }
            else {
                console.log("el else");
                result.push({
                    lot,
                    quantity_eggs: act.quantity_eggs,
                    ids: [{
                        eggs_movements_id: act.eggs_movements_id,
                        quantity_eggs: act.quantity_eggs,
                        eggs_storage_id: act.eggs_storage_id,
                        lot: act.lot
                    }],
                    fecha: act.fecha
                });
            }
            return result;
        }, []);

        console.log("Luego de eso: ",lot);
        console.log("EL AGRUPADO");
        console.log("la variable");
        console.log(partnership_id);

        // let  programmed_eggs;

        let info = await DB_process.DBfindProcessByStageBreed(stage_id, breed_id, scenario_id);
        console.log("el records info");
        console.log(info);
      
        for (var i = 0; i < lot.length; i++) {
            let  programmed_eggs = [];
            let sum = 0;
            // let lot_incubator = "I-"+Math.round( Math.random() * (10000 - 5000) + 5000);
            let lot_incubator = await createLotInc(scenario_id);
            console.log("lote new despues de la funcion");
            console.log(lot_incubator);
            console.log("el lot: ", lot[i]);
            programmed_eggs.push({
                incubator_id: req.body.incubator_id,
                lot_breed: lot_breed,
                lot_incubator: lot_incubator,
                _date: lot[i].fecha,
                eggs: lot[i].quantity_eggs,
                breed_id: breed_id,
                execution_quantity: null,
                eggs_storage_id: lot[i].ids[0].eggs_storage_id,
                eggs_movements_id: eggs_movements_id,
                diff_days: 0
            });
              console.log(programmed_eggs)
            let programmed_eggs_id = await DBlayer.DBaddProgrammed(programmed_eggs);
            console.log(programmed_eggs_id); 
            console.log("los ids");
            for (const assig of lot[i].ids) {
                console.log("el ASSIG");
                console.log(assig); 
                await DBlayer.DBaddProgrammedLot(programmed_eggs_id[0].programmed_eggs_id, assig.eggs_movements_id, assig.quantity_eggs);
                await DBcoldRoom.DBAddEgreso(lot[i].fecha, assig.lot, assig.quantity_eggs, assig.eggs_storage_id, req.body.description_adjustment, programmed_eggs_id[0].programmed_eggs_id);
            }
            console.log("despues derl assig");
            console.log(lot[i]);
      
            // .then(function(data) 
            // {
            console.log("lo retornado DBaddProgrammed");
            console.log(programmed_eggs_id[0].programmed_eggs_id);

            let upd = DBincubator.DBupdateAvailableIncubator(req.body.incubator_id, lot[i].quantity_eggs);
            console.log("salio del update incubator");
            // console.log("los que voy a agregar en el egreso")
            // console.log(lot[i].fecha)
            // console.log(lot_breed)
            // console.log(lot[i].quantity_eggs)
            // console.log(eggs_storage_id)
            // console.log("final los que voy a agregar en el egreso")

            //*****************************************************************************************************8 */

            // let execution_quantity = lot[i].quantity_eggs - (lot[i].quantity_eggs * (info[0].decrease_goal/100));
            // let aDate = lot[i].fecha.split("-");
            // console.log("el aDate");
            // console.log(aDate);
            // let new_date = new Date(aDate[0], aDate[1]-1, aDate[2]),
            //     next_date = addDays(new_date , info[0].duration_goal);
            // console.log("el new date");
            // console.log(new_date);
            // console.log("el next date");
            // console.log(next_date);
            // console.log("aquiiiii::::", programmed_eggs_id)
            // await DB_broiler.DBaddBroiler(execution_quantity, next_date, partnership_id, scenario_id, breed_id,  lot_incubator, programmed_eggs_id[0].programmed_eggs_id);
        

            //*********************************************************************************************************8 */

            // res.status(200).json({
            //     statusCode: 200
            // });
            // })
            // .catch(function(err) 
            // {
            //   console.log(err)
            //   res.status(500).send(err);
            // });
            // console.log("la respuesta")
            // console.log(records_eggs)
            //Insertar lo proyectado de la siguiente etapa ENGORDE
            // let broiler = await DB_broiler.DBaddBroiler(execution_quantity, next_date, partnership_id, scenario_id, breed_id,  lot_incubator, 1);
            console.log("salio del add broiler");
        }
        console.log("el programmed_eggs");
        // console.log(programmed_eggs)
        let respuesta = await DBlayer.DBfindProgrammedEggs2(eggs_movements_id) ;
        console.log("My search", req.body.search)
        let search = await reloadProjection(req.body.search)
        console.log("la respuesta al front");
        console.log(respuesta);
        res.status(200).json({statusCode:200,
            status: "sucess",
            data: respuesta,
            search: search,
            records: respuesta
        });
    }
    catch(err){
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
};


exports.findExecutionByProgrammedId = async(req,res) => {
    try{
        let programmed_eggs_id = req.body.programmed_eggs_id;

        let data = await DBlayer.DBfindExecutionByProgrammedId(programmed_eggs_id);
        res.status(200).send({
            statusCode: 200,
            data: data
        })
    }
    catch(err){
        console.log("error en findExecutionByProgrammedId:::: ",err)
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    };
};

exports.updateExecutedQuantity = async(req, res) => {
    console.log("llego al updateExecutedQuantity");
    const stage_id = 2;
    try{
        console.log("lo que recibe controlador de back");
        console.log(req.body );
        console.log("lo que termina");

        let record = req.body.record,
            breed_id = record[0].breed_id,
            scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            programmed_eggs_id = record[0].programmed_eggs_id;
        
        
        console.log("EL AGRUPADO");
        console.log("la variable");
        console.log(partnership_id);

        let info = await DB_process.DBfindProcessByStageBreed(stage_id, breed_id, scenario_id);
        console.log("el records info");
        console.log(info);
        let  programmed_eggs = [];
        let sum = 0;

        await DBlayer.DBupdateExecutionByProgrammedId(programmed_eggs_id, record[0].execution_quantity)
        let execution_quantity = record[0].execution_quantity - (record[0].execution_quantity * (info[0].decrease_goal/100));
        let aDate = record[0].dates.split("-");
        console.log("el aDate");
        console.log(aDate);
        let new_date = new Date(aDate[0], aDate[1]-1, aDate[2]),
            next_date = addDays(new_date , info[0].duration_goal);
        console.log("el new date");
        console.log(new_date);
        console.log("el next date");
        console.log(next_date);

        await DB_broiler.DBaddBroiler(execution_quantity, next_date, partnership_id, scenario_id, breed_id,  record[0].lot_incubator, programmed_eggs_id);
        
        console.log("el programmed_eggs");
        // console.log(programmed_eggs)

        let respuesta = await DBlayer.DBfindExecutionByProgrammedId(programmed_eggs_id) ;

        console.log("la respuesta al front");
        console.log(respuesta);
        res.status(200).json({statusCode:200,
            status: "sucess",
            data: respuesta,
            records: respuesta
        });
    }
    catch(err){
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
};

exports.findProgrammedEggs = async (req, res) => {

    try {
        console.log(req.body.eggs_movements_id);
        // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindProgrammedEggs2(req.body.eggs_movements_id);
        console.log("la data de programmedEggs");
        console.log(records);
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};

function addDays(nDate, nDay){
    nDate.setDate(nDate.getDate() + nDay); 
    return nDate;
}

exports.updateProgrammedEggs = async function(req, res) {

    console.log("el body");
    console.log(req.body);
    let records = req.body.records,
        stage_id = req.body.stage_id,
        _date = req.body._date,
        partnership_id = req.body.partnership_id,
        breed_id = req.body.breed_id,
        scenario_id = req.body.scenario_id;

    try {
        //Incubacion
        // console.log(stage_id, breed_id, scenario_id); |
        let info = await DB_process.DBfindProcessByStageBreed(stage_id, breed_id, scenario_id) ;

        let info2 = await DB_process.DBfindProcessByStageBreed(breedingStage, breed_id, scenario_id) ;
            
        // console.log("merma quiero ver c: "+info2[0].decrease_goal);
        // console.log("Info: ", info);

        console.log("records del update update");
        console.log(records);
        console.log(records.length);
        /* let aDate = _date.split("-"),
                new_date = new Date(aDate[2], aDate[1]-1, aDate[0]),
                next_date = addDays(new_date , info[0].duration_goal);*/

        // console.log(records, stage_id, _date);
        for(let i = 0; i < records.length; i++){
            console.log("el for");
            console.log(records[i].execution_quantity);
            console.log(records[i].programmed_eggs_id);
            //Actualizar las cantidades
            let updateHW = await DBlayer.DBupdateProgrammedEggs(records[i].execution_quantity, records[i].programmed_eggs_id, records[i].execution_date);
            console.log("salio del update programmedEggs");
            //generar los datos de la siguiente etapa 
            let execution_quantity = records[i].execution_quantity - (records[i].execution_quantity * (info[0].decrease_goal/100));
            let aDate = records[i].execution_date.split("-"),
                new_date = new Date(aDate[2], aDate[1]-1, aDate[0]),
                next_date = addDays(new_date , info[0].duration_goal);
            console.log("el next date");
            console.log(next_date);

                

                


            //Insertar lo proyectado de la siguiente etapa ENGORDE
            let broiler = await DB_broiler.DBaddBroiler(execution_quantity, next_date, partnership_id, scenario_id, breed_id,  records[i].lot_incubator, updateHW[0].programmed_eggs_id);
            console.log("salio del add broiler");
        }
        console.log("despues del for");

        /*

            //Buscar el registro actualizado
            let date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`,
                incubator_plant_id = req.body.incubator_plant_id;

            let results = await DBeggsMovements.DBfindEggsStorageByDateDetail(scenario_id, breed_id, incubator_plant_id, date),
                aIncubator = await DBincubator.DBfindIncubatorByPlant(incubator_plant_id);

            let incubator = [];
                aIncubator.forEach(item=>{
                  incubator.push(item.incubator_id);

                });
                let records2 = await DBprogrammedEggs.DBfindProgrammerLot(breed_id, incubator, date);

                let programmed_eggs = [];

                console.log("LO ULTIMOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")
                console.log(records2)

                records2.forEach(item=>{
                  let index = programmed_eggs.map(function(e) { return e.incubator_id; }).indexOf(item.incubator_id);
                 
                      let lot = [];
                      programmed_eggs.push({
                        programmed_eggs_id: item.programmed_eggs_id,
                        incubator_id: item.incubator_id,
                        name: item.name,
                        lot_incubator: item.lot_incubator,
                        capacity: item.capacity,
                        lot_incubator: item.lot_incubator,
                        lot_breed: item.lot_breed,
                        eggs: item.eggs,
                        diff: item.capacity - item.eggs,
                        available: item.available,
                        execution_quantity: item.available.execution_quantity,
                        state_date: item.state_date,
                        state_text_date: item.state_text_date,
                        execution_quantity: item. execution_quantity
                      });
                  
                });
                // console.log("programmed_eggs: ", programmed_eggs);
                let available = await DBeggsMovements.DBfindEggsStorageByDateVer2(partnership_id,date);
                // let available = await DBeggsStorage.DBfindEggsStorageByDate(scenario_id, breed_id, incubator_plant_id, date);
*/
        let programmed_eggs = await DBlayer.DBfindProgrammedEggs2(req.body.eggs_movements_id) ;
        res.status(200).json({
            statusCode: 200,
            // data: results,
            records: programmed_eggs
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.deleteStorageByLot = async (req, res) => {

    try {
    
    
        // console.log("Eliminar por lote: ", req.body.lot_incubator);

        // Buscar los registros a eliminar
        const recordsF = await DBlayer.DBfindProgrammedEggsByLot(req.body.lot_incubator);
        // console.log('Devolver estas cantidades: ', recordsF)

        if(recordsF.length === 0){
            return res.status(423).send({error: false, msg: "No se puede eliminar un registro sincronizado"});
        }
        //Sumar los huevos
        for (let iterable of recordsF) {
            // console.log(iterable.eggs, iterable.eggs_storage_id);
            let aSum = await DBeggsStorage.DBaddEggs(iterable.eggs_storage_id, iterable.eggs);
        }

        // Eliminar los registros
        let deleteProgrammed = await DBlayer.deleteProgrammedByLot(req.body.lot_incubator);

        // Valido que los registros de engorde no esten sincronizados
        let broilerDetailConfirm = await DB_broiler.DBfindBRoilerDetailConfirmByLot(req.body.lot_incubator);

        let broilerConfirm = await DB_broiler.DBfindBRoilerConfirmByLot(req.body.lot_incubator);

        // eliminar los registros de engorde
        if(broilerDetailConfirm.length>0 || broilerConfirm.length>0){
            let deleteBroiler = await DB_broiler.DBdeleteBroilerByLot(req.body.lot_incubator);
        }

        //Devolver los registros
        let scenario_id =  req.body.scenario_id,
            breed_id = req.body.breed_id,
            incubator_plant_id = req.body.incubator_plant_id,
            date = req.body.date;
        let partnership_id = req.body.partnership_id;    

        let aDate = date.split("/");
        let endDate = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let results = await DBeggsMovements.DBfindEggsStorageByDateDetail(scenario_id, breed_id, incubator_plant_id, endDate),
            aIncubator = await DBincubator.DBfindIncubatorByPlant(incubator_plant_id);

        let incubator = [];
        aIncubator.forEach(item=>{
            incubator.push(item.incubator_id);

        });

        let records = await DBprogrammedEggs.DBfindProgrammerLot(breed_id, incubator, endDate);


        let programmed_eggs = [];

        records.forEach(item=>{
            let index = programmed_eggs.map(function(e) { return e.incubator_id; }).indexOf(item.incubator_id);
            if(index>=0){
                programmed_eggs[index].eggs += item.eggs;
                programmed_eggs[index].diff -= item.eggs;
                programmed_eggs[index].lot_breed += ","+item.lot_breed;
            }else{
                let lot = [];
                programmed_eggs.push({
                    incubator_id: item.incubator_id,
                    name: item.name,
                    lot_incubator: item.lot_incubator,
                    capacity: item.capacity,
                    lot_incubator: item.lot_incubator,
                    lot_breed: item.lot_breed,
                    eggs: item.eggs,
                    diff: item.capacity - item.eggs,
                    available: item.available,
                    execution_quantity: item.available.execution_quantity,
                    state_date: item.state_date,
                    state_text_date: item.state_text_date,
                    execution_quantity: item. execution_quantity
                });
            }
        });
        // console.log("programmed_eggs: ", programmed_eggs);
        // console.log(scenario_id, breed_id, incubator_plant_id, endDate)
        // let available = await DBeggsStorage.DBfindEggsStorageByDate(scenario_id, breed_id, incubator_plant_id, endDate);
        console.log(endDate);
        console.log(partnership_id);
        let available = await DBeggsMovements.DBfindEggsStorageByDateVer2(partnership_id,endDate);

        // console.log('available: ', available)
        res.status(200).send({statusCode: 200, data: results, records: programmed_eggs,available: parseInt(available[0].eggs)});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};

exports.findAllDateQuantityFarmProduct = function(req, res) {
    //DBlayer.DBfindColdRoomLotsByProgramming(req.body.programmed_eggs_id)
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

exports.findColdRoomsLotByProgramming = function (req, res) {
    DBlayer.DBfindColdRoomLotsByProgramming(req.body.programmed_eggs_id)
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

exports.findProgrammedEggsByLotSap = async (req, res) => {

    try {
        console.log(req.body.lot_sap);
        // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindProgrammedEggsByLotSap(req.body.lot_sap);
        console.log("la data de programmedEggs by lot sap");
        console.log(records);
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};

exports.updateDisabledProgrammedEggs = async function(req, res) {

    console.log("el body ",req.body);

    
    let programmed_eggs_id = req.body.programmed_eggs_id,
    eggs_movements_id = req.body.eggs_movements_id;
        
    try {
        let ret = await DBlayer.updateDisabledProgrammedEggs(programmed_eggs_id);
        // let eggs_movements = await DBeggsMovements.DBfindEggsChargesByProgramming(programmed_eggs_id);
        // console.log("las ids::::: ", eggs_movements);
        // console.log("Incubator_id:::::: ",ret)
        // eggs_movements.forEach(elmt => {
        //     elmt.programmed_disable = true;
        // });
        let updateEM = await DBeggsMovements.updateDisabledEggsMovements([{programmed_eggs_id:programmed_eggs_id,programmed_disable : true}]);
        let incUp = await DBincubator.DBupdateAvailableIncubator(ret.incubator_id, ret.eggs)
        const records = await DBlayer.DBfindProgrammedEggs2(req.body.eggs_movements_id);
        
        let search = await reloadProjection(req.body.search);
        console.log("recibo search", search)

        res.status(200).json({
            statusCode: 200,
            data: records,
            search: search
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

async function reloadProjection(search) {

    let scenario_id = search.scenario_id,
        init_date = search.init_date,
        end_date = search.end_date,
        incubator_plant_id = search.incubator_plant_id,
        partnership_id = search.partnership_id,
        breed_id = search.breed_id,
        plexus = search.plexus,
        parentLot = search.parentLot;
    let data;
    if (parentLot === "Todos") {

        if (parseInt(plexus) === 1) {
            console.log("plexus controller");
            data = await DBcoldRoom.DBfindProjectIncubatorPlexus(scenario_id, null, null, incubator_plant_id, "Plexus");
            data.forEach(item => {
                item.breed_id = breed_id;
            });
        } else {
            data = await DBcoldRoom.DBfindProjectIncubator(scenario_id, null, null, incubator_plant_id, breed_id);
        }
    } else {
        console.log("not all")
        if (plexus === 0) {
            data = await DBcoldRoom.DBfindProjectIncubatorByParent(scenario_id, init_date, end_date, incubator_plant_id, breed_id, parentLot);

        } else {
            data = await DBcoldRoom.DBfindProjectIncubatorPlexusByParent(scenario_id, init_date, end_date, incubator_plant_id, "Plexus", parentLot);
        }
    }


    return data;
}