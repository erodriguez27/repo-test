const DBlayer = require("../models/Scenario");
// Modelos intermedios:
const capaDBEsceProcess = require("../models/scenarioProcesses");
const DBsceParameter = require("../models/scenarioParameter");
const DBsceParameterDay = require("../models/scenarioParameterDay");
const capaDBProcess = require("../models/process");
const DBparameter = require("../models/Parameter");
const DBsceFormula = require("../models/scenarioFormula");
const DBscePCurve = require("../models/scenarioPostureCurve");
const DBsceRequired = require("../models/eggsRequired");
const DBscePlanning = require("../models/eggsPlanning");
const DBeggsStorage = require("../models/eggsStorage");


// Funciones privadas:
async function runGenerate( escenario, procesos ) {
    let records = procesos.map( elem => {
        let record = {
            process_id: elem.process_id,
            decrease_goal: elem.historical_decrease,
            weight_goal: elem.historical_weight,
            duration_goal: elem.historical_duration,
            scenario_id: escenario.scenario_id,
        };
        return record;
    });

    try {
        let result = await capaDBEsceProcess.insertRecords( records );
        return true;

    } catch(err) {
    // console.log('error runGenerate', err);
        return false;

    }
}

/*
  Funcion POST : Se encarga de insertar un escenario a la DB
  A este servicio se le debe mandar por body la siguiente información:
  {
  	"description": "escenario equis",
  	"date_start": "2017/10/10",
  	"date_end": "2017/10/20",
  	"name": "Hola diablo"
  }
*/

exports.getScenarioName= async(req, res) =>{
    let name = req.body.name;
    let excep = req.body.diff;
    try{
        let data = await DBlayer.DBgetScenarioName(name, excep);
        
        res.status(200).send({
            statusCode: 200, data: data
        });
        
        
    }
    catch(err){
        console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }
};

exports.addScenario = async(req, res) => {
    try{
        let objScenario = await DBlayer.DBaddScenario(req, res);
        req.body.scenario_id = objScenario.scenario_id;

        let scenarioPro = await exports.generateEscenarioProcesses(req,res);
        let scenarioPara = await exports.generatedEcParameter(req,res);
        //let scenarioFormulaI = await exports.generateScenarioFormulaI(req,res);
        let scenarioFormulaO = await exports.generateScenarioFormulaO(req,res);
        res.status(200).json({statusCode:200,status: "sucess"});
    }
    catch(err){
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
};

exports.findAllScenario = function(req, res, next) {

    DBlayer.DBfindAllScenario()
        .then(function(data) {

            res.status(200)
                .json({
                    statusCode:200,
                    status: "success",
                    data: data,
                });

        })
        .catch(function(err) {

            res.status(500).send(err);

        });

};

exports.findIdScenario = function(req, res) {

    DBlayer.DBfindIdScenario(req, res)
        .then(function(data) {

            res.status(200)
                .json({
                    status: "success",
                    data: data,
                });

        })
        .catch(function(err) {

            res.status(500).send(err);

        });

};

/*
  Este método se encarga de generar los registros de la taba public.txscenarioprocess.

  Se le debe mandar por body la siguiente información:
  {
    "escenarioId": XX(integer)
  }
*/
exports.generateEscenarioProcesses = async function(req, res) {

    let escenarioId = req.body.scenario_id;
    try {
        let escenario = await DBlayer.getEscenario( escenarioId );

        // Consultar todos los procesos:
        req.body.date_start = escenario.date_start;
        req.body.date_end = escenario.date_end;
        let procesos = await capaDBProcess.DBgetAllProcess();

        if ( escenario.length === 0 || procesos.length === 0 ) {
            // No podemos procesar sin escenario o sin procesos...
            res.status(500).send({ msg: "Faltan datos para escenario o procesos", statusCode: 500 });
        } else {
            // Generamos los registros para la tabla scenarioprocess:
            let status = await runGenerate(escenario[0], procesos);

            if ( status ) {
                return status;
            } else {
                res.status(500).send( { statusCode: 500, msg: "Error en servicio" } );
            }
        }
    } catch(err) {
        console.log("Error: ha ocurrido un problema al insertar escenario-procesos: ", err);
        let errObj = {
            pgErrorCode: err.code,
            statusCode: 500
        };
        res.status(500).send(errObj);
    }
};

/*
  Funcion POST : Se encarga de generar los parametros para un escenario dado una fecha inicio y fin
*/
exports.generatedEcParameter = function(req, res) {

    DBlayer.DBfindIdScenario(req, res)
        .then(function(data) {
            req.body.date_start_m = data[0].date_start.getMonth() + 1;
            req.body.date_start_y = data[0].date_start.getFullYear();
            req.body.date_end_m = data[0].date_end.getMonth() + 1;
            req.body.date_end_y = data[0].date_end.getFullYear();

            //return parameter.DBfindParameterByType('Entrada');
            return DBparameter.DBfindAllParameter();
        })
        .then(function(data) {

            var results = [];
            let initmonth = req.body.date_start_m;
            let endmonth = req.body.date_end_m;
            let unanio = false;
            for (let i = req.body.date_start_y; i <= req.body.date_end_y; i++) {

                if(i !== req.body.date_end_y && !unanio){
                    unanio = true;
                    initmonth = req.body.date_start_m;
                    endmonth  = 12;
                }else if(i !== req.body.date_end_y && unanio){
                    initmonth = 1;
                    endmonth = 12;
                }else if(i === req.body.date_end_y && unanio){
                    initmonth = 1;
                    endmonth = req.body.date_end_m;
                }

                for (let j = initmonth; j <= endmonth; j++) {
                    for (let k = 0; k < data.length; k++) {
                        let obj = {};
                        obj.scenario_id = req.body.scenario_id;
                        obj.process_id = data[k].process_id;
                        obj.parameter_id = data[k].parameter_id;
                        obj.year = i;
                        obj.month = j;
                        obj.value = 0;
                        results.push(obj);
                    }
                }
            }
            req.body.results = results;
            return DBsceParameter.DBgeneratedEcParameter(req.body.results);
        })
        .then(function() {
            //return true;
            /*
            res.status(200).json({
                status: "sucess"
            });*/

        })
        .catch(function(err) {
            console.log("Error: ha ocurrido un problema al insertar escenario-parameter: ", err);
            res.status(500).send(err);
        });
};


exports.generatedRangeEcParameter = function(escenario, mesInicio, yearInicio, mesFin, yearFin) {

    // DBlayer.DBfindIdScenario(req, res)
    //     .then(function(data) {
    //         req.body.date_start_m = data[0].date_start.getMonth() + 1;
    //         req.body.date_start_y = data[0].date_start.getFullYear();
    //         req.body.date_end_m = data[0].date_end.getMonth() + 1;
    //         req.body.date_end_y = data[0].date_end.getFullYear();

    //         //return parameter.DBfindParameterByType('Entrada');
    //         return DBparameter.DBfindAllParameter();
    //     })
    DBparameter.DBfindAllParameter().then(function(data) {

        var results = [];
        let initmonth = mesInicio;
        let endmonth = mesFin;
        let unanio = false;
        for (let i = yearInicio; i <= yearFin; i++) {

            if(i !== yearFin && !unanio){
                unanio = true;
                initmonth = mesInicio;
                endmonth  = 12;
            }else if(i !== yearFin && unanio){
                initmonth = 1;
                endmonth = 12;
            }else if(i === yearFin && unanio){
                initmonth = 1;
                endmonth = mesFin;
            }

            for (let j = initmonth; j <= endmonth; j++) {
                for (let k = 0; k < data.length; k++) {
                    let obj = {};
                    obj.scenario_id = escenario.scenario_id;
                    obj.process_id = data[k].process_id;
                    obj.parameter_id = data[k].parameter_id;
                    obj.year = i;
                    obj.month = j;
                    obj.value = 0;
                    results.push(obj);
                }
            }
        }
        return DBsceParameter.DBgeneratedEcParameter(results);
    })
        .catch(function(err) {
            console.log("Error: ha ocurrido un problema al insertar escenario-parameter: ", err);
            //res.status(500).send(err);
        });
};






/*
  A este servicio se le debe mandar por bodyla siguiente información:
  {
  "description": "escenario equis",
  "date_start": "2017/10/10",
  "date_end": "2017/10/20",
  "name": "Probando actualizar",
  "scenarioId": 4                  // Este parámetro es importante, porque sino no sabremos qué calendario es el que vamos a actualizar.
  }
*/

/*
Funcion que se encarga de generar escenario formula dado un scenarioID
*/

exports.generateScenarioFormulaI = async(req, res) =>{
    try{

        let scenarioId = req.body.scenario_id;
        let id = await DBlayer.findById(scenarioId);

        // Si retorna null, no podemos actualizar:
        if(!id) return res.status(200).send( { statuscode: 500, msg: "No existe el registro." } );

        let arrParameter = await DBparameter.DBfindParameterByType("Entrada");
        //console.log(arrParameter);
        let results = [];
        if(arrParameter.length>0){
            for (let parameter of arrParameter){
                let process_id = parameter.process_id;
                let duration = 0 ;
                let divider = 1;

                let insert = {};
                let processObj = await capaDBProcess.DBgetProcessById(parameter.process_id);
                console.log("APIS", processObj);
                insert.process_id = processObj[0].process_id;
                insert.measure_id = parameter.measure_id;
                insert.sign = -1;
                insert.divider = divider;
                insert.duration =  duration;
                // insert.level = 0;
                insert.scenario_id = scenarioId;
                insert.predecessor_id = processObj[0].predecessor_id;
                insert.parameter_id = parameter.parameter_id;

                results.push(insert);

                //duration = 0;
                //divider = 1 - (processObj[0].historical_decrease/100);


                while(processObj[0].predecessor_id>=0){
                    insert = {};

                    duration +=  processObj[0].historical_duration;
                    divider = divider * (1 - (processObj[0].historical_decrease/100));

                    insert.process_id = processObj[0].process_id;
                    insert.measure_id = parameter.measure_id;
                    insert.sign = -1;
                    insert.divider = divider;
                    insert.duration =  duration;
                    // insert.level = 0;
                    insert.scenario_id = scenarioId;
                    insert.predecessor_id = processObj[0].predecessor_id;
                    insert.parameter_id = parameter.parameter_id;


                    insert.signal = -1;
                    results.push(insert);

                    //console.log('P: '+processObj[0].predecessor_id+' '+processObj[0].name+' D: '+duration+' Divi: '+divider);
                    if(processObj[0].predecessor_id !== 0) {
                        processObj = await capaDBProcess.DBgetProcessById(processObj[0].predecessor_id);
                    }
                    else {
                        break;
                    }
                }
            }
            //Insertar las formulas para los parametros de entrada
            let status = await DBsceFormula.addScenarioFormula(results);
        }
        //res.status(200).send( { statusCode: 200, msg: 'Escenario Formula ejecutado correctamente'} );


    }catch(err){
        console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};


/*
Funcion que se encarga de generar escenario formula de salida dado un scenarioID
*/

exports.generateScenarioFormulaO = async(req, res) =>{  // Se ejecuta cuando addScenario, se crea nuevo scenario se toma en cuenta por defectos los datos del proceso cargados en Configuracion Tecnica
    try{
        let scenarioId = req.body.scenario_id;
        let id = await DBlayer.findById(scenarioId);

        // Si retorna null, no podemos actualizar:
        if(!id) return res.status(200).send( { statuscode: 500, msg: "No existe el registro." } );

        let arrParameter = await DBparameter.DBfindParameterByType("Salida");
        let results = [];
        // console.log("parametros de salida: ", arrParameter);
        if(arrParameter.length>0){
            // se va a calcular la formula de salida
            for (let parameter of arrParameter){//se recorre cada parametro
                // console.log('parametro: ', parameter);

                let process_id = parameter.process_id;//toma el id del proceso asociado
                let duration = 0 ;//?
                let divider = 1;//?

                let insert = {};
                let processObj = await capaDBProcess.DBgetProcessById(parameter.process_id);

                insert.process_id = processObj[0].process_id;
                insert.measure_id = parameter.measure_id;//unidad de medida
                insert.sign = 1;//?
                insert.divider = divider;
                insert.duration =  duration;
                // insert.level = 0;//?
                insert.scenario_id = scenarioId;
                insert.predecessor_id = processObj[0].predecessor_id;
                insert.parameter_id = parameter.parameter_id;

                results.push(insert);

                duration = processObj[0].historical_duration;
                divider = 1 - (processObj[0].historical_decrease/100);

                // console.log('recorridos de predecesores: '+ processObj[0].predecessor_id);
                // console.log('proceso inicial: ', processObj);

                while(processObj[0].predecessor_id>0){
                    // console.log('predecesor: '+ processObj[0].predecessor_id);
                    insert = {};
                    processObj = await capaDBProcess.DBgetProcessById(processObj[0].predecessor_id);
                    insert.process_id = processObj[0].process_id;
                    insert.measure_id = parameter.measure_id;
                    insert.sign = 1;
                    insert.divider = divider;
                    insert.duration =  duration;
                    // insert.level = 0;
                    insert.scenario_id = scenarioId;
                    insert.predecessor_id = processObj[0].predecessor_id;
                    insert.parameter_id = parameter.parameter_id;
                    results.push(insert);

                    duration +=  processObj[0].historical_duration;
                    divider = divider * (1 - (processObj[0].historical_decrease/100));
                }
            }
            let status = await DBsceFormula.addScenarioFormula(results);
        }
    }catch(err){
        console.log("Error: ha ocurrido un problema al insertar escenario-Formula: ", err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};

exports.generateScenarioProcessFormulaO = async(req, res) =>{ // Se ejecuta cuando edito datos en tab Proceso de MANTENIMIENTO DE ESCENARIO
    try{
        let scenarioId = req.body.scenario_id;
        let id = await DBlayer.findById(scenarioId);
        // Si retorna null, no podemos actualizar:
        if(!id) return res.status(200).send( { statuscode: 500, msg: "No existe el registro." } );

        let arrParameter = await DBparameter.DBfindParameterByType("Salida");
        let results = [];
        if(arrParameter.length>0){
            for (let parameter of arrParameter){
                let process_id = parameter.process_id;
                let duration = 0 ;
                let divider = 1;

                let insert = {};
                let processObj = await capaDBProcess.DBgetProcessById(parameter.process_id);
                let scenProcObj = await capaDBEsceProcess.getScenarioProcById(parameter.process_id, scenarioId);

                //console.log('P: '+processObj[0].predecessor_id+' '+processObj[0].name+' D: '+duration);

                insert.process_id = processObj[0].process_id;
                insert.measure_id = parameter.measure_id;
                insert.sign = 1;
                insert.divider = divider;
                insert.duration =  duration;
                // insert.level = 0;
                insert.scenario_id = scenarioId;
                insert.predecessor_id = processObj[0].predecessor_id;
                insert.parameter_id = parameter.parameter_id;

                results.push(insert);

                duration = scenProcObj[0].duration_goal;
                divider = 1 - (scenProcObj[0].decrease_goal/100);


                while(processObj[0].predecessor_id>0){
                    insert = {};
                    scenProcObj = await capaDBEsceProcess.getScenarioProcById(processObj[0].predecessor_id, scenarioId);
                    processObj = await capaDBProcess.DBgetProcessById(processObj[0].predecessor_id);

                    insert.process_id = processObj[0].process_id;
                    insert.measure_id = parameter.measure_id;
                    insert.sign = 1;
                    insert.divider = divider;
                    insert.duration =  duration;
                    // insert.level = 0;
                    insert.scenario_id = scenarioId;
                    insert.predecessor_id = processObj[0].predecessor_id;
                    insert.parameter_id = parameter.parameter_id;
                    //console.log(insert);
                    results.push(insert);
                    //console.log("Insertar");
                    //if(parameter.parameter_id===14) console.log(insert);

                    //console.log('P: '+processObj[0].predecessor_id+' '+processObj[0].name+' D: '+duration+' Divider: '+divider);
                    //console.log(divider+'*'+' (1 -'+ processObj[0].historical_decrease+');');
                    duration +=  scenProcObj[0].duration_goal;
                    divider = divider * (1 - (scenProcObj[0].decrease_goal/100));

                    //console.log(processObj[0].predecessor_id);

                }


            }
            let status = await DBsceFormula.addScenarioFormula(results);
        }
    }catch(err){
        console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};


exports.updateScenario = async (req, res) => {
    console.log("////////////////////////////////// updtae");
    let date_startNew, date_endNew, date_startOld, date_endOld;
    try {
        let id = await DBlayer.findById(req.body.scenario_id);
        // Si retorna null, no podemos actualizar:
        if(!id) return res.status(500).send( { statuscode: 500, msg: "No existe el registro." } );
        else{

            let result = await DBlayer.updateScenario(req.body);
            // let result = false;

            date_startOld= new Date(id.date_start);
            date_endOld= new Date(id.date_end);
            date_startNew= new Date(req.body.date_start);
            date_endNew= new Date(req.body.date_end);

            console.log(date_startOld," | ", date_endOld);
            console.log(date_startNew," | ", date_endNew);

            if (date_startOld.getTime() !=date_startNew.getTime() ||
                date_endOld.getTime()!=date_endNew.getTime()) {
                
                DBsceParameterDay.BDdeleteDays4ScenarioId(id.scenario_id);//borra los calculos hechos debido a la modificacion de fechas
                
                /**
                 * [caso 1]
                 * (*): se evalua el extremo izquierdo
                */
                if(date_startNew.getTime()> date_startOld.getTime()){
                    /**
                     * [caso 1A]
                     * (*): si el nuevo inicio es despues del antiguo, se deben eliminar fechas en el extremo izquierdo)
                    */
                    console.log("eliminar en el extremo izquierdo: ", id.scenario_id, date_startNew.getMonth()+1, date_startNew.getFullYear());
                    let salida= DBsceParameter.deleteExtLeft(id.scenario_id, date_startNew.getMonth()+1, date_startNew.getFullYear());
                    console.log(salida);
                }
                else if(date_startNew.getTime()< date_startOld.getTime()){
                    /**
                     * [caso 1B]
                     * (*): si el nuevo inicio es antes del antiguo, se deben crear fechas en el extremo izquierdo)
                    */
                    console.log("agregar en el extremo izquierdo");
                    let d= date_startOld;
                    d.setMonth(d.getMonth()-1);
                    //DBsceParameter.addExtLeft(date_startOld,getMonth()+1, date_startOld.getFullYear(), date_startNew,getMonth()+1, date_startNew.getFullYear());
                    this.generatedRangeEcParameter(id, date_startNew.getMonth()+1, date_startNew.getFullYear(),
                        d.getMonth()+1, d.getFullYear());
                }


                /**
                 * [caso 2]
                 * (*): se evalua el extremo derecho
                */
                if(date_endNew.getTime()< date_endOld.getTime()){
                    /**
                     * [caso 2A]
                     * (*): si el nuevo final es despues del antiguo, se deben crear fechas en el extremo derecho)
                    */
                    console.log("eliminar en el extremo derecho: ", id.scenario_id, date_startNew.getMonth()+1, date_startNew.getFullYear());
                    let salida= DBsceParameter.deleteExtRigth(id.scenario_id, date_endNew.getMonth()+1, date_endNew.getFullYear());
                    console.log(salida);
                }
                else if(date_endNew.getTime()> date_endOld.getTime()){
                    /**
                     * [caso 2B]
                     * (*): si el nuevo final es antes del antiguo, se deben eliminar fechas en el extremo derecho)
                    */
                    console.log("agregar en el extremo derecho");
                    let d= date_endOld;
                    d.setMonth(d.getMonth()+1);
                    this.generatedRangeEcParameter(id, d.getMonth()+1, d.getFullYear(),
                        date_endNew.getMonth()+1, date_endNew.getFullYear());
                }
            }
            

            if(!result){
                res.status(200).send({
                    statusCode: 200,
                    msg: "Registro actualizado con exito",
                });
            }
            else{
                res.status(500).send({
                    statusCode: 500,
                    msg: "Ha ocurrido un error al actualizar el registro",
                });
            }
        }

       

    } catch (err) {
        console.log("error en el bck: ", err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }
};

exports.updateStatus = async (req, res) => {
    try {

        let scenario_id = req.body.scenario_id;
        let status = req.body.status;
        let preScenario = await DBlayer.findByStatus(1);

        if(preScenario){
            let preresult = await DBlayer.updateStatus(preScenario.scenario_id,0);
        }
        if (status==1){
            let result = await DBlayer.updateStatus(scenario_id,1);
        }

        return res.status(200).send( { statusCode: 200, mgs: "Registro Actualizado" } );

    } catch (err) {
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }

};

/*
  A este servicio se le debe mandar en el body la siguiente información:
  {
    "scenarioId": 5
  }
*/
exports.deleteScenario = async (req, res) => {
    console.log("////eliminar: ", req.body.scenario_id);
    try {
        let det = await DBlayer.DBcheckDeletable(req.body.scenario_id);
        if(det.deletable === true){
            console.log("Estoy eliminando")
            let nScenarioFormula= await DBsceFormula.DBdeleteAllFormula(req.body.scenario_id);
            console.log("nScenarioFormula: ", nScenarioFormula);
    
            let nScenarioParameter= await DBsceParameter.DBdeleteScenarioParameterByScenario(req.body.scenario_id);
            console.log("nScenarioParameter: ", nScenarioParameter);
    
            let nScenarioParameterDay= await DBsceParameterDay.DBdeleteScenarioParameterDayByScenario(req.body.scenario_id);
            console.log("nScenarioParameterDay: ", nScenarioParameterDay);
    
            let nScenarioProcess= await capaDBEsceProcess.DBdeleteScenarioProcessByScenario(req.body.scenario_id);
            console.log("nScenarioProcess: ", nScenarioProcess);
    
            let nScenarioEggRequired= await DBsceRequired.DBdeleteEggsRequiredByScenario(req.body.scenario_id);
            console.log("nScenarioEggRequired: ", nScenarioEggRequired);
            
            let nScenarioEggPlanning= await DBscePlanning.DBdeleteEggsPlanningByScenarioOnly(req.body.scenario_id);
            console.log("nScenarioEggPlanning: ", nScenarioEggPlanning);
    
            let nScenarioEggStorage= await DBeggsStorage.DBdeleteEggsStorageByScenario(req.body.scenario_id);
            console.log("nScenarioEggStorage: ", nScenarioEggStorage);
            
            let result = await DBlayer.deleteScenario(req.body.scenario_id);
            console.log("result: ", result);
            return res.status(200).send( { statusCode: 200, mgs: "Registro borrado" } );
        }else{
            res.status(409).json({
                statusCode: 409,
                msj: "No se puede eliminar porque existen proyecciones/programaciones sobre el escenario seleccionado"
            });
        }

    } catch (err) {
        console.log("Error: ha ocurrido un problema en la eliminación del escenario: ", err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
};

/*
  A este servicio se le debe mandar por body:
  {
  	"initYear": 2000,
  	"endYear": 2003
  }
*/
exports.validateScenario = async (req, res) => {
    if (!req.body.initYear || !req.body.endYear) return res.status(200).send({statusCode: 500, error: "Parámetros faltantes"});

    try {
        let largerInitYear = await DBlayer.findLargerYear();
        let smallerEndYear = await DBlayer.findSmallerYear();
        let initYear = req.body.initYear;
        let endYear = req.body.endYear;

        // Validación primaria:
        if(initYear > endYear) return res.status(200).send({statusCode: 500, msg: "No válido"});

        if ( initYear >= largerInitYear.max && endYear <= smallerEndYear.min ) {
            res.status(200).send({statusCode: 200, msg: "Válido"});
        } else {
            res.status(200).send({statusCode: 500, msg: "No válido"});
        }

    } catch (err) {
        console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }
};

exports.activeScenario = async (req, res) => {

    try {
        const scenarioInfo = await DBlayer.DBactiveScenario();
        console.log(scenarioInfo);
        res.status(200).send({statusCode: 200, scenario_id: scenarioInfo.scenario_id, description: scenarioInfo.scenario_id, date_start: scenarioInfo.date_start, date_end: scenarioInfo.date_end, name: scenarioInfo.name });
    }catch (err) {
        console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};
