const DBlayer = require("../models/broilerDetail");
const DB_process = require("../models/process");
const breedingStage = 1; /*Etapa para Engorde*/
const DB_broiler = require("../models/broilereviction");
const DB_shed = require("../models/shed");

const status_disponible= 1;
const status_ocupado= 2;
const status_vacio= 3;
const status_inhabiliado= 4;
const status_reservado= 5;


exports.updatebroilerdetail= async function(req, res) {

    try{
    /**
     *  records: records_programmed,
     *  scenario_id: scenario_id,
     *  _date: aDate[2]+"-"+aDate[1]+"-"+aDate[0],
     *  partnership_id: partnership_id,
     *  breed_id: breed_id
     */
    
        // let execution_quantity = parseInt(req.body.execution_quantity),
        // rDate = req.body.execution_date,
        // aDate = rDate.split("/"),
        // execution_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`,
        // records = req.body.records;

        console.log("Recibe esto en el BackEnd update broilerDetail: ");
        console.log(req.body);

        let merma=0;
        let records = req.body.records,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            broiler_id = [];
        broiler_id.push(req.body.broiler_id);
        // if(pDate.length==3){
        //     var nDate = `${pDate[0]}-${pDate[1]}-${pDate[2]}`;
        //     console.log("nDate:",nDate);
        //     records[0].execution_date = nDate;
        // }else{
        //     pDate = records[0].execution_date.split("-");
        //     console.log("pDate:::: ",pDate)
        //     var nDate = `${pDate[1]}-${pDate[0]}-${pDate[2]}`;
        //     console.log("nDate:",nDate);
        //     records[0].execution_date = nDate;
        // }
        let  execution_date = records[0].execution_date;
        console.log("Recuperacón de merma: ", breedingStage, breed_id, scenario_id);
        let infoMerma = await DB_process.DBfindProcessByStageBreed(breedingStage, breed_id, scenario_id) ;
        console.log("informacion de la merma:");
        console.log(infoMerma);

        for(let i = 0; i < records.length; i++){
            if(records[i].execution_quantity !== null ){
                console.log("Esto es lo que pasa en Records["+i+"]: " );
                console.log(records[i].execution_date);
                console.log(records[i].execution_quantity);
                console.log(records[i].broiler_detail_id);

                let oldshed= await DBlayer.DBgetOldShedBroiler(records[i].broiler_detail_id);
                

                await DBlayer.DBupdatebroilerdetail(records[i].execution_date, records[i].execution_quantity, records[i].broiler_detail_id,  records[i].executedfarm_id, records[i].executedcenter_id,records[i].executedshed_id);
                

                let shed= await DB_shed.DBupdateStatusShed(records[i].executedshed_id, status_ocupado);//actualiza el status del galpon
                let rehous = await DB_shed.DBupdateRehousingShed(records[i].executedshed_id,false);
                if (shed.length>0) {//si se actualizo el status, ahora actualzia la fecha de disponibilidad
                    let dd= new Date(records[i].execution_date);
                    dd.setDate(dd.getDate()+shed[0].rotation_days);
                    DB_shed.DBupdateAvaliableDateShed(shed[0].shed_id, dd);//actualiza la fecha 
                }

                if(oldshed[i].shed_id!= shed[i].shed_id){
                    DB_shed.DBforceFreeShedById(oldshed[i].shed_id);
                }
                console.log("fecha");
                console.log(records[i].execution_date);
                console.log("cantidad ejecutada");
                console.log(records[i].execution_quantity);
                console.log("merma");
                console.log(infoMerma[0].decrease_goal);
                console.log("numero final");
                let final = records[i].execution_quantity - (records[i].execution_quantity * (infoMerma[0].decrease_goal/100));
                console.log(final);
                console.log("empresa");
                console.log(partnership_id);
                console.log("escenario");
                console.log(scenario_id);
                console.log("raza");
                console.log(breed_id);
                console.log("lote");
                console.log(records[i].lot);
                console.log("el id broiler_detail");
                console.log(records[i].broiler_detail_id);
                
               
                console.log("ExeDate::::: ",execution_date)
                let broiler2 = await DB_broiler.DBaddBroilerEviction(final, execution_date, partnership_id, scenario_id, breed_id, records[i].lot, records[i].broiler_detail_id);
                
                
                // console.log(broiler2);
                console.log("sale del record["+i+"]");
            }
        }

        console.log("Recuperación de la data: ", execution_date, breed_id, partnership_id, scenario_id);
        let data = await DBlayer.DBfindBroilerDetail2(broiler_id);
        console.log("Recuperación de la data:");
        console.log(data);
        data.forEach(element => {
            if(element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date){
                element.isexecuted = true;
            }else{
                element.isexecuted = false;
            }
      
        });
        // desde aqui se hace la insercion en la proyeccion de desalojo
        // console.log('Recuperacón de merma: ', breedingStage, breed_id, scenario_id);
        // let infoMerma = await DB_process.DBfindProcessByStageBreed(breedingStage, breed_id, scenario_id) ;
        // console.log('informacion de la merma:');
        // console.log(infoMerma);

        for(let i = 0; i< data.length; i++){
            console.log("data ["+i+"]");
            console.log("lote: "+ data[i].lot);

            merma= 0;
            let aBroiler_product = await DBlayer.DBfindProductByLot(data[i].lot);
            data[i].product = aBroiler_product;

            if (data[i]["execution_quantity"]=== null || data[i]["execution_quantity"]<= 0){
                data[i]["available"]= true;
            }else {
                data[i]["available"]= false;

                console.log("merma de engorde que quiero aplicar: "+infoMerma[0].decrease_goal);
                merma = (data[i]["execution_quantity"] - (data[i]["execution_quantity"] * (infoMerma[0].decrease_goal/100)));
                console.log("merma actual: " + merma);
            }

            console.log("insercion");
            console.log(merma);
            console.log(execution_date);
            console.log(partnership_id);
            console.log(scenario_id);
            console.log(breed_id);
            console.log(data[i].lot);
            console.log(data[i].product);

            //para desalojo
            // let broiler2 = await DB_broiler.DBaddBroilerEviction(merma, execution_date, partnership_id, scenario_id, breed_id,  data[i].lot);

        }
        //let updateHW = await DBlayer.DBupdateHousingWayDetail(records);
        console.log("data");
        console.log(data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });

    }catch (err) {
        console.log(err)
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};
exports.updateDisabledbroilerdetail= async function(req, res) {

    try{

        console.log("Recibe esto en el BackEnd update DisabledbroilerDetail: ");
        console.log(req.body);

        let merma=0;
        let partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            execution_date = req.body.execution_date,
            broiler_id = [],
            broiler_detail_id = req.body.broiler_detail_id,
            shed_id = req.body.shed_id;

        broiler_id.push(req.body.broiler_id);
        // pDate = execution_date.split("/");
        // console.log("pDate:",pDate)
        // if(pDate.length==3){
        //   var nDate = `${pDate[0]}-${pDate[1]}-${pDate[2]}`
        //   console.log("nDate:",nDate)
        //   records[0].execution_date = nDate
        // }else{
        //   pDate = records[0].execution_date.split("-");
        //   var nDate = `${pDate[0]}-${pDate[1]}-${pDate[2]}`
        //   console.log("nDate:",nDate)
        //   records[0].execution_date = nDate
        // }
        // let dd= new Date(records[i].execution_date);
        console.log("mi data: ", partnership_id,breed_id,scenario_id,execution_date,broiler_id,
            broiler_detail_id);
        await DBlayer.DBupdateDisabledbroilerdetail(broiler_detail_id);
        let shed= await DB_shed.DBupdateStatusShed(shed_id, status_disponible);//actualiza el status del galpon
        console.log("Acutalicé el shed: ",shed);
        DB_shed.DBupdateAvaliableDateShed(shed_id, null);
        console.log("Recuperacón de merma: ", breedingStage, breed_id, scenario_id);
        let infoMerma = await DB_process.DBfindProcessByStageBreed(breedingStage, breed_id, scenario_id) ;
        console.log("informacion de la merma:");
        console.log(infoMerma);

        console.log("Recuperación de la data: ", execution_date, breed_id, partnership_id, scenario_id);
        let data = await DBlayer.DBfindBroilerDetail2(broiler_id);
        console.log("Recuperación de la data:");
        console.log(data);
        data.forEach(element => {
            if(element.executedcenter_id && element.executedfarm_id && element.executedshed_id && element.execution_quantity && element.execution_date){
                element.isexecuted = true;
            }else{
                element.isexecuted = false;
            }
      
        });
        // desde aqui se hace la insercion en la proyeccion de desalojo
        // console.log('Recuperacón de merma: ', breedingStage, breed_id, scenario_id);
        // let infoMerma = await DB_process.DBfindProcessByStageBreed(breedingStage, breed_id, scenario_id) ;
        // console.log('informacion de la merma:');
        // console.log(infoMerma);

        for(let i = 0; i< data.length; i++){
            console.log("data ["+i+"]");
            console.log("lote: "+ data[i].lot);

            merma= 0;
            let aBroiler_product = await DBlayer.DBfindProductByLot(data[i].lot);
            data[i].product = aBroiler_product;

            if (data[i]["execution_quantity"]=== null || data[i]["execution_quantity"]<= 0){
                data[i]["available"]= true;
            }else {
                data[i]["available"]= false;

                console.log("merma de engorde que quiero aplicar: "+infoMerma[0].decrease_goal);
                merma = (data[i]["execution_quantity"] - (data[i]["execution_quantity"] * (infoMerma[0].decrease_goal/100)));
                console.log("merma actual: " + merma);
            }

            console.log("insercion");
            console.log(merma);
            console.log(execution_date);
            console.log(partnership_id);
            console.log(scenario_id);
            console.log(breed_id);
            console.log(data[i].lot);
            console.log(data[i].product);

            //para desalojo
            // let broiler2 = await DB_broiler.DBaddBroilerEviction(merma, execution_date, partnership_id, scenario_id, breed_id,  data[i].lot);

        }
        //let updateHW = await DBlayer.DBupdateHousingWayDetail(records);
        console.log("data");
        console.log(data);

        res.status(200).json({
            statusCode: 200,
            data: data
        });

    }catch (err) {
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


async function createLotBroiler(scenario_id){
    let lot = "E1";
    let lote = await DBlayer.DBfindMaxLotBroiler(scenario_id);
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
        lot = "E"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
  
    return lot;
}

exports.addbroilerdetail = async function(req, res) {

    try {
        console.log("Llegue BR D", req.body);
        console.log("termino");
        let records = req.body.records,
            farm_id = parseInt(req.body.farm_id, 10),
            broiler_id = parseInt(req.body.broiler_id, 10),
            shed_id = parseInt(req.body.shed_id, 10),
            center_id = parseInt(req.body.center_id, 10),
            rDate = req.body._date,
            aDate = rDate.split("/"),
            _date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`,
            sum_chicken = 0,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id;

        console.log("records: ", records);
        console.log("antes del lote");
        let lot = await createLotBroiler(scenario_id);
        console.log("despues del lote");
        register = [];
        console.log(lot);
        register.push({
            broiler_id: broiler_id,
            scheduled_date: req.body._date,
            scheduled_quantity: req.body.records.reduce((result, act) => result + act.quantity_chicken, 0),
            farm_id: farm_id,
            shed_id: shed_id,
            center_id: center_id,
            confirm: 0,
            execution_date: null,
            execution_quantity: null,
            lot: lot,
            broiler_product_id: req.body.selected_product_id
        });
        console.log(register);
        let save = await DBlayer.DBaddbroilerdetail(register);
        console.log("save");
        console.log(save);
        for (const register of req.body.records) {
            await DBlayer.DBaddbroilerDetailLot(save[0].broiler_detail_id, register.selected_lot, register.quantity_chicken);
        }

        // let results = await DBlayer.DBfindBroilerDetail(broiler_id, _date, breed_id, partnership_id, scenario_id);
        let results = await DBlayer.DBfindBroilerDetail2(req.body.records.map(record => record.selected_lot));
        //reservar galpón
        let shed2= await DB_shed.DBupdateStatusShed(shed_id, status_reservado);
        let rehous = await DB_shed.DBupdateRehousingShed(shed_id,false);
        for(let i = 0; i< results.length; i++){
            let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
            results[i].product = aBroiler_product;
      
            console.log(results);
            if (results[i]["execution_quantity"]=== null || results[i]["execution_quantity"]<= 0){
                results[i]["available"]= true;
            }else {
                results[i]["available"]= false;
            }
        }
        console.log("lo ultimo del back");
        console.log(results);
        res.status(200).json({
            statusCode: 200,
            data: results
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findbroilerdetail = async function(req, res) {

    try {

        let partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            _date = req.body._date,
            breed_id = req.body.breed_id,
            broiler_id = req.body.broiler_id;
        console.log("FIND: ", _date, breed_id, partnership_id, scenario_id );
        let results = await DBlayer.DBfindBroilerDetail2(req.body.records);
        console.log("results");
        console.log(results);
        console.log("termine result");
        for(let i = 0; i< results.length; i++){
            let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
            results[i].product = aBroiler_product;

        
            // console.log(results);
            if (results[i]["execution_quantity"]=== null || results[i]["execution_quantity"]<= 0){
                results[i]["available"]= true;
            }else {
                results[i]["available"]= false;
            }
        }

      
        let residue_programmed = 0;
        results.forEach(item => {
            residue_programmed = residue_programmed+parseInt(item.scheduled_quantity);
        });
        console.log("residue "+residue_programmed);
        res.status(200).json({
            statusCode: 200,
            data: results,
            residue: residue_programmed
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findbroilerdetailById = async function(req, res) {

    try {

        let broiler_detail_id = req.body.broiler_detail_id;
        console.log("FIND: ", broiler_detail_id );
        let results = await DBlayer.DBfindBroilerDetailById(broiler_detail_id);
        console.log("results");
        console.log(results);
        results[0]["available"]= (results[0]["execution_date"]=== null && (results[0]["execution_quantity"]=== null || results[0]["execution_quantity"]<= 0)&& results[0]["executedfarm_id"]=== null && results[0]["executedcenter_id"]=== null&& results[0]["executedshed_id"]=== null)? true: false;
        results[0].execution_date;
        console.log("termine result");
        //       for(let i = 0; i< results.length; i++){
        //         let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
        //         results[i].product = aBroiler_product;

        
        //         // console.log(results);
        //         if (results[i]['execution_quantity']=== null || results[i]['execution_quantity']<= 0){
        //           results[i]['available']= true;
        //         }else {
        //           results[i]['available']= false;
        //         }
        //       }

      
        //     let residue_programmed = 0;
        //     results.forEach(item => {
        //       residue_programmed = residue_programmed+parseInt(item.scheduled_quantity);
        //     });
        // console.log("residue "+residue_programmed)
        res.status(200).json({
            statusCode: 200,
            data: results,
            // residue: residue_programmed
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.deleteBroilerDetailByLot = async function(req, res) {

    try {

        let lot = req.body.lot,
            partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            _date = req.body._date,
            breed_id = req.body.breed_id;

        let deleteResults = await DBlayer.DBdeleteBroilerDetailByLot(lot);
        let results = await DBlayer.DBfindBroilerDetail(_date, breed_id, partnership_id, scenario_id);

        for(let i = 0; i< results.length; i++){
            let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
            results[i].product = aBroiler_product;
            if (results[i]["execution_quantity"]=== null || results[i]["execution_quantity"]<= 0){
                results[i]["available"]= true;
            }else {
                results[i]["available"]= false;
            }
        }

        let residue_programmed = 0;
        results.forEach(item => {
            residue_programmed += item.scheduled_quantity;
        });

        res.status(200).json({
            statusCode: 200,
            data: results,
            residue: residue_programmed
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
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

exports.findIncubatorLotByBroilerLot = function(req, res) {
    DBlayer.DBfindIncubatorLotByBroilerLot(req.body.broiler_detail_id)
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

exports.findBroilerDetailByLotSap = async (req, res) => {

    try {
        console.log(req.body.lot_sap);
        // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindBroilerDetailByLotSap(req.body.lot_sap);
        console.log("la data de programmedEggs by lot sap");
        console.log(records);
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};