const DBlayer = require("../models/process");
const DBposture = require("../models/postureCurve");

async function groupGoalsByWeek(result) {

    let recordsTotal = []
    let initDate = new Date(result[0].date_.getFullYear(),result[0].date_.getMonth(),result[0].date_.getDate()) 
    let finalDate = new Date(result[result.length-1].date_.getFullYear(),result[result.length-1].date_.getMonth(),result[result.length-1].date_.getDate())

    addDays(initDate, -initDate.getDay())
    addDays(finalDate, -finalDate.getDay())

    while (initDate < finalDate) {
        //console.log("initDate",initDate);
        
        let date = new Date (initDate.getFullYear(),initDate.getMonth(),initDate.getDate())
        let date_f = formatterDay(initDate)+'/'+formatterMonth(initDate)+'/'+initDate.getFullYear()
        let parts = date_f.split('/')
        addDays(date,7)

        //console.log("Date",date)

        let objResult = {
            liftBreeding: 0,
            breeding: 0,
            fertEgg: 0,
            dayoldChick: 0,
            liveChicken: 0


        }
        let records = []
        objResult.date = date_f
        objResult.date_ = new Date(parts[2],parts[1]-1,parts[0]) 
        let flag=false;
        for (let i = 0; i < result.length; i++) {

            if(initDate <= result[i].date_){
                if(result[i].date_ < date){
                    flag=true
                    let result2 = Object.assign({}, result[i])

                    objResult.liftBreeding += result2.liftBreeding
                    objResult.breeding += result2.breeding
                    objResult.fertEgg += result2.fertEgg
                    objResult.dayoldChick += result2.dayoldChick
                    objResult.liveChicken += result2.liveChicken
                    records.push(result2)


                }
                

            }
            
        }
        
        objResult.records = records

        //console.log("obj",objResult);
        if(flag===true){recordsTotal.push(Object.assign({}, objResult))}


        addDays(initDate,7)

        
    }

    return recordsTotal;

    
}


async function recalculateGoals(req, res) {

    console.log("body",req.body);
    

    let records = req.body.records
    let dateto, date_pc, date_in, date_br, dateto_f;
    let initDay = 0
    let quantity
    let result = [];
    let objResult = {
        date:"",
        date_:"",
        liftBreeding:0,
        breeding: 0,
        fertEgg: 0,
        dayoldChick: 0,
        liveChicken: 0
    }

    //let p_curve = await DBposture.DBfindCurveByBreed(req.body.breed_id)

    DBposture.DBfindCurveByBreed(req.body.breed_id).then( async function(p_curve) {
        await DBlayer.DBfindProcessByBreedAndScenario(req.body.breed_id,req.body.scenario_id)
            .then(async function(data) {

                result = await records.map(function(ele){ 
                    let partDate = ele.date.split("/")
                    let date = new Date(partDate[2],partDate[1]-1,partDate[0]);
                    let obj = {
                        date:ele.date,
                        date_:date,
                        liftBreeding:0,
                        breeding: parseInt(ele.quantity),
                        fertEgg: 0,
                        dayoldChick: 0,
                        liveChicken: 0
                    }
                    return obj;
                });

                for (let it = 0; it < records.length; it++) {
                    

                    //datos del proceso de cria y levante
                    let find = await data.findIndex(record => record.stage_id == 5)
                    let e_data = data[find]

                    //fecha de alojamiento
                    let partDate = records[it].date.split("/")
                    const datefrom = new Date(partDate[2],partDate[1]-1,partDate[0]);

                    //calculos para cria y levante
                    dateto = new Date (datefrom.getFullYear(),datefrom.getMonth(),datefrom.getDate())
                    addDays(dateto,-e_data.historical_duration)
                    dateto_f = formatterDay(dateto)+'/'+formatterMonth(dateto)+'/'+dateto.getFullYear()

                    quantity = parseFloat(records[it].quantity) * (1 + parseFloat(e_data.historical_decrease)/100) 
                    
                    //guardado
                    find = await result.findIndex(record => record.date === dateto_f )

                    if(find >= 0){
                        result[find].liftBreeding = result[find].liftBreeding + Math.ceil(quantity)
                    }else{
                        objResult.date=dateto_f
                        objResult.date_=dateto
                        objResult.liftBreeding=Math.ceil(quantity)
                        //let copy = Object.assign({}, objResult);
                        result.push(Object.assign({}, objResult));
                        resetObjResult(objResult);
                    }

                    //calculos para curva postura
                    date_pc = new Date (datefrom.getFullYear(),datefrom.getMonth(),datefrom.getDate())

                    dateto_f = formatterDay(date_pc)+'/'+formatterMonth(date_pc)+'/'+date_pc.getFullYear()
                    find = await result.findIndex(record => record.date === dateto_f )
                    let dayDif;

                    console.log(date_pc.getDay());
                    console.log(initDay);
                    

                    let type = date_pc.getDay() === initDay? 1 : 2;

                    if(type===1){

                        dayDif = null
                        quantity = parseFloat(records[it].quantity)*parseFloat(p_curve[0].theorical_performance)
                        result[find].fertEgg = parseInt(result[find].fertEgg) + Math.ceil(quantity)

                        await calculateIncubatorAndBoriler(date_pc,result,data,quantity)

                        await calculations(date_pc,records[it],p_curve,result,data,dayDif)


                    }else{

                        dayDif = (7+initDay)-date_pc.getDay();
                        quantity = ((parseFloat(records[it].quantity)*parseFloat(p_curve[0].theorical_performance))/7)*dayDif
                        result[find].fertEgg = parseInt(result[find].fertEgg) + Math.ceil(quantity)

                        await calculateIncubatorAndBoriler(date_pc,result,data,quantity)

                        addDays(date_pc,dayDif)

                        await calculations(date_pc,records[it],p_curve,result,data,dayDif)
                        
                    }
                            
                    
                }
                for (let i = 0; i < result.length; i++) {
                    if (result[i].fertEgg != 0) {
                        let arr = []
                        var res = result[i].date.split("/");
                        for (let j = 0; j < 7; j++) {
                            let date = new Date(res[2], res[1]-1, res[0])
                            date.setDate(date.getDate() + j)
                            arr.push({
                                date: date,
                                quantity: Math.ceil(result[i].fertEgg/7)
                            })
                        }
                        result[i].fertEggRecords = arr
                    }
                    if (result[i].dayoldChick != 0) {
                        let arr = []
                        var res = result[i].date.split("/");
                        for (let j = 0; j < 7; j++) {
                            let date = new Date(res[2], res[1]-1, res[0])
                            date.setDate(date.getDate() + j)
                            arr.push({
                                date: date,
                                quantity: Math.ceil(result[i].dayoldChick/7)
                            })
                        }
                        result[i].dayoldChickRecords = arr
                    }
                }

                await result.sort(function (a,b) {

                    if (a.date_ > b.date_) {
                        return 1;
                      }
                      if (a.date_ < b.date_) {
                        return -1;
                      }
                      // a must be equal to b
                      return 0;
            
                    
                    
                })

                result = await groupGoalsByWeek(result)

            })

            res.status(200).json({
                statusCode: 200,
                data: result
            });

    }).catch(function(err) {
        res.status(500).send(err);
    });
}      

async function calculations(date_pc,record,p_curve,result,data,dayDif) {

    let objResult = {
        date:"",
        date_:"",
        liftBreeding:0,
        breeding: 0,
        fertEgg: 0,
        dayoldChick: 0,
        liveChicken: 0
    }

    let dateto_f,quantity,find,date_in,e_data,date_br;

    // if(dayDif){
    //     console.log("dia distinto a inicio de semana",dayDif);
    // }else{
    //     console.log("dia de inicio de smena", dayDif);
    // }

    for (let i = 1; i < p_curve.length; i++) {
        
        if(dayDif==="" || dayDif===undefined || dayDif===null){addDays(date_pc,7)}
            
        let dateto_f = formatterDay(date_pc)+'/'+formatterMonth(date_pc)+'/'+date_pc.getFullYear()
        
        if(dayDif){
            quantity = (((record.quantity*parseFloat(p_curve[i-1].theorical_performance))/7)*(7-dayDif))+(((record.quantity*parseFloat(p_curve[i].theorical_performance))/7)*dayDif)
        }else{
            quantity = parseFloat(record.quantity)*parseFloat(p_curve[i].theorical_performance)
        }
        //console.log("cantidad cp",quantity);
        

        find = await result.findIndex(record => record.date === dateto_f )

        //console.log("date_pc antes del gen",date_pc);
        //let resultNew = await generateRecordsPC(dayDif,date_pc,quantity)
        //console.log("resultnew",resultNew);
        
        

        if(find >= 0){
            //console.log("antes",result[find]);
            result[find].fertEgg = result[find].fertEgg + Math.ceil(quantity)
            //console.log("despues",result[find]);
            
            //result[find].detailsPC = await addDetails(result[find].detailsPC,resultNew);
            //console.log("result",result[find].detailsPC);
            
        }else{
            let res = dateto_f.split("/");
            let date = new Date(res[2], res[1]-1, res[0])
            objResult.date=dateto_f
            objResult.date_=date
            //objResult.detailsPC=resultNew
            objResult.fertEgg=Math.ceil(quantity)
            //let copy = Object.assign({}, objResult);
            result.push(Object.assign({}, objResult));
            resetObjResult(objResult);
        }

        //console.log("ya guarde el cp");
        
        await calculateIncubatorAndBoriler(date_pc,result,data,quantity)

        //console.log("ya guarde el br");

        if(dayDif!==null){
            console.log("me incremente al final");
            
            addDays(date_pc,7)}

        //console.log("iteracion",i);
        
        
    }


    
}

async function calculateIncubatorAndBoriler(date_pc,result,data,quantity) {

    let objResult = {
        date:"",
        date_:"",
        liftBreeding:0,
        breeding: 0,
        fertEgg: 0,
        dayoldChick: 0,
        liveChicken: 0
    }

        //calculos de incubadora

        let date_in = new Date (date_pc.getFullYear(),date_pc.getMonth(),date_pc.getDate())
        let find = await data.findIndex(record => record.stage_id === 2)
        let e_data = data[find]

        addDays(date_in,e_data.historical_duration)
        let dateto_f = formatterDay(date_in)+'/'+formatterMonth(date_in)+'/'+date_in.getFullYear()

        quantity = quantity - quantity*(parseFloat(e_data.historical_decrease)/100) 

        find = await result.findIndex(record => record.date === dateto_f )
        

        if(find >= 0){
            result[find].dayoldChick = result[find].dayoldChick + Math.ceil(quantity)
        }else{
            let res = dateto_f.split("/");
            let date = new Date(res[2], res[1]-1, res[0])
            objResult.date=dateto_f
            objResult.date_=date
            objResult.dayoldChick=Math.ceil(quantity)
            //let copy = Object.assign({}, objResult);
            result.push(Object.assign({}, objResult));
            resetObjResult(objResult);
        }
        
        //calculos de engorde

        let date_br = new Date (date_in.getFullYear(),date_in.getMonth(),date_in.getDate())
        find = await data.findIndex(record => record.stage_id == 1)
        e_data = data[find]

        addDays(date_br,e_data.historical_duration)
        dateto_f = formatterDay(date_br)+'/'+formatterMonth(date_br)+'/'+date_br.getFullYear()

        quantity = quantity - quantity*(parseFloat(e_data.historical_decrease)/100) 

        find = await result.findIndex(record => record.date === dateto_f )

        if(find >= 0){
            result[find].liveChicken = result[find].liveChicken + Math.ceil(quantity)
        }else{
            let res = dateto_f.split("/");
            let date = new Date(res[2], res[1]-1, res[0])
            objResult.date=dateto_f
            objResult.date_=date
            objResult.liveChicken=Math.ceil(quantity)
            //let copy = Object.assign({}, objResult);
            result.push(Object.assign({}, objResult));
            resetObjResult(objResult);
        }
    
}

function formatterMonth(date) {

    return (date.getMonth() < 9 ? "0"+(date.getMonth()+1) : date.getMonth()+1);
   
}

function formatterDay(date) {

    return (date.getDate() < 10 ? "0"+date.getDate() : date.getDate());
   
}

function resetObjResult(obj) { 
 
    obj.date =""
    obj.date_ =""
    obj.liftBreeding = 0
    obj.breeding = 0
    obj.fertEgg = 0
    obj.dayoldChick = 0
    obj.liveChicken = 0

}

function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}





// **** Inicio ConfTenica ****
/**
 * Petición GET que llama a la función DBgetAllProcessJ del modelo Process y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function getAllProcessJ(req, res) {
    DBlayer.DBgetAllProcessJ()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err)
            res.status(500).send(err);
        });
}

/**
 * Petición POST que reciba la data de la vista y la envía a la función DBaddProcess del modelo Process para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function addProcess(req, res) {
    DBlayer.DBaddProcess(req.body)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
            console.log(err);
        });
}

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateProcess del modelo Process para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function updateProcess(req, res) {
    DBlayer.DBupdateProcess(req.body)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
}

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteProcess del modelo Process para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function deleteProcess(req, res) {
    DBlayer.DBdeleteProcess(req.body.process_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
}

/**
 * Petición POST, recibe de la vista el id de la raza y proceso. Llama a la funcion DBfindProcessPredecessors del modelo Process
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function findProcessPredecessors(req, res) {
    let breed_id = req.body.breed_id,
        process_id = req.body.process_id;

    DBlayer.DBfindProcessPredecessors(breed_id, process_id)
        .then(function (data) {
            console.log("datsa", data)
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log("error::", err)
            res.status(500).send(err);
        });
}

/**
 * Petición GET que llama a la función DBgetAllProcess del modelo Process y devuelve todos los registros
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function getAllProcess(req, res) {
    DBlayer.DBgetAllProcess()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
}

/**
 * Petición POST, recibe de la vista el id y llama a la función DBisBeingUsed del modelo process oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
function isBeingUsed(req, res) {
    DBlayer.DBisBeingUsed(req.body.process_id)
        .then(function (data) {
            console.log(data)
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

// **** Fin ConfTenica ****

function findProcessByStage(req, res) {
    DBlayer.DBfindProcessByStage(req.body.stage_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
}

function findProcessBreedByStage(req, res) {
    //   console.log("req.body.stage_id: ", req.body.stage_id);
    DBlayer.DBfindProcessBreedByStage(req.body.stage_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
}

function findProcessByStageBreed(req, res) {

    DBlayer.DBfindProcessByStageBreed(req.body.stage_id, req.body.breed_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
}


module.exports = {
    getAllProcess,
    getAllProcessJ,
    addProcess,
    updateProcess,
    deleteProcess,
    findProcessByStage,
    findProcessBreedByStage,
    findProcessByStageBreed,
    findProcessPredecessors,
    isBeingUsed,
    recalculateGoals
};