const DBlayer = require("../models/eggsStorage");
const DBprogrammedEggs = require("../models/programmedEggs");
const DBincubator = require("../models/incubator");
const DBincubatorPlant = require("../models/incubatorPlant");
const DBeggsMovements = require("../models/eggsMovements");

exports.findEggsStorageByDateDetail = async function(req, res) {

    // console.log("la funcion de hoy en el back controller")

    //console.log("BRAYAN: ", req.body);
    try {
        let scenario_id =  req.body.scenario_id,
            breed_id = req.body.breed_id,
            incubator_plant_id = req.body.incubator_plant_id,
            date = req.body.date,
            partnership_id = req.body.partnership_id;

        let results = await DBeggsMovements.DBfindEggsStorageByDateDetail(scenario_id, breed_id, incubator_plant_id, date),
            aIncubator = await DBincubator.DBfindIncubatorByPlant(incubator_plant_id);

        // console.log("lo que se supone que es")
        // console.log(results);
        let incubator = [];
        aIncubator.forEach(item=>{
            incubator.push(item.incubator_id);

        });
        // console.log("AQUI:  ---- : ", incubator);
        let records = await DBprogrammedEggs.DBfindProgrammerLot(breed_id, incubator, date);

        // console.log("records: ", records);
        // console.log("-----------------")
        let programmed_eggs = [];

        records.forEach(item=>{
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

        // let available = await DBlayer.DBfindEggsStorageByDate(scenario_id, breed_id, incubator_plant_id, date);
        let available = await DBeggsMovements.DBfindEggsStorageByDateVer2(partnership_id,date);
        // console.log("aca:",available[0].eggs);
          
        res.status(200).json({
            statusCode: 200,
            data: results,
            records: programmed_eggs,
            available: parseInt(available[0].eggs)
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findInventoryByPartnership = async function(req, res) {

    try {
        let partnership_id = req.body.partnership_id;
        // console.log("Storage: ", partnership_id);
        let results;
        try {
            results = await DBlayer.DBfindInventoryByPartnership(partnership_id);
            // console.log(results);
        } catch (error) {
            console.log(error);
        }
    
        let records = [],
            divFases = [];

        if(results.length>0){
            let prev = results[0].incubator_plant_id,
                prev_day = results[0]._day,
                acclimatization = results[0].min_storage,
                appropriate = results[0].max_storage - results[0].min_storage,
                expired = results[0].max_storage,

                res_length = results.length-1,
                sumAcclimatization = 0,
                sumAppropriate = 0,
                sumExpired = 0;

            let aDays = [],
                num_lot = [],
                sum_day = 0,
                acclimEggs = [],
                appropEggs = [],
                expireEggs = [];

            // console.log(results.length);
            let DaysTotal = 0;
            for (let i = 0; results.length > i; i++) {
                if (results[i].oldEggs != null  || results[i].eggs != null) {

                    let band = 0;
                    datinit = (results[i].init_date);
                    datEnd =  (results[i].end_date);
                    init_date = `${datinit.getDate()}/${(datinit.getUTCMonth())+1}/${datinit.getFullYear()}`;
                    end_date = `${datEnd.getDate()}/${(datEnd.getUTCMonth())+1}/${datEnd.getFullYear()}`;
         
                    // console.log(results[i]._day);
                    if (prev === results[i].incubator_plant_id) {
           
                        if (results[i]._day <= acclimatization) {
                            sumAcclimatization += parseInt(results[i].eggs);
                            // console.log(acclimatization);
                        } else if (appropriate <= results[i]._day && expired >= results[i]._day) {
                            sumAppropriate += parseInt(results[i].eggs);
                            band = 1;
                            // console.log(appropriate);
                        } else {
                            //Huevos vencidos
                            // console.log(expired);
                            sumExpired += parseInt(results[i].eggs);
                            band = 2;
                        }
                        DaysTotal = DaysTotal + (results[i].eggs*results[i]._day);
      
  
                        // console.log(prev_day, ' ==', results[i]._day);
                        if (prev_day == results[i]._day) {

                            sum_day += parseInt(results[i].eggs);
                            let iof = num_lot.indexOf(results[i].lot);
                            // console.log("iof: ", iof);
                            if (iof == -1) {
                                num_lot.push({
                                    "eggs_storage_id": results[i].eggs_storage_id,
                                    "lot": results[i].lot,
                                    "eggs": results[i].eggs,
                                    "init_date": init_date,
                                    "end_date": end_date
                                });
                            }
                        } else {
                            aDays.push({
                                day: prev_day,
                                eggs: sum_day,
                                num_lot: num_lot.length,
                                lot: num_lot
                            });
                            sum_day = 0;
                            num_lot = [];
                            prev_day = results[i]._day;
                            num_lot.push({
                                "eggs_storage_id": results[i].eggs_storage_id,
                                "lot": results[i].lot,
                                "eggs": results[i].eggs,
                                "init_date": init_date,
                                "end_date": end_date
                            });
                            sum_day += parseInt(results[i].eggs);
                        }
  
                    }

                    if (band == 0) {
                        acclimEggs.push({
                            "eggs_storage_id": results[i].eggs_storage_id,
                            "lot": results[i].lot,
                            "eggs": results[i].eggs,
                            "init_date": init_date,
                            "end_date": end_date
                        });
                    }else{
                        if (band == 1) {
                            appropEggs.push({
                                "eggs_storage_id": results[i].eggs_storage_id,
                                "lot": results[i].lot,
                                "eggs": results[i].eggs,
                                "init_date": init_date,
                                "end_date":end_date
                            });
                        }else{
                            expireEggs.push({
                                "eggs_storage_id": results[i].eggs_storage_id,
                                "lot": results[i].lot,
                                "eggs": results[i].eggs,
                                "init_date": init_date,
                                "end_date": end_date
                            });
                        }
                    }
                    // console.log(prev);
                    // console.log(results[i].incubator_plant_id);
                    // console.log(res_length);
                    // console.log(i);
                    // console.log(results[i]);

                    if (res_length == i || prev != results[i].incubator_plant_id) {
                        // console.log('entramos');
                        aDays.push({
                            day: prev_day,
                            eggs: sum_day,
                            num_lot: num_lot.length,
                            lot: num_lot
                        });
                        acclimatization = results[i].min_storage;
                        appropriate = results[i].min_storage - results[i].max_storage;
                        expired = results[i].max_storage;
                        prev = results[i].incubator_plant_id;
  
                        let obj = {};
                        let namess;
                        if (i == 0) {
                            obj.name = results[i].name;
                            namess = results[i].name;
                        }else{
                            obj.name = results[i - 1].name;
                            namess = results[i - 1].name;
                        }

                        let Inc_id;
                        if (i==0) {
                            Inc_id = results[i].incubator_plant_id;
                        }else{
                            Inc_id = results[i - 1].incubator_plant_id;
                        }
         
                        obj.acclimatization = sumAcclimatization;
                        obj.appropriate = sumAppropriate;
                        obj.expired = sumExpired;

                        let aAvailable;
                        try {
                            if (i == 0) {
                                aAvailable = await DBlayer.DBfindAvailableByPlant(results[i].incubator_plant_id);
                            }else{
                                aAvailable = await DBlayer.DBfindAvailableByPlant(results[i - 1].incubator_plant_id);
                            }
                        } catch (error) {
                            console.log(error);
                        }
                        let OptDisp;
                        if (i == 0) {
                            OptDisp = await DBincubatorPlant.DBOptiDisp(results[i].incubator_plant_id);
                        }else{
                            OptDisp = await DBincubatorPlant.DBOptiDisp(results[i - 1].incubator_plant_id);
                        }

                        obj.available = parseInt(aAvailable[0].eggs);
                        obj.total = 0;
       
                        if (OptDisp[0].acclimatized) {
                            obj.total =  obj.total + sumAcclimatization;
                        }
        
                        if (OptDisp[0].suitable) {
                            obj.total =  obj.total + sumAppropriate;
                        }
            
                        if (OptDisp[0].expired) {
                            obj.total =  obj.total + sumExpired;
                        }

                        obj.id = Inc_id;
                        // obj.total = sumAcclimatization + sumAppropriate + sumExpired;
                        // console.log(DaysTotal)
                        // console.log(obj.total)
                        if (obj.total != 0) {
                            obj._days = DaysTotal/obj.total;
                        }else{
                            obj._days = DaysTotal/(sumAcclimatization+sumAppropriate+sumExpired);
                        }
          

                        obj.info_lot = aDays;
                        //  console.log(obj);
                        records.push(obj);
                        divFases.push({
                            name:namess,
                            id: Inc_id,
                            acc: acclimEggs,
                            app: appropEggs,
                            exp: expireEggs
                        });
                        DaysTotal=0;
                        acclimEggs = [];
                        appropEggs = [];
                        expireEggs = [];
                        aDays = [];
                    }        
                }
            }
        }

        //  console.log(records);
        //  console.log(divFases);
   
        res.status(200).json({
            statusCode: 200,
            data: records,
            data2: divFases
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};



exports.findAllDateQuantityFarmProductReproductora = function(req, res) {
    // console.log("llego al controlador")
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

exports.findAllEggsStorage = function (req, res) {
    DBlayer.DBfindAllEggsStorage(req.body)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findEggsStorageByLotAndDate = function (req, res) {
    // console.log("LE LLEGO EN INTEGRACION")
    DBlayer.DBfindEggsStorageByLotAndDate(req.body)
        .then(function (data) {
            // console.log("la data")
            // console.log(data)
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

exports.updateExecutedEggs = async function (req, res) {
    // console.log(req.body)
    var params = req.body;
    if(params.year == "Todos")
    {
        params.year = "0";
        params.end_year = "9999";
    }
    else
        params.end_year = params.year;
    
    let records= req.body.records;
    let vpromise=[];
    records.forEach(item=>{
        let promise = DBlayer.DBupdateExecutedEggs(item); 
        vpromise.push(promise);
    });

    // console.log("vpromise")
    // console.log(vpromise)

    Promise.all(vpromise).then(function(values) {
    // DBlayer.DBfindEggsStorageByLotAndDate(req.body)
        DBlayer.DBfindEggsStorageDetailByYearWeekBreedLot(params)
            .then(function (data) {
                res.status(200).json({
                    statusCode: 200,
                    data: data
                });
            })
            .catch(function (err) {
                console.log("err1", err);
                res.status(500).send(err);
            });
    }).catch(function (err) {
    // console.log("err2");
        console.log(err);
        res.status(500).send(err);
    });
};

exports.findEggsStorageDataReport = function (req, res) {
    var params = req.body;

    if(params.year == "Todos")
    {
        params.year = "0";
        params.end_year = "9999";
    }
    else
        params.end_year = params.year;
    console.log("ASDFGHJ")
    DBlayer.DBfindEggsStorageDataReport(params)
        .then(function (data) {
            // console.log("data de la consulta reportes")
            // console.log(data)

            let nMod = [];
            let ddate;
            let formatDate;
            let i = 0;
            let x;
            data.forEach(element => {
                if(element.eggs_executed==null){
                    x=0;
                }else{
                    x=element.eggs_executed;
                }
                ddate= new Date(element.init_date);
                formatDate= `${(ddate.getDate() < 10 ? "0" : "") + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? "0" : "") + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                // posturecurve.setProperty("/formateDate", formatDate);

                element.formatDate= formatDate;
                let float = {
                    formatDate: element.formatDate,
                    lot: element.lot,
                    projected: element.eggs,
                    executed: x,
                    percen: ((x*100)/element.eggs).toFixed(2)
                };
                nMod.push(float);
                i++;
            });
            res.status(200).json({
                statusCode: 200,
                data: data,
                nMod: nMod
            });
        })
        .catch(function (err) {
            console.log("my bad", err)
            res.status(500).send(err);
        });
};

exports.findEggsStorageDataReportNew = function (req, res) {
    var params = req.body;

    if(params.year == "Todos")
    {
        params.year = "0";
        params.end_year = "9999";
    }
    else
        params.end_year = params.year;
    console.log("Rock")
    DBlayer.DBfindEggsStorageDataReportNew(params)
        .then(function (data) {
            // console.log("data de la consulta reportes")
            // console.log(data)

            let nMod = [];
            let ddate;
            let formatDate;
            let i = 0;
            let x;
            data.forEach(element => {
                if(element.eggs_executed==null){
                    x=0;
                }else{
                    x=element.eggs_executed;
                }
                ddate= new Date(element.init_date);
                formatDate= `${(ddate.getDate() < 10 ? "0" : "") + ddate.getDate()}/${((ddate.getMonth() + 1) < 10 ? "0" : "") + (ddate.getMonth() + 1)}/${ddate.getFullYear()}`;
                // posturecurve.setProperty("/formateDate", formatDate);

                element.formatDate= formatDate;
                let float = {
                    formatDate: element.formatDate,
                    lot: element.lot,
                    projected: element.eggs,
                    executed: x,
                    percen: ((x*100)/element.eggs).toFixed(2)
                };
                nMod.push(float);
                i++;
            });
            res.status(200).json({
                statusCode: 200,
                data: nMod,
                nMod: nMod
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findAllEggsStorageView = function (req, res) {
    var params = req.body;
    
    if(params.year == "Todos")
    {
  	params.year = "0";
  	params.end_year = "9999";
    }
    else
  	params.end_year = params.year;

    DBlayer.DBfindAllEggsStorageView(params)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log("Error en findAll::::",err)
            res.status(500).send(err);
        });
};

exports.findEggsStorageByWeek = async function (req, res) {
    var params = req.body;
    if(params.year == "Todos")
    {
  	params.year = "0";
  	params.end_year = "9999";
    }
    else
  	params.end_year = params.year;

    DBlayer.DBfindEggsStorageByWeek(params)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findEggsStorageLots = function (req, res) {
    console.log(req.body)
    DBlayer.DBfindEggsStorageLots(req.body)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findEggsStorageLotsFather = function (req, res) {
    console.log("parametros lots father",req.body)
    DBlayer.DBfindEggsStorageLotsFather(req.body)
        .then(function (data) {
            console.log("lotes father :",data.length)
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findEggsStorageLotsChilds = function (req, res) {
    DBlayer.DBfindEggsStorageLotsChilds(req.body)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};
exports.findEggsStorageByYearBreedLot = async function (req, res) {
    var toSend = new Array();
    var i = 0, sum = 0, params = req.body;

    if(params.year == "Todos")
    {
        params.year = "0";
        params.end_year = "9999";
    }
    else
        params.end_year = params.year;

    data = await DBlayer.DBfindEggsStorageByYearBreedLot(params);
    console.log("Data::::: ", data)
    while(i < data.length)
    {
        sum = await DBlayer.DBfindEggsStorageByWeek({"breed_id": req.body.breed_id, "num_week": data[i].num_week, "init_week": data[i].week, "year": params.year, "end_year": params.end_year, "scenario_id": params.scenario_id, "parent_lot": params.parent_lot}).reduce((pv, cv) => pv + parseInt(cv.eggs), 0);
        ob = {
            "lot": req.body.lot,
            "week": data[i].week,
            "num_week": data[i].num_week,
            "lot_eggs": data[i].eggs,
            "week_eggs": sum,
            "eggs_executed": data[i].eggs_executed,
            "evictionprojected": data[i].evictionprojected
        };
        toSend.push(ob);
        i++;
    }
    res.status(200).json({
        statusCode: 200,
        data: toSend
    });
};

exports.findEggsStorageYears = async function (req, res) {
    DBlayer.DBfindEggsStorageYears()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findEggsStorageByYearBreedLotAllChilds = async function (req, res) {
    var toSend = new Array();
    var i = 0, sum = 0, params = req.body;

    if(params.year == "Todos")
    {
        params.year = "0";
        params.end_year = "9999";
    }
    else
        params.end_year = params.year;

    data = await DBlayer.DBfindEggsStorageByYearBreedLotAllChilds(params);
    while(i < data.length)
    {
        sum = await DBlayer.DBfindEggsStorageByWeek({"breed_id": req.body.breed_id, "num_week": data[i].num_week, "init_week": data[i].week, "year": params.year, "end_year": params.end_year, "parent_lot": params.lot, "scenario_id": params.scenario_id}).reduce((pv, cv) => pv + parseInt(cv.eggs), 0);
        ob = {
            "lot": 'Todos',
            "week": data[i].week,
            "num_week": data[i].num_week,
            "lot_eggs": data[i].eggs,
            "week_eggs": sum,
            "eggs_executed": data[i].eggs_executed
        };
        toSend.push(ob);
        i++;
    }
    res.status(200).json({
        statusCode: 200,
        data: toSend
    });
};

exports.findEggsStorageDetailByYearWeekBreedLot = async function (req, res) {
    console.log("lo recibido en la consulta");
    console.log(req.body);
    console.log("finalizo lo recibido en la consulta");
    var params = req.body;
    if(params.year == "Todos")
    {
        params.year = "0";
        params.end_year = "9999";
    }
    else
        params.end_year = params.year;
    
    DBlayer.DBfindEggsStorageDetailByYearWeekBreedLot(params)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};