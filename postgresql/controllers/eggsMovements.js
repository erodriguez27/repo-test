const DBlayer = require("../models/eggsMovements");
const utils = require("../../lib/utils");
const DBlayerS = require("../models/eggsStorage");
const DBincubatorPlant = require("../models/incubatorPlant");

exports.addEggsMovements = async function (req, res) {
    let eggsMovements = req.body.registers;
    utils.cleanObjects(eggsMovements);
    console.log(eggsMovements);
    DBlayer.DBaddEggsMovements(eggsMovements).then(function (data) {
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).send(err);
    });
};

exports.findInventoryRealByPartnership = async function (req, res) {

    let partnership_id = req.body.partnership_id;
    // console.log("Storage: ", partnership_id);
    let results;
    let records = [],divFases = [];
  
    try {

        try {
            results = await DBlayer.DBfindInventoryRealByPartnership(partnership_id);
            // console.log(results);
 
            if (results.length > 0) {
                let prev = results[0].incubator_plant_id,
                    prev_day = results[0]._day,
                    acclimatization = results[0].min_storage,
                    appropriate = results[0].max_storage - results[0].min_storage,
                    expired = results[0].max_storage,
                    res_length = results.length - 1,
                    sumAcclimatization = 0,
                    sumAppropriate = 0,
                    sumExpired = 0;

                let aDays = [],
                    num_lot = [],
                    sum_day = 0,
                    acclimEggs = [],
                    appropEggs = [],
                    daysss=0,
                    expireEggs = [];
                let datinit;
                let datEnd;
   
                for (let i = 0; results.length > i; i++) {
                    let band = 0;

                    datinit = (results[i].init_date);
                    datEnd =  (results[i].end_date);
                    init_date = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
                    end_date = `${datEnd.getDate()}/${datEnd.getUTCMonth()+1}/${datEnd.getFullYear()}`;

                    if (prev === results[i].incubator_plant_id) {

                        if (results[i]._day <= acclimatization) {
                            sumAcclimatization += parseInt(results[i].eggss);
                        } else if (appropriate <= results[i]._day && expired >= results[i]._day) {
                            sumAppropriate += parseInt(results[i].eggss);
                            band = 1;
                        } else {
                            //Huevos vencidos
                            sumExpired += parseInt(results[i].eggss);
                            band = 2;
                        }
                        let DaysTotal = results[i].eggss*results[i]._day;
                        daysss = (daysss+ DaysTotal);

                        // console.log(prev_day, ' ==', results[i]._day);
                        if (prev_day == results[i]._day) {
                            sum_day += parseInt(results[i].eggss);
                            let iof = num_lot.indexOf(results[i].lot);
                            // console.log("iof: ", iof);
                            if (iof == -1) {
             
                                num_lot.push({
                                    "eggs_storage_id": results[i].eggs_storage_id,
                                    "lot": results[i].lot,
                                    "eggs": results[i].eggss,
                                    "init_date": end_date,
                                    "end_date": init_date
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
                                "eggs": results[i].eggss,
                                "init_date": end_date,
                                "end_date": init_date
                            });
                            sum_day += parseInt(results[i].eggss);
                        }

                    }
      
                    if (band == 0) {
                        acclimEggs.push({
                            "eggs_storage_id": results[i].eggs_storage_id,
                            "lot": results[i].lot,
                            "eggs": results[i].eggss,
                            "init_date": end_date,
                            "end_date": init_date
                        });
                    }else{
                        if (band == 1) {
                            appropEggs.push({
                                "eggs_storage_id": results[i].eggs_storage_id,
                                "lot": results[i].lot,
                                "eggs": results[i].eggss,
                                "init_date": end_date,
                                "end_date":init_date
                            });
                        }else{
                            expireEggs.push({
                                "eggs_storage_id": results[i].eggs_storage_id,
                                "lot": results[i].lot,
                                "eggs": results[i].eggss,
                                "init_date": end_date,
                                "end_date": init_date
                            });
                        }
                    }
      
                    // console.log(prev);
                    // console.log(results[i].incubator_plant_id);
                    // console.log(res_length);
                    // console.log(i);
                    // console.log(results[i]);
                    if (res_length == i || prev != results[i].incubator_plant_id) {
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
                        obj.available = parseInt(aAvailable[0].eggss);
                        obj.total = 0;
                        // console.log(OptDisp);
                        if (OptDisp[0].acclimatized) {
                            obj.total =  obj.total + sumAcclimatization;
                        }
                        if (OptDisp[0].suitable) {
                            obj.total =  obj.total + sumAppropriate;
                        }
                        if (OptDisp[0].expired) {
                            obj.total =  obj.total + sumExpired;
                        }
                        // obj.total = sumAcclimatization + sumAppropriate + sumExpired;
          
                        divide= (sumAcclimatization + sumAppropriate + sumExpired);
                        obj._days = daysss/divide;
                        obj.info_lot = aDays;

                        records.push(obj);
                        divFases.push({
                            name: namess,
                            acc: acclimEggs,
                            app: appropEggs,
                            exp: expireEggs
                        });
                        daysss=0;
                        acclimEggs = [];
                        appropEggs = [];
                        expireEggs = [];
                        aDays = [];
                    }
                }

            }
        } catch (error) {
            console.log(error);
        }

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

exports.addMovementOriginal =  function (req, res) {

    DBlayerS.DBaddDateOriginal(req.body.incub_id,req.body.scenario_id,
        req.body.breed_id,req.body.pDate,req.body.lot,req.body.EggsC)
        .then(function(data) {
   
            DBlayer.DBaddMovementOriginal(req.body.pDate,req.body.lot,req.body.EggsC,data.eggs_storage_id) 
                .then(function(data2) {
                    res.status(200).json({
                        statusCode: 200,
                        data: data2
                    });
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send(err);
                });
        }) .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.updateEggsMovements =  function (req, res) {
    let eggsMovements = req.body.registers;
    utils.cleanObjects(eggsMovements);
    console.log(eggsMovements);
    DBlayer.DBupdateEggsMovements(eggsMovements)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.veriInventaOri=  function (req, res) {
    DBlayer.DBVerOriginal() 
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.totalRecord = function(req,res){
    DBlayer.DBrecordIngresos() .then(function(ingresos) {
        ingresos.forEach(element => {
            datinit = (element.fecha_movements);
            // console.log(datinit);
            date = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
            element.fecha_movements = date;
        });
        DBlayer.DBrecordEgresos() .then(function(egresos) {
            egresos.forEach(element => {
                datinit = (element.fecha_movements);
                // console.log(datinit);
                date = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
                element.fecha_movements = date;
            });

            DBlayer.DBrecordAjustes() .then(function(ajustes) {
                ajustes.forEach(element => {
                    datinit = (element.fecha_movements);
                    // console.log(datinit);
                    date = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
                    element.fecha_movements = date;
                });
         
                res.status(200).json({
                    statusCode: 200,
                    ingresos: ingresos,
                    egresos: egresos,
                    ajustes, ajustes
                });
            });
        });
    })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.ajusteMovement = function(req,res){

    let datinit = new Date(req.body.dayparm1);
    let datEnd =  new Date(req.body.dayparm2);
    let init_date = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
    let end_date = `${datEnd.getDate()}/${datEnd.getUTCMonth()+1}/${datEnd.getFullYear()}`;

    DBlayer.DBajusteMovementDate(init_date,end_date).then(function(data) {
        data.forEach(element => {
            datinit = (element.fecha_movements);
            element.fecha_movements = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
        });
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.findIngresoOfEgresoDate =  function(req,res){
  
    let datinit = new Date(req.body.dayparm1);
    let datEnd =  new Date(req.body.dayparm2);
    let init_date = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
    let end_date = `${datEnd.getDate()}/${datEnd.getUTCMonth()+1}/${datEnd.getFullYear()}`;

    DBlayer.DBFindIngresoOfEgresoDate(init_date,end_date).then(function(data) {

        data.forEach(element => {
            datinit = (element.fecha_movements);
            element.fecha_movements = `${datinit.getDate()}/${datinit.getUTCMonth()+1}/${datinit.getFullYear()}`;
        });

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });

};