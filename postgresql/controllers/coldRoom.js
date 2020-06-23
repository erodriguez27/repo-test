const DBeggsStorage = require("../models/eggsStorage");
const DBlayer = require("../models/coldRoom");
const DBscenarioParameter = require("../models/scenarioParameter");
const DBprocess = require("../models/process");

exports.findProjectEggs= async function(req, res){
    try{
        let partnership_id= req.body.partnership_id;
        let scenario_id = req.body.scenario_id;
        console.log("el id");
        console.log(partnership_id);
        
        let data  = await DBlayer.DBfindProjectEggs(partnership_id, scenario_id);
        let ponderDay= await DBlayer.DBgetWeightedDays(scenario_id);

        if(data.length>0 && ponderDay.length>0){
            ponderDay.forEach(item=>{
                let match= data.find(function(elem){
                    return elem.incubator_plant_id== item.incubator_plant_id;
                });
                console.log(match);
                // if(match!==undefined && match !== null){
                if(item.suma_dias>0 )
                    match.weighted_days= item.numerador / item.suma_diffs;
                else
                    match.weighted_days= 0;
                // }
                
            });
        }
        else{
            data= await DBlayer.DBgetForceProject(partnership_id);
        }

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

};

exports.findEntryEggs= async function(req, res){
    try{
        let init_date= new Date(req.body.init_date);
        let end_date= new Date(req.body.end_date);
        let partnership_id= req.body.partnership_id;
        let incubator_plant_id= req.body.incubator_plant_id;
        let scenario_id = req.body.scenario_id;
        let slot= req.body.slot;
console.log("Mah nigga", req.body)
        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();
        let data;
        if(slot=== undefined || slot === null || slot ===""){
            data  = await DBlayer.DBfindEntryEggs(partnership_id, incubator_plant_id, init_date, end_date, scenario_id);
            console.log("mi data: ",data);
            // data[0].notadjusted = !data[0].adjusted
            
            //    await data.forEach(async element => {
                
                
            //     });
            console.log("sali del for each");   
            
        }else{
            data  = await DBlayer.DBfindEntryEggsWithLot(partnership_id, incubator_plant_id, init_date, end_date, slot, scenario_id, scenario_id);
        }
        var aux = new Array();
        for (let i = 0; i < data.length; i++) {
            var ajuste = await DBlayer.DBfindAjustes(data[i].eggs_storage_id);
            console.log("ajuste recibido: ", ajuste);
            if(ajuste.length !==0&&ajuste.length !==null&&ajuste.length !==undefined){
                console.log("entro if");
                data[i].adjusted = true;
                data[i].ajustes = ajuste;
            }else{
                console.log("entro else");
                data[i].adjusted = false;
            }
            console.log("mi element: ",data[i]);
            aux.push(data[i]);
            console.log("mi aux ", aux);
            data[i].executed = !data[i].available;
                
        }
        console.log("mi Aaux", aux);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findEntryEggsPlexus= async function(req, res){
    try{
        let init_date= new Date(req.body.init_date);
        let end_date= new Date(req.body.end_date);
        let partnership_id= req.body.partnership_id;
        let incubator_plant_id= req.body.incubator_plant_id;
        let scenario_id = req.body.scenario_id;
        let slot= req.body.slot;

        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();
        let data;
        if(slot=== undefined || slot === null || slot ===""){
            data  = await DBlayer.DBfindEntryEggsPlexus(partnership_id, incubator_plant_id, init_date, end_date, scenario_id);
            console.log("mi data: ",data);
            // data[0].notadjusted = !data[0].adjusted
            
            //    await data.forEach(async element => {
                
                
            //     });
            console.log("sali del for each");   
            
        }else{
            data  = await DBlayer.DBfindEntryEggsPlexusWithLot(partnership_id, incubator_plant_id, init_date, end_date, slot, scenario_id);
        }
        var aux = new Array();
        for (let i = 0; i < data.length; i++) {
            var ajuste = await DBlayer.DBfindAjustes(data[i].eggs_storage_id);
            console.log("ajuste recibido: ", ajuste);
            if(ajuste.length !==0&&ajuste.length !==null&&ajuste.length !==undefined){
                console.log("entro if");
                data[i].adjusted = true;
                data[i].ajustes = ajuste;
            }else{
                console.log("entro else");
                data[i].adjusted = false;
            }
            console.log("mi element: ",data[i]);
            aux.push(data[i]);
            console.log("mi aux ", aux);
            data[i].executed = !data[i].available;
                
        }
        console.log("mi Aaux", aux);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findEntryEggs2= async function(req, res){
    try{
        let init_date= req.body.init_date !== null?new Date(req.body.init_date):null;
        let end_date= req.body.init_date !== null?new Date(req.body.end_date):null;
        let partnership_id= req.body.partnership_id;
        let incubator_plant_id= req.body.incubator_plant_id;
        let scenario_id = req.body.scenario_id;
        let slot= req.body.slot;
        console.log(req.body);
        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();
        let data;
        if(slot=== undefined || slot === null || slot ==="")
            data  = await DBlayer.DBfindEntryEggs2(partnership_id, incubator_plant_id, init_date, end_date, scenario_id);
        else
            data  = await DBlayer.DBfindEntryEggsWithLot2(partnership_id, incubator_plant_id, init_date, end_date, slot, scenario_id);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.addEntryEggs= async function(req,res){
    try{
        console.log(req.body);
        let records= req.body.records;
        let partnership_id= req.body.objSearch.partnership_id;
        let init_date= req.body.objSearch.init_date !== null?new Date(req.body.objSearch.init_date.toString()):null;
        let end_date= req.body.objSearch.end_date !== null?new Date(req.body.objSearch.end_date.toString()):null;
        let incubator_plant_id= req.body.objSearch.incubator_plant_id;
        let slot= req.body.objSearch.slot,
            scenario_id = req.body.objSearch.scenario_id;
        console.log("los records mismos: ",records);
        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();

        await DBlayer.DBaddEntryEggs(records);

        let data;
        if(slot=== undefined || slot === null || slot ==="")
            data  = await DBlayer.DBfindEntryEggs(partnership_id, incubator_plant_id, init_date, end_date, scenario_id);
        else
            data  = await DBlayer.DBfindEntryEggsWithLot(partnership_id, incubator_plant_id, init_date, end_date, slot, scenario_id);
        var aux = new Array();
        for (let i = 0; i < data.length; i++) {
            var ajuste = await DBlayer.DBfindAjustes(data[i].eggs_storage_id);
            console.log("ajuste recibido: ", ajuste);
            if(ajuste.length !==0&&ajuste.length !==null&&ajuste.length !==undefined){
                console.log("entro if");
                data[i].adjusted = true;
                data[i].ajustes = ajuste;
            }else{
                console.log("entro else");
                data[i].adjusted = false;
            }
            console.log("mi element: ",data[i]);
            aux.push(data[i]);
            console.log("mi aux ", aux);
            data[i].executed = !data[i].available;
                
        }
        console.log("mi Aaux", aux);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};
async function createLotPlexus(){
    let lot = "X1";
    let lote = await DBlayer.DBfindMaxLotPlexus("Plexus");
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
        lot = "X"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
    
    return lot;
}
exports.addAdjustEntryEggs= async function(req,res){
    try{
        console.log("body", req.body.objSearch, req.body.objSearch.init_date)
        let records= req.body.records;
        let init_date= req.body.objSearch.init_date !== null? new Date(req.body.objSearch.init_date.toString()): null
        let end_date= req.body.objSearch.init_date !== null? new Date(req.body.objSearch.end_date.toString()): null;
        let partnership_id= req.body.objSearch.partnership_id;
        let incubator_plant_id= req.body.objSearch.incubator_plant_id;
        let slot= req.body.objSearch.slot;
        let scenario_id= req.body.objSearch.scenario_id;
        console.log("los records mismos: ",records);
        records[0].lot = await createLotPlexus();
        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();

        await DBlayer.DBaddAdjustEntryEggs(records);

        let data;
        if(slot=== undefined || slot === null || slot ==="")
            data  = await DBlayer.DBfindEntryEggs(partnership_id, incubator_plant_id, init_date, end_date, scenario_id);
        else
            data  = await DBlayer.DBfindEntryEggsWithLot(partnership_id, incubator_plant_id, init_date, end_date, slot, scenario_id);

        var aux = new Array();
        for (let i = 0; i < data.length; i++) {
            var ajuste = await DBlayer.DBfindAjustes(data[i].eggs_storage_id);
            console.log("ajuste recibido: ", ajuste);
            if(ajuste.length !==0&&ajuste.length !==null&&ajuste.length !==undefined){
                console.log("entro if");
                data[i].adjusted = true;
                data[i].ajustes = ajuste;
            }else{
                console.log("entro else");
                data[i].adjusted = false;
            }
            console.log("mi element: ",data[i]);
            aux.push(data[i]);
            console.log("mi aux ", aux);
            data[i].executed = !data[i].available;
                
        }
        console.log("mi Aaux", aux);
        
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};
exports.addAdjustEgressEggs= async function(req,res){
    try{
        let records= req.body.records,
            type_movements = records[0].type_movements;
        let init_date= req.body.objSearch.init_date !== null?new Date(req.body.objSearch.init_date.toString()):null;
        let end_date= req.body.objSearch.end_date !== null?new Date(req.body.objSearch.end_date.toString()):null;
        let partnership_id= req.body.objSearch.partnership_id;
        let incubator_plant_id= req.body.objSearch.incubator_plant_id;
        let slot= req.body.objSearch.slot;
        let lot = req.body.lot;
        let data;
        console.log("los records mismos: ",records);

        // records[0].lot = await createLotPlexus()
        console.log("Los movements: ",type_movements);
        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();

        await DBlayer.DBaddAdjustEntryEggs(records);
        if(lot!==undefined&&lot!==null&&lot!==""){
            data=await await DBlayer.DBgetMovementsPlexusByEntry(lot, type_movements);
        }else{
            data  = await DBlayer.DBgetMovementsByEntry(records[0].eggs_storage_id, type_movements, lot);
        }
        
        // let dummy = await DBlayer.DBgetMovementsByEntry(records[0].eggs_storage_id, "ingreso");
        // console.log("ASD lo traido:", data)
        // console.log("ASD lo traido ingresos:", dummy)

        // let sum =0;
        // dummy.forEach(element => {
        //     if(element.description_adjustment!==null){
        //         sum = parseInt(sum)+parseInt(element.quantity)
        //     }
        // });
        // let res = 0;
        // data.forEach(element => {
        //     res = parseInt(res) + parseInt(element.quantity);
        // });
        console.log("The Spiral Scouts", data)

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};
async function createLotComp(scenario_id){
    let lot = "A1";
    let lote = await DBlayer.DBfindMaxLotComp(scenario_id);
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
        lot = "A"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
    
    return lot;
}
exports.addNewEntryEggs= async function(req,res){
    try{
        let init_date= req.body.records[0].init_date;
        let end_date= req.body.records[0].end_date;
        let partnership_id= req.body.partnership_id,
            scenario_id = req.body.records[0].scenario_id;
        let incubator_plant_id= req.body.records[0].incubator_plant_id;
        let lot = await createLotComp(req.body.records[0].scenario_id);
        req.body.records[0].lot = lot;
        console.log(req.body);
        console.log(partnership_id);
        // console.log("los records mismos: ",records)
        // init_date= init_date.getDate()+"-"+(init_date.getMonth()+1)+"-"+init_date.getFullYear();
        // end_date= end_date.getDate()+"-"+(end_date.getMonth()+1)+"-"+end_date.getFullYear();

        let id = await DBlayer.DBaddNewEntryEggs( req.body.records);
        let rec =[];
        rec.push({
            eggs_storage_id: id[0].eggs_storage_id, 
            fecha_movements: init_date,  
            lot: lot , 
            quantity: req.body.records[0].eggs, 
            type_movements: "ingreso", 
            description_adjustment:"Compra"
        });
        await DBlayer.DBaddAdjustEntryEggs(rec);

        console.log("Lo que acabo de recibir: ",id);

        let data;
        if(lot=== undefined || lot === null || lot ==="")
            data  = await DBlayer.DBfindEntryEggs2(partnership_id, incubator_plant_id, init_date, end_date);
        else
            data  = await DBlayer.DBfindEntryEggsWithLot2(partnership_id, incubator_plant_id, init_date, end_date, lot);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};


function addDays(nDate, nDay){
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}


exports.findProjectIncubator= async function(req, res)
{
    const breedingStage = 3;
    console.log("llego al incubatorfind");

    try{
        console.log("el req.body");
        console.log(req.body);

        let scenario_id = req.body.scenario_id,
            init_date = req.body.init_date,
            end_date = req.body.end_date,
            incubator_plant_id = req.body.incubator_plant_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            plexus = req.body.plexus,
            parentLot = req.body.parentLot;

        console.log("las variables");
        console.log(scenario_id);
        console.log(init_date);
        console.log(end_date);
        console.log(incubator_plant_id);
        console.log(partnership_id);
        console.log(breed_id);
        console.log(plexus);
        console.log("sumada");

        // let aaaDate = req.body.init_date.split("-"),
        // nnnDate = new Date(aaaDate[2], aaaDate[1]-1, aaaDate[0]);

        // let sssDate = addDays(nnnDate, 6)
        // console.log(sssDate )
        let data;
        if(parentLot==="Todos"){

            if (parseInt(plexus) === 1) {
                console.log("plexus controller");
                data  = await DBlayer.DBfindProjectIncubatorPlexus(scenario_id, null, null , incubator_plant_id, "Plexus");
                data.forEach(item=>{
                    item.breed_id = breed_id;
                });
            }else{
                data  = await DBlayer.DBfindProjectIncubator(scenario_id, null, null , incubator_plant_id, breed_id);
            }
        }else{
            console.log("not all")
            if(plexus===0){
                data = await DBlayer.DBfindProjectIncubatorByParent(scenario_id, init_date, end_date , incubator_plant_id, breed_id, parentLot);

            }else{
                data = await DBlayer.DBfindProjectIncubatorPlexusByParent(scenario_id, init_date, end_date, incubator_plant_id, "Plexus", parentLot);
            }
        }
        
        

        console.log("data respuesta");
        console.log(data);
        /*
        let aProduct = await DBprocess.DBfindProcessByStageAndBreed(breedingStage, breed_id),
        product_id = aProduct[0].product_id,
        aDate = init_date.split("-"),
        nDate = new Date(aDate[2], aDate[1]-1, aDate[0]),
        sDate = addDays(nDate, 6),
        end_date = `${sDate.getFullYear()}-${sDate.getMonth()+1}-${sDate.getDate()}`;

        console.log("init_date")
        console.log(init_date)
        console.log("end_date")
        console.log(end_date)

        let goal;
        try {
          goal  = await DBscenarioParameter.BDgetParameterGoalByDate(scenario_id, product_id, init_date, end_date);
        } catch (error) {
          console.log(error);
        }

        console.log("las metas")
        console.log(goal)*/

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

};

exports.findParentLots= async function(req, res)
{
    const breedingStage = 3;
    console.log("llego al incubatorfind");

    try{
        console.log("el req.body");
        console.log(req.body);

        let breed_id = req.body.breed_id,
            plexus = req.body.plexus,
            incubator_plant_id = req.body.incubatorplant_id, 
            scenario_id = req.body.scenario_id;

        console.log(breed_id);
        console.log(plexus);
        let data;
        if (parseInt(plexus) === 1) 
        {
            console.log("plexus controller");
            data  = await DBlayer.DBfindParentLotsPlexus("Plexus");
        }
        else
        {
            data  = await DBlayer.DBfindParentLots(breed_id, incubator_plant_id, scenario_id);
        }
        

        console.log("data respuesta");
        console.log(data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

};

exports.findProjectIncubatorAll= async function(req, res)
{
    console.log("llego al incubatorfindAll");

    try{
        console.log("el req.body");
        console.log(req.body);

        let obj = req.body.obj,
            scenario_id = obj.scenario_id,
            init_date = obj.init_date,
            end_date = obj.end_date,
            incubator_plant_id = obj.incubator_plant_id,
            partnership_id = obj.partnership_id;

        console.log("las variables");
        console.log(scenario_id);
        console.log(init_date);
        console.log(incubator_plant_id);
        console.log(partnership_id);
        
        data  = await DBlayer.DBfindProjectIncubatorAll(scenario_id, init_date, end_date , incubator_plant_id);
        
        

        console.log("data respuesta");
        console.log(data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }

};

function addDays(nDate, nDay){
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}



exports.getMovementsByEntry= async function(req, res){
    try{
        let eggs_storage_id= req.body.eggs_storage_id;
        let type_movements= req.body.type_movements;
        let lot = req.body.lot;

        let data  = await DBlayer.DBgetMovementsByEntry(eggs_storage_id, type_movements, lot);
        console.log("Mis movements: ", data);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getMovementsPlexusByEntry= async function(req, res){
    try{
        let lot = req.body.lot;
        let type_movements= req.body.type_movements;

        let data  = await DBlayer.DBgetMovementsPlexusByEntry(lot, type_movements);
        console.log("Mis movements: ", data);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};
exports.getMovementsByDescription= async function(req, res){
    try{
        let description = req.description;

        let data  = await DBlayer.DBgetMovementsByDescription(description);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};

exports.getOutMovementsForDate= async function(req, res){
    try{
        let eggs_storage_id= req.body.eggs_storage_id;
        let type_movements= req.body.type_movements;
        let init_date= new Date(req.body.init_date.toString());
        let end_date= new Date(req.body.end_date.toString());
        let slot= req.body.slot;
        let scenario_id= req.body.scenario_id;
        let data;
        
        /*         if(eggs_storage_id===null || eggs_storage_id===undefined)//si no hay storage id, entonces no hay entrada seleccionada, por lo que la bisqueda es general
            data  = await DBlayer.DBgetOutMovementsForDate(type_movements, init_date, end_date);
        else
            data  = await DBlayer.DBgetOutMovementsByEntryForDate(eggs_storage_id, type_movements, init_date, end_date);
 */

        if(slot=== undefined || slot === null || slot ==="")
            data  = await DBlayer.DBgetOutMovementsForDate(type_movements, init_date, end_date, scenario_id);
        else
            data  = await DBlayer.DBgetOutMovementsForDateWithLot(type_movements, init_date, end_date, slot, scenario_id);
        console.log("Mi data de date: ", data);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};



exports.getAllLots= async function(req, res){
    try{
        let incubator_plant_id= req.body.incubator_plant_id,
        scenario_id = req.body.scenario_id;

        let data  = await DBlayer.DBgetAllLots(incubator_plant_id, scenario_id);
        let dataPlexus = await DBlayer.DBgetLotsPlexus(incubator_plant_id, "X", scenario_id);
        data = data.concat(dataPlexus)
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};
exports.getLots= async function(req, res){
    try{
        let incubator_plant_id= req.body.incubator_plant_id;
        let prefix= req.body.prefix;
        let scenario_id = req.body.scenario_id;
        let data  
        
        if(prefix==="X"){
            data= await DBlayer.DBgetLotsPlexus(incubator_plant_id, prefix, scenario_id);
        }else{
            data= await DBlayer.DBgetLots(incubator_plant_id, prefix, scenario_id);
        }
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
};