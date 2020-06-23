const DBlayer = require("../models/incubator");
const BDscenarioPostureCurve = require("../models/scenarioPostureCurve");
const DBscenarioParameter = require("../models/scenarioParameter");
// const DBscenarioHen = require('../models/scenarioHen');
const DBprocess = require("../models/process");
const DBscenario = require("../models/Scenario");
const DBeggsPlanning = require("../models/eggsPlanning");
const DBeggsRequired = require("../models/eggsRequired");
const DBeggsStorage = require("../models/eggsStorage");
const DBeggsMovements = require("../models/eggsMovements");
const DBincubatorPlant = require("../models/incubatorPlant");
const DBprogrammedEggs = require("../models/programmedEggs");
const utils = require("../../lib/utils");


// **** Inicio ConfTenica ****

/**
 * Función POST, Recibe la planta incubadora seleccionada y la pasa como parámetro a la función DBfindIncubatorByPlant
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findIncubatorByPlant = async function(req, res) {
    try {
        let data  = await DBlayer.DBfindIncubatorByPlant(req.body.incubator_plant_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        res.status(500).send(err);
    }
};

/**
 * Petición POST que reciba la data de la vista y la envía a la función DBaddIncubator del modelo Incubator para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addIncubator = async function(req, res) {
    try {
        let data  = await DBlayer.DBaddIncubator(req.body.incubator_plant_id ,req.body.name, req.body.code,
            req.body.description, req.body.capacity, req.body.sunday,
            req.body.monday, req.body.tuesday, req.body.wednesday, req.body.thursday,
            req.body.friday, req.body.saturday, req.body.available, req.body.order);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        res.status(500).send(err);
    }
};

/**
 * Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteIncubator del modelo Incubator para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteIncubator = function(req, res) {
    DBlayer.DBdeleteIncubator(req.body.incubator_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Planta Eliminada"
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

/**
 * Petición PUT que reciba la data de la vista y la envía a la función DBupdateIncubator del modelo Incubator para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateIncubator = function(req, res) {
    let agregado;
    agregado =  req.body.capacity - req.body.available; 
    req.body.available = req.body.available + agregado;
  
    DBlayer.DBupdateIncubator(req.body.incubator_id, req.body.name, req.body.code,
        req.body.description, req.body.capacity, req.body.sunday,
        req.body.monday, req.body.tuesday, req.body.wednesday, req.body.thursday,
        req.body.friday, req.body.saturday,req.body.available, req.body.order)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};


/**
 * Petición POST, recibe de la vista el id llama a la función DBisBeingUsed del modelo Parameter para verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = async function(req, res) {
    DBlayer.DBisBeingUsed(req.body.incubator_id)
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


// **** fin ConfTenica ****

exports.findIncubatorByPlant2 = async function(req, res) {
    console.log("findIncubatorByPlant2");
    // let date = new Date()
    let date = req.body.date;
    console.log("la recibida");
    console.log(date);

    let aDate = date.split("/"),
        nDate = new Date(aDate[2], aDate[1]-1, aDate[0]);

    // let end_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;

    console.log("la formateada");
    console.log(nDate);

    let end_date = `${nDate.getFullYear()}-${nDate.getMonth()+1}-${nDate.getDate()}`;

    console.log("la final");
    console.log(end_date);
 

    await DBlayer.DBupdateIncubator2(end_date);
    console.log("salio");
    // console.log(mod)

    await DBprogrammedEggs.DBupdateProgrammedStatus(end_date);
    console.log("salio2");
    // console.log(req.body);
    try {
        let data  = await DBlayer.DBfindIncubatorByPlant(req.body.incubator_plant_id);

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.findIncubatorByDay = async function(req, res) {
    console.log("findIncubatorByDay");
    // let date = new Date()
    let date = req.body;
    console.log("la recibida");
    console.log(date);

    await DBlayer.DBupdateIncubator2(req.body.date);
    console.log("salio");
    // console.log(mod)

    await DBprogrammedEggs.DBupdateProgrammedStatus(req.body.date);
    console.log("salio2");





    try {


        let data  = await DBlayer.DBfindIncubatorByPlantWithCapacity(req.body.incubator_plant_id);
        console.log("la consulta por dia");
        console.log(data);
      

        // var keys = Object.keys(data);
        // console.log(keys[0])


        let lasFinales = data.filter(function(item){
            return item[req.body.day]==1;
        });

        console.log("las finales");
        console.log(lasFinales);


        // let lasFInales = data.filter(data => data.req.body.day == 1);





        res.status(200).json({
            statusCode: 200,
            data: lasFinales
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};


exports.findIncubatorByDate = async function (req, res) {
    console.log("findIncubatorByDate");
    
    let body = req.body,
        incubator_plant_id = body.incubator_plant_id,
        date = body.date,
        day = req.body.day;
    console.log("body:::: ", body)
    if (date !== undefined && date !== null && day !== undefined && day !== null && incubator_plant_id !== undefined && incubator_plant_id !== null) {
        console.log("la recibida");
        console.log(date);

        await DBlayer.DBforceupdateIncubator();
        await DBlayer.DBupdateIncubator2(date);
        console.log("salio");

        await DBprogrammedEggs.DBupdateProgrammedStatus(date);
        console.log("salio2");

        try {

            console.log('El dia:::::: ', day);
            let data = await DBlayer.DBfindIncubatorByPlantAndDate(incubator_plant_id, date, day, 22);
            console.log("la consulta por dia trajo ");
            // console.log(data.length, " registros");

            res.status(200).json({
                statusCode: 200,
                data: data
            });

        } catch (err) {
            console.log(err);
            res.status(500).send(err);
        }

    } else {
        res.status(500).send(err);
    }
};

exports.bulkAddIncubator2 = utils.wrap(async function (req, res) {
    const incubators = req.body.registers;
    const incubatorPlants = await DBincubatorPlant.DbKnowincubatorPlan_id2(incubators);
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const errors = [];

    for (const incubator of incubators) {
        for (const day of days) {
            incubator[day] = incubator[day].toUpperCase(0) === "SI" ? 1 : 0;
        }

        const incubatorPlantMatch = incubatorPlants.find(incubatorPlant => 
            incubatorPlant.partnership_code === incubator.partnershipCode
      && incubatorPlant.incubator_plant_code === incubator.incubatorPlantCode
        );

        if (incubatorPlantMatch !== undefined) {
            incubator.incubator_plant_id = incubatorPlantMatch.incubator_plant_id;
        }
        else {
            errors.push({object: incubator, message: `la combinacion de empresa: ${incubator.partnershipCode} y planta incubadora : ${incubator.incubatorPlantCode} no existe`});
        }
    }

    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }

    const result = await DBlayer.DBbulkAddIncubator(incubators);
    res.status(200).json({
        statusCode: 200,
        data: result
    });



});

exports.bulkAddIncubator = function (req, res) {
    let J = 0;
    let band = false;
    DBincubatorPlant.DbKnowincubatorPlan_id(req.body.registers).then(function (pa_id) {
        for (let index = 0; index < req.body.registers.length; index++) {
            while (J < pa_id.length && !band) {
                if (req.body.registers[index].incubator_plant_id == pa_id[J].code) {
                    req.body.registers[index].incubator_plant_id = pa_id[J].incubator_plant_id;
                    band = true;
                }
                J++;
            }
            if (req.body.registers[index].sunday == "SI") {
                req.body.registers[index].sunday = 1;
            } else {
                req.body.registers[index].sunday = 0;
            }

            if (req.body.registers[index].monday == "SI") {
                req.body.registers[index].monday = 1;
            } else {
                req.body.registers[index].monday = 0;
            }

            if (req.body.registers[index].tuesday == "SI") {
                req.body.registers[index].tuesday = 1;
            } else {
                req.body.registers[index].tuesday = 0;
            }

            if (req.body.registers[index].wednesday == "SI") {
                req.body.registers[index].wednesday = 1;
            } else {
                req.body.registers[index].wednesday = 0;
            }

            if (req.body.registers[index].thursday == "SI") {
                req.body.registers[index].thursday = 1;
            } else {
                req.body.registers[index].thursday = 0;
            }

            if (req.body.registers[index].friday == "SI") {
                req.body.registers[index].friday = 1;
            } else {
                req.body.registers[index].friday = 0;
            }

            if (req.body.registers[index].saturday == "SI") {
                req.body.registers[index].saturday = 1;
            } else {
                req.body.registers[index].saturday = 0;
            }
            band = false;
            J = 0;

        }
        let incubators = req.body.registers;
        utils.cleanObjects(incubators);
        DBlayer.DBbulkAddIncubator(incubators).then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        }).catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    }).catch(function (err) {
        console.log(err);
        res.status(500).send(err);
    });
};


function addDays(nDate, nDay){
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.calculateIncubator = async function(req, res) {
    // console.log("Aqui: ", req.body);
    const breedingStage = 3;
    try {
        if (req.body.init_date != "") {
   
            let aDate = req.body.init_date.split("-"),
                nDate = new Date(aDate[2], aDate[1]-1, aDate[0]),
                sDate = addDays(nDate, 6),
                end_date = `${sDate.getFullYear()}-${sDate.getMonth()+1}-${sDate.getDate()}`,
                partnership_id = req.body.partnership_id,
                breed_id = req.body.breed_id,
                scenario_id = req.body.scenario_id,
                aProduct = await DBprocess.DBfindProcessByStageAndBreed(breedingStage, breed_id),
                product_id = aProduct[0].product_id;
            incubator_plant_id  = req.body.incubator_plant_id;
  
            let init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
            console.log(partnership_id);
            let anterior = 0;
  
            //Buscar en la curva anual de postura las demandas de huevos
            // console.log(init_date,' * ' ,end_date)
            let eggDemand;
            let eggDemandReal;
            let eggDemandFinal = [];
    
            // let sumAcclimatization = 0;
            // let sumAppropriate = 0;
            // let sumExpired = 0;
            // let acclimatization;
            // let appropriate;
            // let acclimatizedBand;
            // let suitableBand; 
            // let expiredBand 
            try {
                eggDemand = await BDscenarioPostureCurve.DBfindEggByDate(scenario_id, init_date, end_date, breed_id,incubator_plant_id);
                eggDemandReal = await DBeggsMovements.DBfindEggByDate(init_date, end_date);
                //  results = await DBeggsMovements.DBfindInventoryRealByPartnership(partnership_id);
            } catch (error) {
                console.log(error);
            }
            // console.log(eggDemand);
            // console.log(eggDemandReal);
    
            // acclimatization = results[0].min_storage
            // appropriate = results[0].max_storage - results[0].min_storage;
            // expired = results[0].max_storage;

            // acclimatizedBand = results[0].acclimatize;
            // suitableBand = results[0].suitable;
            // expiredBand = results[0].expired;

       
            // console.log("eggDemand: ", eggDemand);
  
            //Buscar la cantidad de gallinas por raza
            /* let quantity_hens = await DBscenarioHen.DBfindHensByScenario(scenario_id, breed_id),
            quantity_hen = quantity_hens.quantity_hen;*/
  
            //Buscar las metas de demanda de huevo de la regresiva dado un rango de Fecha
            let goal;
            try {
                goal  = await DBscenarioParameter.BDgetParameterGoalByDate(req.body.scenario_id, product_id, init_date, end_date);
            } catch (error) {
                console.log(error);
            }
  
            //  console.log("--: ", goal)
            //Buscar todas la disponibilidad de incubadoras
            let aIncubator;
            try {
                aIncubator = await DBlayer.DBfindIncubatorByPartnership(partnership_id,incubator_plant_id);
            } catch (error) {
                console.log(error);
            }
            // console.log("aIncubator: ", aIncubator);
  
            let weekIncubator = [],
                sunday = {
                    capacity: 0,
                    incubator: [],
                    incubator_id: [],
                    list: []
                },
                aSunday = [],
                monday = {
                    capacity: 0,
                    incubator: [],
                    incubator_id: [],
                    list: []
                },
                aMonday = [],
                tuesday = {
                    capacity: 0,
                    incubator: [],
                    incubator_id: [],
                    list: []
                },
                aTuesday = [];
            wednesday = {
                capacity: 0,
                incubator: [],
                incubator_id: [],
                list: []
            },
            aWednesday = [],
            thursday = {
                capacity: 0,
                incubator: [],
                incubator_id: [],
                list: []
            },
            aThursday = [],
            friday = {
                capacity: 0,
                incubator: [],
                incubator_id: [],
                list: []
            },
            aFriday = [],
            saturday = {
                capacity: 0,
                incubator: [],
                incubator_id: [],
                list: []
            },
            aSaturday = [],
            sundayIncubatorId=[],
            mondayIncubatorId=[],
            tuesdayIncubatorId=[],
            wednesdayIncubatorId=[],
            thursdayIncubatorId=[],
            fridayIncubatorId=[],
            saturdayIncubatorId=[],
            sundayL = [],
            mondayL=[],
            tuesdayL=[],
            wednesdayL=[],
            thursdayL=[],
            fridayL=[],
            saturdayL=[];
            
            aIncubator.forEach(item=>{
  
                if(item.sunday === 1){
                    sunday.capacity+=item.capacity;
                    aSunday.push(item.name);
                    sundayIncubatorId.push(item.incubator_id);
                    sundayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
                if(item.monday === 1){
                    monday.capacity+=item.capacity;
                    aMonday.push(item.name);
                    mondayIncubatorId.push(item.incubator_id);
                    mondayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
                if(item.tuesday === 1){
                    tuesday.capacity+=item.capacity;
                    aTuesday.push(item.name);
                    tuesdayIncubatorId.push(item.incubator_id);
                    tuesdayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
                if(item.wednesday === 1){
                    wednesday.capacity+=item.capacity;
                    aWednesday.push(item.name);
                    wednesdayIncubatorId.push(item.incubator_id);
                    wednesdayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
                if(item.thursday === 1){
                    thursday.capacity+=item.capacity;
                    aThursday.push(item.name);
                    thursdayIncubatorId.push(item.incubator_id);
                    thursdayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
                if(item.friday === 1){
                    friday.capacity+=item.capacity;
                    aFriday.push(item.name);
                    fridayIncubatorId.push(item.incubator_id);
                    fridayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
                if(item.saturday === 1){
                    saturday.capacity+=item.capacity;
                    aSaturday.push(item.name);
                    saturdayIncubatorId.push(item.incubator_id);
                    saturdayL.push({
                        name: item.name,
                        incubator_id: item.incubator_id
                    });
                }
  
            });
            sunday.incubator = aSunday;
            sunday.incubator_id = sundayIncubatorId.toString();
            sunday.list = sundayL;
            monday.incubator = aMonday;
            monday.incubator_id = mondayIncubatorId.toString();
            monday.list = mondayL;
            tuesday.incubator = aTuesday;
            tuesday.incubator_id = tuesdayIncubatorId.toString();
            tuesday.list = tuesdayL;
            wednesday.incubator = aWednesday;
            wednesday.incubator_id = wednesdayIncubatorId.toString();
            wednesday.list = wednesdayL;
            thursday.incubator = aThursday;
            thursday.incubator_id = thursdayIncubatorId.toString();
            thursday.list = thursdayL;
            friday.incubator = aFriday;
            friday.incubator_id = fridayIncubatorId.toString();
            friday.list = fridayL;
            saturday.incubator = aSaturday;
            saturday.incubator_id = saturdayIncubatorId.toString();
            saturday.list = saturdayL;
            weekIncubator.push(sunday,monday, tuesday, wednesday, thursday, friday, saturday);
            // console.log("week: ", weekIncubator);
  
            //Procedemos a calcular los almacenamientos
            //Buscar el anio de inicio del escenario
        
            /*let infoScenario = await DBscenario.DBfindIdScenario(req, ''),
            date_start = infoScenario[0].date_start,
            year = date_start.getFullYear();*/
  
            //let records_storage = calculateStorage(scenario_id, year, breed_id);
  
            //Resultado final
            // console.log('VAmossssss');
            // console.log(eggDemand.length)
            if(eggDemand.length>0){
                let finalDate = eggDemand[0].posture_date;
                //console.log('Voy a await');
                // let finalScore = await DBeggsStorage.DBfindEggsByDate(breed_id,scenario_id, finalDate);
                let finalScore = await DBeggsMovements.DBfindEggsStorageByDateVer2(partnership_id,finalDate) ; 
                let aFinal;

                if(finalScore[0].eggs != null)
                {
                    aFinal = parseInt(finalScore[0].eggs);
                }
                else
                    aFinal = 0;


                for(let j = 0; j<eggDemand.length; j++){
                    let flag = false,
                        i = 0;
                  
                    while(!flag && i<goal.length){
                        // console.log('eggDemand[j].posture_date: ', eggDemand[j].posture_date)
                        // console.log(eggDemand[j].posture_date,' ==', goal[i].date);
                        if(eggDemand[j].posture_date.getTime() === goal[i].date.getTime()){
                            // console.log('Iguales')
                            // console.log(eggDemand)
                            // console.log("goal[i].goal: ", goal[i].goal);

                            // console.log('-------------------------------');

                            for (let index = 0; index < eggDemandReal.length; index++) {
                     
                                let date0 = eggDemandReal[index].fecha_movements.getTime();
                                let date1 = eggDemand[j].posture_date.getTime();
                                let date2 = goal[i].date.getTime();

                                // console.log('-');
                                // console.log(eggDemandReal[index].fecha_movements.getTime());
                                // console.log(eggDemand[j].posture_date.getTime());
                                // console.log(goal[i].date.getTime());
                                // console.log('-');

                                if (date0 == date1) {
                                    if (date0 == date2) {
                    
                                        // eggDemand[j].eggs = Math.round(eggDemand[j].eggs*eggDemand[j].execution_quantity);
                                        eggDemand[j].eggs = parseInt(eggDemandReal[index].eggs);
                                        eggDemand[j].goal = Math.round(goal[i].goal);
                                        eggDemand[j].dayWeek = eggDemand[j].posture_date.getUTCDay();
                                        eggDemand[j].incubator = weekIncubator[eggDemand[j].posture_date.getUTCDay()].incubator.toString() == ""? "-": weekIncubator[eggDemand[j].posture_date.getUTCDay()].incubator.toString();
                                        eggDemand[j].incubatorList = weekIncubator[eggDemand[j].posture_date.getUTCDay()].list;
                                        eggDemand[j].incubatorCapacity = weekIncubator[eggDemand[j].posture_date.getUTCDay()].capacity;
                                        eggDemand[j].incubatorId = weekIncubator[eggDemand[j].posture_date.getUTCDay()].incubator_id;
                                        eggDemand[j].pdate = `${eggDemand[j].posture_date.getDate()}-${eggDemand[j].posture_date.getMonth()+1}-${eggDemand[j].posture_date.getFullYear()}`;
                                        let eggDemandDate = `${eggDemand[j].posture_date.getFullYear()}-${eggDemand[j].posture_date.getMonth()+1}-${eggDemand[j].posture_date.getDate()}`,
                          
                                            // aAvailable = await DBeggsStorage.DBfindEggsStorageByDate(scenario_id, breed_id, eggDemand[j].incubator_plant_id, eggDemandDate);
                                            aAvailable = await DBeggsMovements.DBfindEggsStorageByDateVer2(partnership_id,eggDemandDate);
                   
                                        // if (aAvailable[0].eggs == null) {
                                        //   aAvailable[0].eggs = 0;
                                        // }
                                        // console.log("aAvailable: ", aAvailable);
                                        eggDemand[j].available = parseInt(aAvailable[0].eggs);
                        
                                        // if (!acclimatizedBand) {
                                        //   aAvailable[0].eggs = aAvailable[0].eggs -  sumAcclimatization;
                                        // }

                                        // if (!suitableBand) {
                                        //   aAvailable[0].eggs = aAvailable[0].eggs -  sumAppropriate;
                                        // }

                                        // if (!expiredBand) {
                                        //   aAvailable[0].eggs = aAvailable[0].eggs -  sumExpired;
                                        // }

                                        // results.forEach(element => {
                                        //   if (date0 == element.end_date.getTime()) {
                                        //     if (element._day <= acclimatization) {
                                        //       if (acclimatizedBand) {
                                        //         eggDemand[j].available = parseInt(aAvailable[0].eggs);
                                        //       }else{
                                        //         eggDemand[j].available = anterior;
                                        //       }
                                        //       sumAcclimatization += parseInt(element.eggss);
                                        //     } else if (appropriate <= element._day && expired >= element._day) {
                                        //         if (suitableBand) {
                                        //           eggDemand[j].available = parseInt(aAvailable[0].eggs);
                                        //         }else{
                                        //           eggDemand[j].available = anterior;
                                        //         }
                                        //     } else {
                                        //       //Huevos vencidos
                                        //       if (expiredBand) {
                                        //         eggDemand[j].available = parseInt(aAvailable[0].eggs);
                                        //       }else{
                                        //         eggDemand[j].available = anterior;
                                        //       }
                                        //     }
                                        //   }
                                        // });
                                        // anterior = eggDemand[j].available;
                                        // eggDemand[j].available = parseInt(aAvailable[0].eggs);
                          
                                        eggDemand[j].proyected = Math.min(eggDemand[j].incubatorCapacity, eggDemand[j].available, eggDemand[j].goal);
                                        // console.log(eggDemand[j].eggs, ' - ' , eggDemand[j].available)
                                        // eggDemand[j].storage_quantity = eggDemand[j].eggs + eggDemand[j].available;
                                        if (j != 0)  {
                                            aFinal += eggDemand[j].eggs;
                                        }
                        
                                        eggDemand[j].storage_quantity = aFinal;
                                        flag = true;
                          
                                        eggDemandFinal.push(eggDemand[j]);
                                    }
                                }
                      
                            }
                            // console.log('---------------+----------------');
                        }
                        i++;
                    }
      
                }
            }
            // console.log("goal: ", eggDemandFinal)
            res.status(200).json({
                statusCode: 200,
                data: eggDemandFinal
            });
        }else{
            res.status(200).json({
                statusCode: 200,
            });
        }
    
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

async function calculateStorage(scenario_id, year, breed_id){
    //Buscar lo planificado
    let eggs_planning = await DBeggsPlanning.DBfindEggsPlanningByScenarioAndYear(scenario_id, year, breed_id);
    //console.log("eggs_planning: ", eggs_planning);

    //Buscar requerido
    let eggs_required = await DBeggsRequired.DBfindEggsRequiredByScenarioAndYear(scenario_id, year, breed_id);
    //console.log("eggs_required: ", eggs_required);

    let diff = [];
    if(eggs_planning.length === eggs_required.length){
        eggs_planning.forEach((item, i)=>{
            let obj = {};
            obj.planning = item.planned;
            obj.required = eggs_required[i].required;
            obj.diff = item.planned - eggs_required[i].required;
            diff.push(obj);
        });
    }
    // console.log("diff: ", diff);

}
