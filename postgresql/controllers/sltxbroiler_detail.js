const DBlayer = require("../models/sltxbroiler_detail");
const DBbroiler = require("../models/sltxbroiler");
const DB_shed = require("../models/shed");
const DBfarm = require("../models/farm");
const DBcenter = require("../models/center");
const DBhigherLayer = require("../models/higherLayer");
const DBbroilerShed = require("../models/sltxbr_shed");
const DBsales_purchases = require("../models/sltxSellsPurchase");

const status_disponible= 1;
const status_ocupado= 2;
const status_vacio= 3;
const status_inhabiliado= 4;
const status_reservado= 5;
function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}


async function createLotBroiler(){
    let lot = "E1";
    let lote = await DBlayer.DBfindMaxLotBroiler();
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

function sumQuantities(records){
    let acc = 0;

    records.forEach(itm => {
        acc = acc+parseInt(itm.quantity);
    });

    return acc;
};

exports.addNewBroilerDetail = async function(req, res) {
// Request structure::: record: [{housing_date, farm_id, housing_quantity, sheds:["id","id"] }], beginning, ending, gender
    try {

        let record = req.body.record,
            beginning = req.body.init_date,
            ending = req.body.end_date,
            gender = req.body.gender,
            lots_b = req.body.lots,
            sheds = record[0].sheds,
            farm_id = record[0].farm_id,
            scenario_id = req.body.scenario_id;
            
            if (record !== undefined && record !== null && record.length >0 && sheds !== undefined && sheds !== null && sheds.length >0 && farm_id !== undefined && farm_id !== null) {
                
                let partition = await DBhigherLayer.DBfindActiveEvictionPartition(),
                    shed_insert = [],
                    last_lot = await DBbroilerShed.DBfindMaxLotBroiler(),
                    last_prog = await DBlayer.DBfindMaxRefBroiler(),
                    // broiler_decrease = await DBhigherLayer.DBfindProcessByIncStage(1),
                    // decrease = 0,
                    housing_quantity = sumQuantities(lots_b);
                if(/*broiler_decrease.length>0 &&*/ partition.length>0){
                    // broiler_decrease.forEach(itm => {
                    //     decrease = decrease + itm.decrease;
                    //     // duration_process = duration_process + itm.duration_process;
                    // });
            
                    // decrease = parseFloat((decrease/broiler_decrease.length).toFixed(2));
                    // duration_process = parseInt( Math.ceil( ( duration_process/data.length ).toFixed(2) ) );
                // Voy a armar lo que voy a insertar en el detail>>>>>>>>>>>>
                let records_ins = [],
                    quantity_each = housing_quantity,
                    response_insertion = [];

                // quantity_each = quantity_each - ( quantity_each*decrease/100 );
                lot_prog = last_prog.max + 1;
                
                    let obj = {
                        ...record[0],
                        housing_quantity: quantity_each,                                               
                        lot: lot_prog
                    }
                    
                    if(gender === 'H'){
                        obj.youngfemale = Math.ceil(quantity_each * (partition[0].youngfemale/100))
                        obj.oldfemale = Math.ceil(quantity_each * (partition[0].oldfemale/100))
                        obj.youngmale = 0
                        obj.oldmale = 0
                        obj.peasantmale = 0
                    }else{
                        obj.youngmale = Math.ceil(quantity_each * (partition[0].youngmale/100))
                        obj.oldmale = Math.ceil(quantity_each * (partition[0].oldmale/100))
                        obj.peasantmale = Math.ceil(quantity_each * (partition[0].peasantmale/100))
                        obj.youngfemale = 0
                        obj.oldfemale = 0 
                    }
                    records_ins.push(obj)
                response_insertion = await DBlayer.DBaddNewBroilerDetail(records_ins);
                let insb_lot = [];
                console.log(response_insertion)
                for (let i = 0; i < response_insertion.length; i++) {
                    
                    lots_b.forEach(itm => {
                        insb_lot.push({
                            ...itm,
                            slbroiler_detail_id: response_insertion[i].slbroiler_detail_id,
                            gender: gender
                        })
                        
                    });
                }

                let new_lot = last_lot.max+1;
                for (let i = 0; i < sheds.length; i++) {
                    //Armo el array de los lotes::::: 
                    let center_id = await DBlayer.DBfindCenterById(parseInt(sheds[i]),farm_id);
                    console.log(i)
                    shed_insert.push({
                        shed_id: parseInt(sheds[i]),
                        center_id: center_id.center_id,
                        slbroiler_detail_id: response_insertion[0].slbroiler_detail_id  
                    })
                    new_lot++
                    
                }
                await DBbroilerShed.DBaddNewBroilerShed(shed_insert);
                await DBlayer.DBaddNewBroilerLot(insb_lot);

                let data = await DBlayer.DBfindBroilerDetailByWeek(beginning, ending, gender, scenario_id);
                let lots = await DBbroiler.DBfindBroilerDailyLots(beginning, ending, gender, scenario_id),
                    sells = await DBsales_purchases.DBgetSalesByWeek(beginning, ending, scenario_id),
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
                    lots = lots.filter(item => (item.lot[0] === 'A' && item.quantity > 0) || item.lot[0] !== 'A');
                res.status(200).json({
                    statusCode: 200,
                    data: data,
                    lots: lots
                });
            }else{
                let msg;

                if(partition.length==0){
                    msg = "No se encontró partición de desalojo activa"
                }else{
                    msg = "No existen procesos de engorde"
                } 

                res.status(409).json({
                    statusCode: 409,
                    msj: msg
                });
            }
    
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
exports.checkForPartitionAndProcess = async function (req, res) {
    // Request structure::: record: [{housing_date, farm_id, housing_quantity, sheds:["id","id"] }], beginning, ending, gender
    try {
        let partition = await DBhigherLayer.DBfindActiveEvictionPartition(),
            broiler_decrease = await DBhigherLayer.DBfindProcessByIncStage(1),
            gender_class = await DBhigherLayer.DBfindfindGenderClByGender(req.body.gender)
            res_status = 500,
            msgPart = '',
            msgProc = '',
            msgClas = '';

        console.log("partition:::", partition);
        console.log("broiler_decrease:::", broiler_decrease);
        if (broiler_decrease.length > 0 && partition.length > 0 && gender_class.length > 0) {
            res_status = 200;
        } else {
            res_status = 409;
            msgPart = (partition.length > 0)?"":"No se encontró partición de desalojo activa.";
            msgProc = (broiler_decrease.length > 0)?"":"No existe(n) proceso(s) de engorde.";
            msgClas = (gender_class.length > 0)?"":"No existe(n) clasificación(es) de sexaje"            
        }

        res.status(res_status).json({
            statusCode: res_status,
            msgPart: msgPart,
            msgProc: msgProc,
            msgClas: msgClas
        });


    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findBroilerDetail = async function(req, res) {
// request structure: {beginning: 'YYYY-MM-DD', ending:'YYYY-MM-DD', gender: 'M' o 'H'}
    try {
        let beginning = req.body.init_date,
            ending = req.body.end_date,
            gender = req.body.gender,
            scenario_id = req.body.scenario_id;


        let records = await DBlayer.DBfindBroilerDetailByWeek(beginning, ending, gender, scenario_id);
        let lots = await DBbroiler.DBfindBroilerDailyLots(beginning, ending, gender, scenario_id),
            sells = await DBsales_purchases.DBgetSalesByWeek(beginning, ending, scenario_id),
            c_sell =sells[0].quantity, i = 0;
        let gender_class = await DBhigherLayer.DBfindfindGenderClByGender(gender);

        // lots = lots.map(item =>( {...item, quantity: item.quantity - c_sell } ) )

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
        console.log("after::::", lots)
        lots = lots.filter(item => (item.lot[0]==='A'&&item.quantity>0)||item.lot[0]!=='A');

        res.status(200).json({
            statusCode: 200,
            data: records,
            lots:lots,
            gender_cl: gender_class
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }

};

exports.executeBroilerDetail = async function(req,res){
// request structure: records: [{slbroiler_detail_id, eviction_date, eviction_quantity, category, age, weightgain}], beginning, ending, gender
    try{

        let records = req.body.records,
        beginning = req.body.init_date, 
        ending = req.body.end_date, 
        gender = req.body.gender,
        scenario_id = req.body.scenario_id;

        if(records!==undefined && records!== null && records.length>0){
            // records = records.map( item => ( {...item, executed:true } ) )
            // let records_up = [];
            // for (let i = 0; i < records.length; i++) {
            //     let sheds = await DBbroilerShed.DBfindShedsByLotProg(records[i].lot),
            //     eviction_quantity = Math.ceil( records[i].eviction_quantity/sheds.length );
            //     records_up.push({...records[i], eviction_quantity: eviction_quantity })
            //     console.log(records[i].eviction_quantity, eviction_quantity, sheds.length)
                
            // }
            await DBlayer.DBexecuteBroilerDetail(records);

            let data = await DBlayer.DBfindBroilerDetailByWeek(beginning, ending, gender, scenario_id) 

            res.status(200).json({
                statusCode: 200, 
                data: data
            })
        }else{
            res.status(204).json({
                statusCode: 204,
                error_msg: "Error no se recibió data en la solicitud"
            });
        }
    } catch(err){
        console.log("error en executeDroilerDetail::::", err);
        res.status(500).json({
            statusCode:500,
            pgErrorCode: err
        });
    }
};

exports.findELotByDate = async function(req, res) {

    try {

        let date = req.body.date,
            lots = req.body.lots,
            partnership_id = req.body.partnership_id,
            farm_code = req.body.farm_code;
        console.log("date recibida:::: ", date, lots)
        let farm = await DBfarm.DBfindFarmByPartnershipAndCode(partnership_id, farm_code)
        console.log("mi farm:::: ", farm)
        let resp = await DBlayer.DBfindELotByDate(date, lots, farm[0].farm_id);
        console.log("La resp::::: ", resp)
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