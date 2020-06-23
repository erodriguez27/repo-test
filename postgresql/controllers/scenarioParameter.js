const DBlayer = require("../models/scenarioParameter");
const scenario = require("../models/Scenario");
const parameter = require("../models/Parameter");
const holiday = require("../models/Holiday");
const sceParamDay = require("../models/scenarioParameterDay");
const calendarDay = require("../models/calendarDay");
const eggsPlanning = require("../models/eggsPlanning");
const lotEggs = require("../models/lot_eggs");
const DBbrooder = require("../models/brooderReport");
const DBfarm = require("../models/farm");
const DBshed = require("../models/shed");
const DBprocess = require("../models/process");
const DBeggsRequired = require("../models/eggsRequired");
const DBslinc = require("../models/sltxIncubator"); 
const breedingStage = 3;
const codeColumns= "___staticColum";

var staticColumns= [ {columnid: "N°",halign: "Left"},
    {columnid: "Semana",halign: "Left"},
];


exports.thereGoals= async(req, res)=>{
    let id = req.body.id;
    try {
        let data= await DBlayer.DBgetEstimatedGoalsById(id);
        res.status(200).send({
            statusCode: 200,
            data: data
        });
    } catch(err) {
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }
};


exports.getStages = async(req, res) => {
    try {
        let data = await DBlayer.DBgetStages();
        res.status(200).send({
            statusCode: 200, data: data
        });

    } catch (err) {
        console.log(err);
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }
};

exports.getBreeds = async(req, res) => {
    try {
        let data = await DBlayer.DBgetBreeds();

        res.status(200).send({
            statusCode: 200, data: data
        });

    } catch (err) {
        console.log(err);
        res.status(200).send( { statusCode: 200, error: err.message, errorCode: err.code } );
    }
};

exports.getScenariosParameters = async(req, res) => {
    
    try {
        let scenario_id = req.body.scenario_id;
        let type = req.body.type;
        let objScenario = await scenario.DBfindIdScenario(req);
        if (objScenario.length === 0) return res.status(500).send({
            statuscode: 500,
            msg: "No existe el escenario."
        });

        let objParametro = await parameter.DBfindParameterByType(type);
        console.log("parametros");
        console.log(objParametro);
        let results = [];
        let arrParameter = [];
        let arrData = [];
        let arrEnviar = [];

        if (objParametro.length > 0) {
            //recorre todos los años de ese escenario
            for (let year = objScenario[0].date_start.getFullYear(); year <= objScenario[0].date_end.getFullYear(); year++) {
                console.log("año: ", year);
                arrParameter = await DBlayer.DBgetAllParameters(scenario_id, year, type);
                console.log("parametros de salida: ", arrParameter);
                arrData = [];
                arrEnviar = [];
      		    // console.log(arrParameter);

                let anterior = arrParameter[0].parameter_id;//guarda el parametro inicial (?)
                // console.log("parametro anterior: ",anterior);
                //recorre cada parametro (el año no se que coño influye en la seleccion del parametro)
                for (let j = 0; j < arrParameter.length; j++) {
                    // console.log("parametros anterior: ", anterior);
                    // console.log("parametros pivot: ", arrParameter[j].parameter_id);
                    if (arrParameter[j].parameter_id !== anterior) {//si es el actual parametro
                        /**
                         * cual es el proposito de esto (?)
                         * alguna vez entra aqui?
                         * tiene sentido?
                         * afectará en algo?
                         * ganará la 4ta champions seguida el madrid?
                         * ficharemos a un 9 goleador?
                         * ganaremos algo?
                         * tu eres mk?
                         */
                        arrEnviar.push(arrData);
                        arrData = [];
                        arrData.push(arrParameter[j]);
                        if(j === arrParameter.length - 1)
          				    arrEnviar.push(arrData);
                    } else if (j === arrParameter.length - 1) {//si es el ultimo parametro
                        arrData.push(arrParameter[j]);
                        arrEnviar.push(arrData);
                        arrData = [];
                    } else{//parametro intermedio
                        arrData.push(arrParameter[j]);
                    }

                    anterior = arrParameter[j].parameter_id;//actualiza el parametro 'anterior'
                }

                results.push({
                    "year": year,
                    "data": arrEnviar
                });
            }
        }
        console.log("resultados:");
        console.log(results);
        //let results = await DBlayer.DBgetAllParameters(scenario_id, year);

        res.status(200).send({
            statusCode: 200,
            numberOfParameters: objParametro.length,
            initMDate: objScenario[0].date_start.getMonth() + 1,
            initYDate: objScenario[0].date_start.getFullYear(),
            endMDate: objScenario[0].date_end.getMonth() + 1,
            endYDate: objScenario[0].date_end.getFullYear(),
            results: results
        });

    } catch (err) {
        //Verificar
        if (err.received == 0) res.status(200).send({
            statusCode: 200,
            results: []
        });
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.message
        });
    }
};

exports.updateScenariosParameters = async(req, res) => {
// console.log('///////////////////////////////////////////////////////////////////////////////////');
    try {
        let records = req.body.changes;
        // let MRecords_day = [];
    
        for (let i = 0; i < records.length; i++) {
            let scenario_parameter_id = records[i].scenario_parameter_id;

            let parameter = await DBlayer.DBfindparameterbyId(scenario_parameter_id);
        //     let calendar_id = parameter[0].calendar_id;
        //     // let value = parameter[0].value;
        //     let value =0;
        //     //Conversion a unidades
        //     // console.log('parameter: ', parameter.length);

            let value_units = 0;
            if(parameter[0].is_unit) {
                value_units = (records[i].value * parameter[0].valuekg) / parameter[0].originvalue;
                // console.log(records[i].value,' * ', parameter[0].valuekg,' /', parameter[0].originvalue)
            }
            else {
                value_units = (((records[i].value * parameter[0].valuekg) / parameter[0].originvalue) / parameter[0].weight_goal);
                // console.log("Otra Medida: ((", records[i].value, '*', parameter[0].valuekg, ')/',parameter[0].originvalue, ')/',parameter[0].weight_goal);
            }
        //     // console.log(value_units);
      
            records[i].value_units = value_units;
        //     // records[i].value= parseInt(records[i].value);
            records[i].use_value= parseInt(records[i].value);
        //     value = value_units;

        //     if (value > 0) {
        //         // obtiene la suma total de todos los dias laborables de ese mes

        //         /**
        //          * [obtiene el total de dias del mes del año]
        //          * (*)me ahorro la consulta inicial a la bd y oprimizo el proceso
        //          * @type {int}
        //          */
        //         // let days = await holiday.DBsumHolidaybyMonth(calendar_id, parameter[0].month, parameter[0].year);
                
        //         let days= new Date(parameter[0].year, parameter[0].month, 0).getDate();
        //         let days_sequence = await holiday.DBfindHolidaybyMonth(calendar_id, parameter[0].month, parameter[0].year);
        //         //realizo la division de los dias del calendario con lo estipulado
        //         let units_by_day = value / days;
        //         let records_day = [];

        //         for (var j = 0; j < days; j++) {
        //             let dayObj = {};
        //             // console.log('days_sequence[j].day:: ', days_sequence[j].day);
        //             dayObj.day = days_sequence[j].day;
        //             dayObj.parameter_id = parameter[0].parameter_id;
        //             dayObj.units_day = units_by_day;
        //             dayObj.scenario_id = parameter[0].scenario_id;
        //             dayObj.sequence = days_sequence[j].sequence;
        //             dayObj.month = days_sequence[j].month;
        //             dayObj.year = days_sequence[j].year;
        //             dayObj.week_day = days_sequence[j].week_day;
        //             dayObj.week = days_sequence[j].week;
        //             records_day.push(dayObj);
        //         }
        //         // console.log('records_day')
        //         // console.log(records_day)
        //         MRecords_day.push(records_day);
        //         let deleteCalendarDay = await sceParamDay.DBdeleteScenarioParameterDay(parameter[0].parameter_id, parameter[0].scenario_id, records_day[0].month, records_day[0].year);
        //     } else {
        //         let deleteCalendarDay = await sceParamDay.DBdeleteAllScenariosByMYS(parameter[0].scenario_id, parameter[0].month, parameter[0].year);
        //     }
        // }
        // for(let i = 0; i != MRecords_day.length; i++) {
    	// 	let records_day = MRecords_day[i];
    	// 	let insertCalendarDay = await sceParamDay.DBaddScenarioParameterDay(records_day);
    	}

        let results = await DBlayer.BDupdateScenariosParameters(records);
        console.log("salgo:: ", results);
        res.status(200).send({
            statusCode: 200,
            msg: "success"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err.message,
            errorCode: err.code
        });
    }
};
function getweek(demandDiary,mes,anio,residuo,capacity,raza, product_id, biological_active, duracion) {
    var fechai = new Date(anio,mes,1);
    fechai.setDate(fechai.getDate() -1);
    var meses = fechai.getMonth();
    var res=0;
    var count = residuo;
    var semanasValue = []
    for (k = demandDiary.length -1 ; k >-1 ; k--)
    {
        count += demandDiary[k];
        if(fechai.getDay()==1)
        {
            semanasValue.unshift({"mes":getMonthName(fechai.getMonth() + 1),"fecha":fechai.getDate()+"/" + (fechai.getMonth() + 1 )+ "/" + fechai.getFullYear(),"breed_id":raza,"value":count,"residue":capacity - count,"capacity":capacity,"product_id":product_id, "biological_active": biological_active,"duracion":duracion,"halign": "Right","textalign": "End"});
            count = 0; 
        }else{
            if(i==0){
                res = count
            }
        }
        fechai.setDate(fechai.getDate() - 1);
    }
    var data_to_erp = semanasValue
    var months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    semanasValue.unshift({"fecha":months[meses],"value":"","halign": "Right","textalign": "End"})
    return {"arr":semanasValue,"residue":res,"data_to_erp":data_to_erp};   // The function returns the product of p1 and p2
  }

exports.getParameterGoal = async(req, res) => {
    // console.log('////////////////////////////////////////////////////////////////////////////');
    try {
        console.time("function")
        let scenario_id = req.body.scenario_id;
        let filter_breed= req.body.filter_breed;
        let filter_stage= req.body.filter_stage;
        
        // console.time('for columns')
        let columns = await DBlayer.DBgetParameterOByScenario(scenario_id);
        // for (var i = columns.length - 1; i >= 0; i--) {
        //     if(!(filter_breed.length==0 && filter_stage.length == 0) &&
        //         ( (filter_breed.length>0 && filter_breed.findIndex(function(element) {return element == columns[i].breed_id;}) < 0 ) ||
        //         (filter_stage.length>0 && filter_stage.findIndex(function(element) {return element == columns[i].stage_id;}) < 0 ) )){
        //         columns.splice(i, 1);
        //     }
        // }
        // console.timeEnd('for columns')
        //une las filas estaticas con las dina
        
        let escenari = await DBlayer.DBgetscenariByid(scenario_id)
        // console.time('boilogicalActive')
        //pareciera que obtiene que una de las metas DIARIAS
        let parameterData = await DBlayer.BDgetParameterGoal(scenario_id);
        //obtiene los activo biológicos (hard)
        let biologicalActive = await DBlayer.DBgetprocess();
        let curveAvg = await DBlayer.DBgetavgcurveBreeds();
        var metas = new Map();
        for(i=0;i<columns.length;i++){
            var array = new Array(2*escenari[0].days.days).fill(0);
            if(!metas.has(columns[i].process_id)){
                metas.set(columns[i].process_id,{"arr":array,"pos":escenari[0].days.days,"merma":(columns[i].decrease_goal)/100,"duracion":columns[i].duration_goal,"pred":columns[i].predecessor_id})
            }
        }
        for(i=0;i<parameterData.length;i++){
            var obj = metas.get(parameterData[i].process_id);
            var array  = obj.arr;
            var fechaini = new Date(parameterData[i].use_year,parameterData[i].use_month - 1 ,1);
            year = parameterData[i].use_year
            mes = parameterData[i].use_month + 1
            if(mes==13){
                year = parameterData[i].use_year + 1
                mes = 1
            }

            var fechafin = new Date(year,mes - 1,1);
            var dias = (fechafin.getTime()- fechaini.getTime())/(1000 * 60 * 60 * 24)
            var value =parseInt(parameterData[i].sum)/dias;
            for(j=0;j<dias;j++){ 
                array[obj.pos-1] = Math.round(value)
                obj.pos++;
            }
            obj.arr = array;
            metas.set(parameterData[i].process_id,obj)
        }
        for(i=0;i<biologicalActive.length;i++)
        {
            var obj = metas.get(biologicalActive[i].process_id);
            for(j=obj.arr.length-1;j>-1;j--){
                var value = obj.arr[j]
                if(obj.pred!==null && value>0){
                    var obj2 = metas.get(obj.pred);
                    var array  = obj2.arr;
                    value = value/(1-obj.merma)
                    // if (obj.merma === 0.3442) {
                    //     // console.log("te enbtro")
                    //     console.log("valor: ", value)
                    //     console.log("pre: ", obj.pred)
                    // }
                    array[j-obj.duracion] = Math.round(array[j-obj.duracion] + value);
                    obj2.arr = array;
                    metas.set(obj.pred,obj2)
                }
                else{
                    if(obj.pred===null && value>0){
                        var curva = curveAvg.find(element => element.breed_id ==biologicalActive[i].breed_id)
                        var curva = curva.avg/7
                        obj.arr[j] = Math.round(value/7);
                        
                        obj.biological_active = biologicalActive[i].biological_active
                    }
                }
            }
            metas.set(biologicalActive[i].process_id,obj)
        }
        var rows = [];
        var toERP = []
        var column = 1;
        for(i=0;i<biologicalActive.length;i++)
        {
            var obj = metas.get(biologicalActive[i].process_id,biologicalActive[i].product_id);
            var fechafin = new Date(escenari[0].date_end.getTime());
            var fechaini = new Date(fechafin.getTime());
            biologicalActive[i].columnid = biologicalActive[i].columnid + " (UN)"
            var array = []
            var resid =0;
            j = obj.arr.length-1;
            while(j>-1)
            {
                fechaini.setMonth(fechaini.getMonth()-1)
                var dias = (fechafin.getTime()- fechaini.getTime())/(1000 * 60 * 60 * 24)
                var semanaArray = getweek(obj.arr.slice(j-dias,j),fechafin.getMonth(),fechafin.getFullYear(),resid,biologicalActive[i].capacity,biologicalActive[i].breed_id,biologicalActive[i].product_id, biologicalActive[i].biological_active, obj.duracion);
                array = semanaArray.arr.concat(array);
                toERP = semanaArray.data_to_erp.concat(toERP)
                resid = semanaArray.residue;
                fechafin.setMonth(fechafin.getMonth()-1);
                j-=dias;
            }
            for(j=0;j<array.length;j++){
                if(column==1){
                    rows.push({"values":[array[j]]});
                }else{
                    if(rows[j] !== undefined){
                        rows[j].values.push(array[j]);
                    }
                }
                
            }
            column++;
        }
        i=0;
        var iscero = true;
        var cont=1;
        while(i<rows.length)
        {
            
            var fila  = rows[i];
            for(j=2;j<fila.values.length;j++)
            {
                if(fila.values[j].value>0){
                    iscero = false;
                }
            }
            if(iscero){
                iscero = true;
                delete rows[i];
                rows.shift();

                i--;
            }else{
                rows[i].values.unshift({"value":rows[i].values[0].fecha});
                var isd = rows[i].values[1].value
                 if(isd===""){
                    
                    rows[i].values.unshift({"value":""});
                   
                    
                }else{
                    rows[i].values.unshift({"value":cont});
                    cont++
                }
                
            }
            i++;
            
        }
        rows.unshift({"values":[]})
        for(i=0;i<rows[1].values.length;i++){
            if(i!=1){
                rows[0].values.push({"value":""})
            }else{
                rows[0].values.push({"value":rows[1].values[i+1].mes})
            }
        }
        
        rows.forEach((itm, n) => {
            itm.values.forEach((elm,i) => {
                if(elm.biological_active === true ){
                    if(elm.value !== 0){
                        let max = elm.value,
                        dur = elm.duracion/7;
                        for(let c = 0; c<rows.length; c++){
                            // console.log('values',rows.length, i, n+c, rows[n+c])
                            if(rows[n+c] !== undefined && rows[n+c].values[i] !== undefined){
                                max = max<rows[n+c].values[i].value?rows[n+c].values[i].value:max;
                                rows[n+c].values[i].value = 0;
                            }
                        }
                        elm.value = max;
                        elm.residue = elm.capacity - max;
                    }else{
                        elm.value = 0;
                        elm.residue = elm.capacity;
                    }
                }
            });
        });
        biologicalActive.unshift({"columnid":"Semana"})
        biologicalActive.unshift({"columnid":"Nº"})
        // Bienvenidos a esta historia donde haremos muchas cosas para guardar todos estos datos para la capa superior, 
        // acompañanos en esta ardua labor!
        let tmp =  rows.slice(0,escenari[0].days.days/7);
        if(tmp.length > 0){
            let er = [];
            tmp.forEach(itm => {
                itm.values.forEach(itm2 => {
                    if(itm2.product_id !== undefined && itm2.product_id !== null && itm2.product_id !== ''){
                        er.push({...itm2, scenario_id});
                    }
                });
            });
            let result = await DBslinc.DBfindEggProducts(JSON.stringify(er));
            let final = [], exclude = []; 
            result.forEach( (rst, index) => {
                
                if(index !== exclude.find(e => e === index)){
                    var indices = result.map(function(e, i) { 
                        var afil = e.scheduled_date.split("-"),
                            arst = rst.scheduled_date.split("-");
                        if(afil[2]===arst[2] && afil[1]===arst[1] && afil[0]===arst[0]){
                            return i 
                        }else{ return ''}
                    }).filter(itm => itm!=='');
                    let acum = 0;
        
                    indices.forEach(idx => {
                        acum = acum+result[idx].eggsrequired
                    });
                    exclude = exclude.concat(indices);
                    final.push({
                        scenario_id: rst.scenario_id,
                        eggsrequired: acum,
                        scheduled_date: rst.scheduled_date,
                        scheduled_quantity: 0
                    });
                }
                
            });
            let arrUp = [], arrN = [];
    
            for (let j = 0; j < final.length; j++) {
                const element = final[j];
                
                let incProy = await DBslinc.DBfindProjectionByDateAndScenario(final[j].scheduled_date, final[j].scenario_id);
    
                if(incProy.length>0){
                    arrUp.push({
                        slincubator: incProy[0].slincubator,
                        eggsrequired: final[j].eggsrequired
                    })
                }else{
                    arrN.push(final[j]);
                } 
            }
            
            if(arrUp.length){
                await DBslinc.DBupdateIncProjections(arrUp);
            }
            
            if(arrN.length){
                await DBslinc.DBaddNewIncProjections(arrN);
            }    
        }
        console.timeEnd('function')
        res.status(200).send({
            statusCode: 200,
            msg: "success",
            columns: biologicalActive,
            rows: rows.slice(0,escenari[0].days.days/7),
            staticColumns: staticColumns,
            codeColumns: codeColumns,
            data_to_erp: toERP,
            error:false
        });

    } catch (err) {
        console.log(err);
        res.status(200).send({
            statusCode: 200,
            error: true,
            errorCode: err.code
        });
    }
};

exports.getMaxDemandEggs = async(req, res) => {
    try {

        let scenario_id = req.body.scenario_id;
        console.log("ESCENARIOID", req.body);

        let biologicalActive = await DBprocess.DBfindProductByStage(breedingStage);
        console.log("salida (biologicalActive) ", biologicalActive);
        console.log("-------------------");
        let aBiologicalActive = [];
        console.log("-////-");
        biologicalActive.forEach(item=>{
            aBiologicalActive.push(item.process_id);
        }); //Cambiar esto por por un .map(item=>item.process_id)

        let results = await DBlayer.getMaxDailyDemandEggs(scenario_id, aBiologicalActive);
        console.log("salida (getMaxDailyDemandEggs) ", results);
        console.log("----------------");
        res.status(200).send({statusCode: 200, results: results});

    } catch (err) {
        console.log(err);
        res.status(200).send( { statusCode: 200, error: err.message, errorCode: err.code } );
    }
};

function getMonthName(month) {
    //console.log('Nombre de : ' + month);
    switch (parseInt(month)) {
    case 1:
        return "Enero";
        break;
    case 2:
        return "Febrero";
        break;
    case 3:
        return "Marzo";
        break;
    case 4:
        return "Abril";
        break;
    case 5:
        return "Mayo";
        break;
    case 6:
        return "Junio";
        break;
    case 7:
        return "Julio";
        break;
    case 8:
        return "Agosto";
        break;
    case 9:
        return "Septiembre";
        break;
    case 10:
        return "Octubre";
        break;
    case 11:
        return "Noviembre";
        break;
    case 12:
        return "Diciembre";
        break;
    default:
        break;

    }

}

exports.getParameterInByScenario = async(req, res) => {
    try {

        let scenario_id = req.body.scenario_id;
        console.log(scenario_id);
        let columns = await DBlayer.DBgetParameterInByScenario(scenario_id);

        res.status(200).send({
            statusCode: 200,
            msg: "success",
            data: columns
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }

};

exports.reportParameterGoal = async(req, res) => {
    try {

        let code = req.params.code;
        let query = await DBlayer.DBgetScenarioId(code);
        let scenario_id = query[0].scenario_id;
        let columns = await DBlayer.DBgetParameterOByScenario(scenario_id);
        let biologicalActive = await DBprocess.DBfindProductByStage(breedingStage);
        let aBiologicalActive = [];

        biologicalActive.forEach(item=>{
            aBiologicalActive.push(item.process_id);
        });
        let maxDemandEggs = await DBlayer.getMaxDailyDemandEggs(scenario_id, aBiologicalActive);
        /*let demandEggs = 0;
    maxDemandEggs.forEach(item=>{
      demandEggs += item.unit_goal;
    });
    maxDemandEggs[0].unit_goal = demandEggs;*/
        columns.unshift({
            columnid: "Semana"
        });

        //console.log(columns);
        let parameterDayData = await DBlayer.BDgetParameterGoal(scenario_id);
        let rows = [];
        //DESDE AQUI
        if (parameterDayData.length > 0) {
            let scenarioInfo = await scenario.DBfindIdScenario(req, res);
            let newDate = await calendarDay.BDfindDateBySequence(parameterDayData[0].newsequence, parameterDayData[0].calendar_id);
            let aSum = [];

            let object = {};
            let week = newDate[0].week;
            let monthWeek = newDate[0].week.getMonth() + 1;
            //console.log('Primer mes '+ monthWeek);
            let monthName = getMonthName(monthWeek);
            let record = {};
            columns.forEach(function(element, index) {
                aSum.push({
                    value: "",
                    product_id: 0
                });
                if(!index) record[columns[index].columnid] = monthName;
                else
                    record[columns[index].columnid] = "";
            });
            aSum.pop();
            //console.log(aSum);
            rows.push(record);
            aSum = [];
            record = {};
            let previousMonth = monthWeek;
            //aSum = products.slice();
            aSum = Array.from(columns);
            aSum.shift();
            aSum.unshift({
                value: week.getDate()+"/"+(week.getMonth()+1)+"/"+week.getFullYear(),
                product_id: 0
            });
            let flag = 1,
                aDemandProduct=[];
  		//console.log("products", aSum, "endproducts");
  		for(let i =0 ; i<parameterDayData.length; i++){
  		    let newDate = await calendarDay.BDfindDateBySequence(parameterDayData[i].newsequence, parameterDayData[i].calendar_id);
                if (week.getTime() === newDate[0].week.getTime()) {
                    aSum.forEach(function(product, index, arr) {
                        if (product.product_id == parameterDayData[i].product_id) {
                            //console.log('Value: '+product.value+ "unit: "+parameterDayData[i].unit_goal +" Product: "+parameterDayData[i].product_id);
                            product.value += parameterDayData[i].unit_goal;
                            product.residue -= parameterDayData[i].unit_goal;
                            product.capacity = parameterDayData[i].capacity;
                            product.parameter_id = parameterDayData[i].parameter_id;
                            product.biological_active = parameterDayData[i].biological_active;
                            product.breed_id = parameterDayData[i].breed_id;
                        }
                    });

                    if (parameterDayData.length == i + 1) {
                        //ultima semana
                        record = {};
                        aSum.map((product, index, aSum)=> {
                            if(!isNaN(product.value) && product.residue !== undefined) {
                                product.value = Math.round(product.value);
                                product.residue = product.capacity - product.value;
                                record[columns[index].columnid] = aSum[index].value;
                            }
                            else {
                                record[columns[0].columnid] = aSum[0].value;
                            }

                        });
                        rows.push(record);
                        //aSum = [];
                    }
                } else {
                    //Otra Semana
                    record = {};
                    aSum.map((product, index, aSum)=> {
                        if(!isNaN(product.value) && product.residue !== undefined) {
                            let isDemand = false;
                            aDemandProduct.forEach(item=>{
                                if(item==product.product_id){
                                    isDemand = true;
                                }
                            });
                            if(product.biological_active == true && !isDemand) {

                                /*product.value = Math.round(demandEggs / (1 - (maxDemandEggs[0].decrease_goal / 100)));
                  product.capacity = maxDemandEggs[0].capacity;
                  product.residue = maxDemandEggs[0].capacity - product.value;
                  flag = 0;*/
                                /*NUEVO*/
                                aDemandProduct.push(product.product_id);
                                let demandEggs = 0,
                                    decreaseG = 0,
                                    capacityG = 0;
                                console.log("La raza es: ",product.breed_id);
                                let flag = false,
                                    i = 0;
                                while(!flag && i<maxDemandEggs.length){
                                    if(maxDemandEggs[i].breed_id==product.breed_id){
                                        demandEggs = maxDemandEggs[i].unit_goal;
                                        decreaseG = maxDemandEggs[i].decrease_goal;
                                        capacityG = maxDemandEggs[i].capacity;
                                        flag = true;
                                    }
                                    i++;
                                }

                                //console.log("demandEggs1: ", demandEggs, "breed_id: ", product.breed_id, "product_id:", product.product_id);
                                //maxDemandEggs[0].unit_goal = demandEggs;

                                //console.log("demandEggs2: ", Math.round(demandEggs / (1 - (decreaseG / 100))), "Merma: ", decreaseG);

                                product.value = Math.round(demandEggs / (1 - (decreaseG / 100)));
                                product.capacity = capacityG;
                                product.residue = capacityG - product.value;
                                //flag = 0;
                                /*FIN*/
                            }
                            else {
                                product.value = Math.round(product.value);
                                product.residue = product.capacity - product.value;
                            }
                            record[columns[index].columnid] = aSum[index].value;
                            if(isDemand){
                                product.value = 0;
                                product.residue = 0;
                                product.state = "None";
                                record[columns[index].columnid] = 0;
                            }
                            //console.log('*',record[columns[index].columnid],'=', aSum[index].value);


                        }
                        else {
                            //console.log('**',record[columns[0].columnid],'=', aSum[0].value);
                            record[columns[0].columnid] = aSum[0].value;
                        }

                    });
                    //console.log("nueva semana inserto: ", aSum);
                    rows.push(record);

                    aSum = [];

                    //let eDateWeek = newDate[0].week.getMonth() + 1;
                    let eMonthWeek = newDate[0].week.getMonth() + 1;
                    record = {};
                    //console.log(previousMonth+' !='+ eMonthWeek);
                    if (previousMonth != eMonthWeek) {
                        monthWeek = eMonthWeek;
                        monthName = getMonthName(eMonthWeek);
                        aSum.push({
                            value: monthName,
                            product_id: 0
                        });
                        columns.forEach(function(colum, index, columns) {
                            aSum.push({
                                value: "",
                                product_id: 0
                            });
                            if(!index) record[columns[index].columnid] = monthName;
                            else
                                record[columns[index].columnid] = "";
                        });
                        aSum.pop();

                        rows.push(record);
                        aSum = [];
                    }
  		//aSum = [];
  		      console.log("limpio sum", aSum);
                    week = newDate[0].week;
                    // let products = await DBlayer.DBgetParameterOByScenario(scenario_id);
                    aSum = await DBlayer.DBgetParameterOByScenario(scenario_id);

                    //console.log("Sum new", aSum);
                    aSum.unshift({
                        value: week.getDate()+"/"+(week.getMonth()+1)+"/"+week.getFullYear(),
                        product_id: 0,
                    });
                    //console.log("Otras emana ", aSum);

                    aSum.forEach(function(product, index, arr) {
                        if (product.product_id == parameterDayData[i].product_id) {
                            product.value += parameterDayData[i].unit_goal;
                            product.residue -= parameterDayData[i].unit_goal;
                            product.capacity = parameterDayData[i].capacity;
                            product.parameter_id = parameterDayData[i].parameter_id;
                        }
                    });
                    previousMonth = monthWeek;
                }
            }
        } //SI no hay nada

        res.status(200).send({
            rows: rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }

};

exports.reportParameterGoalDetail = async(req, res) => {
    try {

        let code = req.params.code;
        let query = await DBlayer.DBgetScenarioId(code);
        let scenario_id = query[0].scenario_id;
        let columns = await DBlayer.DBgetParameterOByScenario(scenario_id);
        let biologicalActive = await DBprocess.DBfindProductByStage(breedingStage);
        let aBiologicalActive = [];

        biologicalActive.forEach(item=>{
            aBiologicalActive.push(item.process_id);
        });
        let maxDemandEggs = await DBlayer.getMaxDailyDemandEggs(scenario_id, aBiologicalActive);

        /*
    let demandEggs = 0;
    maxDemandEggs.forEach(item=>{
      demandEggs += item.unit_goal;
    });
    maxDemandEggs[0].unit_goal = demandEggs;*/

        let columns2 = [];
        columns.forEach(function(element, index) {
            let obj = element;
            columns2.push(obj);
            columns2.push({
                "product_id": obj.product_id,
                "columnid": "Capacidad " + index,
                "value": 0
            });
            columns2.push({
                "product_id": obj.product_id,
                "columnid": "Residuo " + index,
                "value": 0
            });
        });
        columns.unshift({
            columnid: "Semana"
        });
        columns2.unshift({
            columnid: "Semana"
        });
        console.log(columns2);
        let parameterDayData = await DBlayer.BDgetParameterGoal(scenario_id);
        let rows = [];
        //DESDE AQUI
        if (parameterDayData.length > 0) {
            let scenarioInfo = await scenario.DBfindIdScenario(req, res);
            let newDate = await calendarDay.BDfindDateBySequence(parameterDayData[0].newsequence, parameterDayData[0].calendar_id);
            let aSum = [];

            let object = {};
            let week = newDate[0].week;
            let monthWeek = newDate[0].week.getMonth() + 1;
            //console.log('Primer mes '+ monthWeek);
            let monthName = getMonthName(monthWeek);
            let record = {};
            let par = 2;
            columns.forEach(function(element, index) {
                aSum.push({
                    value: "",
                    product_id: 0
                });
                if(!index) record[columns2[index].columnid] = monthName;
                else if(index===1){
                    record[columns2[index].columnid] = "";
                    record[columns2[index+1].columnid] = "";
                    record[columns2[index+2].columnid] = "";
                }
                else {
                    let j = par + index;
                    record[columns2[j].columnid] = "";
                    record[columns2[j+1].columnid] = "";
                    record[columns2[j+2].columnid] = "";
                    par = par + 2;
                }
            });
            aSum.pop();
            //console.log(aSum);
            rows.push(record);
            aSum = [];
            record = {};
            let previousMonth = monthWeek;
            //aSum = products.slice();
            aSum = Array.from(columns);
            aSum.shift();
            aSum.unshift({
                value: week.getDate()+"/"+(week.getMonth()+1)+"/"+week.getFullYear(),
                product_id: 0
            });
            let flag = 1,
                aDemandProduct=[];
  		//console.log("products", aSum, "endproducts");
  		for(let i =0 ; i<parameterDayData.length; i++){
  		    let newDate = await calendarDay.BDfindDateBySequence(parameterDayData[i].newsequence, parameterDayData[i].calendar_id);
                if (week.getTime() === newDate[0].week.getTime()) {
                    aSum.forEach(function(product, index, arr) {
                        if (product.product_id == parameterDayData[i].product_id) {
                            console.log("Value: "+product.value+ "unit: "+parameterDayData[i].unit_goal +" Product: "+parameterDayData[i].product_id);
                            product.value += parameterDayData[i].unit_goal;
                            product.residue -= parameterDayData[i].unit_goal;
                            product.capacity = parameterDayData[i].capacity;
                            product.parameter_id = parameterDayData[i].parameter_id;
                            product.biological_active = parameterDayData[i].biological_active;
                            product.breed_id = parameterDayData[i].breed_id;
                        }
                    });

                    if (parameterDayData.length == i + 1) {
                        //ultima semana
                        record = {};
                        par = 2;
                        aSum.map((product, index, aSum)=> {
                            if(!index) record[columns2[index].columnid] = aSum[0].value;
                            else if(index===1){
                                product.value = Math.round(product.value);
                                product.residue = product.capacity - product.value;
                                record[columns2[index].columnid] = aSum[index].value;
                                record[columns2[index+1].columnid] = product.capacity;
                                record[columns2[index+2].columnid] = product.residue;
                            }
                            else {
                                product.value = Math.round(product.value);
                                product.residue = product.capacity - product.value;
                                let j = par + index;
                                record[columns2[j].columnid] = aSum[index].value;
                                record[columns2[j+1].columnid] = product.capacity;
                                record[columns2[j+2].columnid] = product.residue;
                                par = par + 2;
                            }

                        });
                        rows.push(record);
                        //aSum = [];
                    }
                } else {
                    //Otra Semana
                    par = 2;
                    record = {};
                    aSum.map((product, index, aSum)=> {
                        let isDemand = false;
                        aDemandProduct.forEach(item=>{
                            if(item==product.product_id){
                                isDemand = true;
                            }
                        });

                        if(!index) record[columns2[index].columnid] = aSum[0].value;
                        else if(index===1){
                            product.value = Math.round(product.value);
                            product.residue = product.capacity - product.value;
                            record[columns2[index].columnid] = aSum[index].value;
                            record[columns2[index+1].columnid] = product.capacity;
                            record[columns2[index+2].columnid] = product.residue;
                        }
                        else if(product.biological_active == true && !isDemand) {

                            aDemandProduct.push(product.product_id);
                            let demandEggs = 0,
                                decreaseG = 0,
                                capacityG = 0;
                            console.log("La raza es: ",product.breed_id);
                            let flag = false,
                                i = 0;
                            while(!flag && i<maxDemandEggs.length){
                                if(maxDemandEggs[i].breed_id==product.breed_id){
                                    demandEggs = maxDemandEggs[i].unit_goal;
                                    decreaseG = maxDemandEggs[i].decrease_goal;
                                    capacityG = maxDemandEggs[i].capacity;
                                    flag = true;
                                }
                                i++;
                            }

                            //product.value = Math.round(demandEggs / (1 - (maxDemandEggs[0].decrease_goal / 100)));
                            //product.capacity = maxDemandEggs[0].capacity;
                            //product.residue = maxDemandEggs[0].capacity - product.value;
                            product.value = Math.round(demandEggs / (1 - (decreaseG / 100)));
                            product.capacity = capacityG;
                            product.residue = capacityG - product.value;

                            flag = 0;
                            let j = par + index;
                            record[columns2[j].columnid] = aSum[index].value;
                            record[columns2[j+1].columnid] = product.capacity;
                            record[columns2[j+2].columnid] = product.residue;
                            par = par + 2;
                        }
                        else {
                            product.value = Math.round(product.value);
                            product.residue = product.capacity - product.value;
                            if(isDemand){
                                product.value = 0;
                                product.residue = 0;
                                product.state = "None";
                            }
                            let j = par + index;
                            record[columns2[j].columnid] = aSum[index].value;
                            record[columns2[j+1].columnid] = product.capacity;
                            record[columns2[j+2].columnid] = product.residue;
                            par = par + 2;
                        }



                    });
                    console.log("nueva semana inserto: ", aSum);
                    rows.push(record);

                    aSum = [];

                    //let eDateWeek = newDate[0].week.getMonth() + 1;
                    let eMonthWeek = newDate[0].week.getMonth() + 1;
                    record = {};
                    par = 2;
                    //console.log(previousMonth+' !='+ eMonthWeek);
                    if (previousMonth != eMonthWeek) {
                        monthWeek = eMonthWeek;
                        monthName = getMonthName(eMonthWeek);
                        aSum.push({
                            value: monthName,
                            product_id: 0
                        });
                        columns.forEach(function(colum, index, columns) {
                            aSum.push({
                                value: "",
                                product_id: 0
                            });
                            /*if(!index) record[columns[index].columnid] = monthName;
                else
                  record[columns[index].columnid] = '';*/
                            if(!index) record[columns2[index].columnid] = monthName;
                            else if(index===1){
                                record[columns2[index].columnid] = "";
                                record[columns2[index+1].columnid] = "";
                                record[columns2[index+2].columnid] = "";
                            }
                            else {
                                let j = par + index;
                                record[columns2[j].columnid] = "";
                                record[columns2[j+1].columnid] = "";
                                record[columns2[j+2].columnid] = "";
                                par = par + 2;
                            }
                        });
                        aSum.pop();

                        rows.push(record);
                        aSum = [];
                    }
  		//aSum = [];
  		      console.log("limpio sum", aSum);
                    week = newDate[0].week;
                    // let products = await DBlayer.DBgetParameterOByScenario(scenario_id);
                    aSum = await DBlayer.DBgetParameterOByScenario(scenario_id);

                    console.log("Sum new", aSum);
                    aSum.unshift({
                        value: week.getDate()+"/"+(week.getMonth()+1)+"/"+week.getFullYear(),
                        product_id: 0,
                    });
                    console.log("Otras emana ", aSum);

                    aSum.forEach(function(product, index, arr) {
                        if (product.product_id == parameterDayData[i].product_id) {
                            product.value += parameterDayData[i].unit_goal;
                            product.residue -= parameterDayData[i].unit_goal;
                            product.capacity = parameterDayData[i].capacity;
                            product.parameter_id = parameterDayData[i].parameter_id;
                        }
                    });
                    previousMonth = monthWeek;
                }
            } // FIN for
        } //SI no hay nada
        res.status(200).send({
            rows: rows
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }

};

exports.calculateProgressive = async(req, res) => {
    const scenario_id = req.body.scenario_id;
    console.log(`Bienvenido ${scenario_id}`);

    try {
        let eggDemand = await DBlayer.DBeggDemand(scenario_id);
        //Descomentar cuando ya se tenga el modelo matematico
        //let individualEggProduction = await DBlayer.DBindividualEggProduction(scenario_id);
        let individualEggProduction = [
            208.2966214,
            166.2728984,
            136.9242175,
            149.3914884,
            164.9343724,
            192.2053413,
            191.4311938,
            185.116148,
            167.9270768,
            196.243894,
            184.0533184,
            191.1185381,
            208.2966214,
            166.2728984,
            136.9242175,
        ];
        const quantityOfHens = 10000;


        let totalProduction = individualEggProduction.map((elem)=>{
            return elem * quantityOfHens;
        });

        let deficit =  eggDemand.map((elem, i)=>{
            return elem.unit_goal - totalProduction[i];
        });

        let summation = 0;
        deficit.forEach((elem)=>{
            summation+=elem;
        });
        //let unitEggs = [];
        let unitEggs = await DBlayer.DBunitEggs(scenario_id);
        /*  let unitEggsAndTotalEggs =
          [ {fecha: "2017-12-28", ue: 28.0321307, te: 503065},
            {fecha: "2018-01-04",	ue: 30.4025204,	te: 545604},
            {fecha: "2018-01-11",	ue: 34.0105472,	te: 610353},
            {fecha: "2018-01-18",	ue: 36.2131217,	te: 649881},
            {fecha: "2018-01-25",	ue: 36.7515288,	te: 659543},
            {fecha: "2018-02-01",	ue: 37.1920437,	te: 667448},
            {fecha: "2018-02-08",	ue: 39.506495,	te: 708984},
            {fecha: "2018-02-15",	ue: 43.0376065,	te: 772353},
            {fecha: "2018-02-22",	ue: 45.1982272,	te: 811127},
            {fecha: "2018-03-01",	ue: 45.5688191,	te: 817778},
            {fecha: "2018-03-08",	ue: 45.8555034,	te: 822923},
            {fecha: "2018-03-15",	ue: 38.9610956,	te: 699196},
            {fecha: "2018-03-22",	ue: 42.5900993,	te: 764322},
            {fecha: "2018-03-29",	ue: 44.8695891,	te: 805230},
            {fecha: "2018-04-05",	ue: 45.3240886,	te: 813386},
            {fecha: "2018-04-12",	ue: 45.030412,	te: 808116},
            {fecha: "2018-04-19",	ue: 44.2962205,	te: 794940},
            {fecha: "2018-04-26",	ue: 43.5969905,	te: 782392},
            {fecha: "2018-05-03",	ue: 42.9117451,	te: 770094},
            {fecha: "2018-05-10",	ue: 42.1286075,	te: 756040},
            {fecha: "2018-05-17",	ue: 41.3664468,	te: 742362},
            {fecha: "2018-05-24",	ue: 40.5693246,	te: 728057},
            {fecha: "2018-05-31",	ue: 39.786187,	te: 714003},
            {fecha: "2018-06-07",	ue: 40.065879,	te: 719022},
            {fecha: "2018-06-14",	ue: 34.611885,	te: 621145},
            {fecha: "2018-06-21",	ue: 40.3245941,	te: 723665},
            {fecha: "2018-06-28",	ue: 43.9186363,	te: 788164},
            {fecha: "2018-07-05",	ue: 44.9674813,	te: 806986},
            {fecha: "2018-07-12",	ue: 44.820643,	te: 804351},
            {fecha: "2018-07-19",	ue: 44.1284053,	te: 791928},
            {fecha: "2018-07-26",	ue: 43.4361676,	te: 779505},
            {fecha: "2018-08-02",	ue: 42.7788914,	te: 767710},
            {fecha: "2018-08-09",	ue: 41.9957538,	te: 753656},
            {fecha: "2018-08-16",	ue: 41.2475777,	te: 740229},
            {fecha: "2018-08-23",	ue: 40.4784247,	te: 726426},
            {fecha: "2018-08-30",	ue: 39.716264,	te: 712748},
            {fecha: "2018-09-06",	ue: 40.0029483,	te: 717893},
            {fecha: "2018-09-13",	ue: 43.6389443,	te: 783144},
            {fecha: "2018-09-20",	ue: 49.1209075,	te: 881524},
            {fecha: "2018-09-27",	ue: 52.4772115,	te: 941756},
            {fecha: "2018-10-04",	ue: 47.2190019,	te: 847392},
            {fecha: "2018-10-18",	ue: 46.1841415,	te: 828821},
            {fecha: "2018-10-11",	ue: 46.9742714,	te: 843000},
            {fecha: "2018-10-25",	ue: 45.4289731,	te: 815268},
            {fecha: "2018-11-01",	ue: 44.6947816,	te: 802093},
            {fecha: "2018-11-08",	ue: 37.7933815,	te: 678240},
            {fecha: "2018-11-15",	ue: 37.129113,	te: 666319},
            {fecha: "2018-11-22",	ue: 36.4368753,	te: 653896},
            {fecha: "2018-11-29",	ue: 35.7656145,	te: 641850},
            {fecha: "2018-12-06",	ue: 35.0943537,	te: 629803},
            {fecha: "2018-12-13",	ue: 28.3817457,	te: 509339},
            {fecha: "2018-12-20",	ue: 27.8783001,	te: 500304},
            {fecha: "2018-12-27",	ue: 28.0321307,	te: 503065},
            {fecha: "2019-01-03",	ue: 30.4025204,	te: 545604}
        ];*/

        let day = [];
        //Calcular los huevos a incubadora y los huevos a almacen

        res.status(200).send({
            statusCode: 200,
            msg: "success",
            eggDemand: eggDemand,
            individualEggProduction: individualEggProduction,
            quantityOfHens: quantityOfHens,
            totalProduction: totalProduction,
            deficit: deficit,
            summation: summation,
            unitEggs: unitEggs
        });



    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }
};

exports.brooderReport = async(req, res) => {

    try {
    //Buscar el escenario activo
        console.log("Llegue a brooder 2");
        let objScenario = await scenario.findByStatus(1);
        console.log(objScenario);
        let date_start = objScenario.date_start,
            endYear = date_start.getFullYear(),
            scenario_id = objScenario.scenario_id;
        //console.log(scenario_id, endYear);
        let monthlyDemandChicken = await DBlayer.DBfindParameterByYear(scenario_id, endYear, 33); //33 es el parameter_id de de pollo vivo en pie
        //console.log(monthlyDemandChicken);
        let eggDemand = await DBlayer.DBeggDemand(scenario_id, endYear);
        //console.log("eggDemand", eggDemand);
        let eggDemandF = [];
        //console.log("eggDemand: ", eggDemand);
        //eliminar los anios que no me interesan
        eggDemand.forEach( item =>{
            if(item.newyear === endYear)
                eggDemandF.push(item);
        });

        //console.log(eggDemandF);
        //traer los datos de eggs planned
        let planed = await eggsPlanning.DBfindEggs_planning();
        console.log("planed", planed, "l: ", planed.length);
        console.log("eggDemandF ", eggDemandF, "l: ", eggDemandF.length);
        //diferencia entre lo planificado y requerido
        let diff = [];
        planed.forEach((item, i) =>{
            //console.log('D: ', i);
            diff.push(item.planned - eggDemandF[i].unit_goal );
        });
        console.log("diff: ", diff);

        const maximum_storage = 7,
            minimum_storage = 3,
            storage = maximum_storage - minimum_storage;

        //Paso 5 calcular el tiempo maxino y minimo en incubadora
        //console.log("Hasta aqui todo bien");
        let month_storage = [
            {
                "day": 31
            },
            {
                "day": 28
            },
            {
                "day": 31
            },
            {
                "day": 30
            },
            {
                "day": 31
            },
            {
                "day": 30
            },
            {
                "day": 31
            },
            {
                "day": 31
            },
            {
                "day": 30
            },
            {
                "day": 31
            },
            {
                "day": 30
            },
            {
                "day": 31
            }
        ];
        let brooderPlanning = [];
        //demanda de huevo anaual
        let lot_eggs = await lotEggs.DBfindAllLotEggs();
        lot_eggs.forEach((item, i) => {
            item.theorical_performance = item.theorical_performance * 10000;
            //item.theorical_performance = item.theorical_performance * 16668;
            item.week = i+1;

            item.minimum_storage = Math.round(item.theorical_performance/7);

        });
        //console.log(lot_eggs);
        let week = 1,
            count_week = 1;

        let dayCalendar = 0;
        for(let i = 0; i < 12; i++){
            let month = month_storage[i].day;
            for(let j = 0; j < month; j++){
                let obj = {};

                if(count_week == 7 ){
                    //console.log(`${j+1}`, `${i+1}`, week);
                    week++;
                    count_week = 0;
                }
                dayCalendar += 1;
                obj.dayCalendar = dayCalendar;
                obj.day = `${j+1}`;
                obj.month = `${i+1}`;
                obj.week = week;
                obj.huevosAlmacenamiento = 0;
                obj.huevosIncubadora = 0;
                brooderPlanning.push(obj);
                count_week++;
            }
        }
        //console.log(brooderPlanning);
        let dayYear = 365;
        let huevosquesevanaalmacenar = 0,
            huevos_incubadora = 0;
        //console.log(brooderPlanning);
        //console.log("lot_eggs: ", lot_eggs)
        brooderPlanning.forEach(item => {
            let egg_minimal_storage = 0;

            if(item.day<4 && item.month == 1){
                egg_minimal_storage = findEggMinimalStorage(lot_eggs , 1);
            }else{
                egg_minimal_storage = findEggMinimalStorage(lot_eggs ,item.week);
            }
            let lastDay = item.dayCalendar - storage,
                pos = lastDay;
            if(lastDay < 0){
                pos = dayYear + lastDay;
            }else if(pos==0){
                pos = 1;
            }
            console.log(pos);
            if(item.day == 1){
                huevosquesevanaalmacenar = (diff[item.month-1]/storage) + brooderPlanning[pos-1].huevosAlmacenamiento;
            }

            if(huevosquesevanaalmacenar < 0){
                item.huevosAlmacenamiento = 0;
            }else if(egg_minimal_storage.minimum_storage  > huevosquesevanaalmacenar){
                item.huevosAlmacenamiento = huevosquesevanaalmacenar;
            }else{
                item.huevosAlmacenamiento = egg_minimal_storage.minimum_storage;
            }



            huevos_incubadora = ((egg_minimal_storage.theorical_performance/7) - item.huevosAlmacenamiento) + brooderPlanning[pos-1].huevosAlmacenamiento ;
            item.egg_minimal_storage = egg_minimal_storage.minimum_storage;
            item.huevosIncubadora = Math.round(huevos_incubadora);
            if(item.day==10){

            }

            item.huevosquesalendegranja = 0;
        });
        let report = [],
            eggs_brooder = 0,
            eggs_warehouse = 0,
            weekBrooder = 1,
            objBrooder = {};
        let huevosAlmacenamiento = 0,
            huevosIncubadora = 0,
            huevosgranja = 0,
            old_chicks = 0;


        //Volvera calcular la cantidad MAX-MIN

        for(let i = 0; i<storage; i++){

            let egg_minimal_storage = findEggMinimalStorage(lot_eggs , 1);
            //console.log("egg_minimal_storage: ", egg_minimal_storage);
            let lastDay = brooderPlanning[i].dayCalendar - storage,
                pos = lastDay;

            if(lastDay < 0){
                pos = dayYear + lastDay;
            }else if(pos==0){
                pos = 365;
            }
            //console.log("pos: ", pos);

            if(brooderPlanning[i].day == 1){
                huevosquesevanaalmacenar = (diff[brooderPlanning[i].month-1]/storage) + brooderPlanning[pos-1].huevosAlmacenamiento;
                //console.log("Dia 1:", diff[brooderPlanning[i].month-1]/storage);
                //console.log("brooderPlanning: ", brooderPlanning[pos].huevosAlmacenamiento);
                //console.log("huevosquesevanaalmacenar: ",huevosquesevanaalmacenar);
            }


            if(huevosquesevanaalmacenar < 0){
                brooderPlanning[i].huevosAlmacenamiento = 0;
            }else if(egg_minimal_storage.minimum_storage  > huevosquesevanaalmacenar){
                brooderPlanning[i].huevosAlmacenamiento = huevosquesevanaalmacenar;
                console.log("Colocar huevosquesevanaalmacenar: ", huevosquesevanaalmacenar);
            }else{
                brooderPlanning[i].huevosAlmacenamiento = egg_minimal_storage.minimum_storage;
                console.log("Colocar egg_minimal_storage.minimum_storage: ", egg_minimal_storage.minimum_storage);
            }

            //console.log("huevosAlmacenamiento: ", brooderPlanning[i].huevosAlmacenamiento);
            //console.log(brooderPlanning[pos-1]);
            huevos_incubadora = ((egg_minimal_storage.theorical_performance/7) - brooderPlanning[i].huevosAlmacenamiento) + brooderPlanning[pos-1].huevosAlmacenamiento ;
            //console.log("huevos_incubadora", huevos_incubadora);
            brooderPlanning[i].huevosIncubadora = Math.round(huevos_incubadora);
        }

        brooderPlanning.forEach(item => {
            let day = item.dayCalendar + minimum_storage;
            if(day>365){
                day = item.dayCalendar;
            }
            item.huevosquesalendegranja = brooderPlanning[day-1].huevosIncubadora;
            //  console.log("Dia: ",item.dayCalendar, "minimum_storage: ",minimum_storage ,"huevosquesalendegranja: ", brooderPlanning[day-1].huevosIncubadora);
        });

        //console.log(brooderPlanning);
        brooderPlanning.forEach(item => {
            console.log("Dia: ", item.dayCalendar);
            let day = item.dayCalendar - 21;
            if(day<0){
                day = 365 + day;
            }else if(day>=0){
                day+=1;
            }
            console.log(brooderPlanning[0].huevosIncubadora);
            console.log("DAy: ",day," HI: ",brooderPlanning[day-1].huevosIncubadora, "Dia: ",brooderPlanning[day-1].dayCalendar);
            item.old_chicks = brooderPlanning[day-1].huevosIncubadora*0.86;
        });

        let Bday = 1,
            Bmonth = 1,
            wBrooder = 1;
        brooderPlanning.forEach(item => {
            if(item.week == weekBrooder){
                huevosAlmacenamiento += item.huevosAlmacenamiento;
                huevosIncubadora += item.huevosIncubadora;
                huevosgranja += item.huevosquesalendegranja;
                old_chicks += item.old_chicks;
            }else{
                objBrooder.week = wBrooder;
                objBrooder.brooder_day = Bday;
                objBrooder.brooder_month = Bmonth;
                objBrooder.eggs_farm = huevosgranja;
                objBrooder.eggs_minimum = huevosIncubadora - huevosAlmacenamiento < 0? 0:Math.round(huevosIncubadora - huevosAlmacenamiento);
                objBrooder.eggs_maximum = Math.round(huevosAlmacenamiento);
                objBrooder.eggs_brooder = huevosIncubadora;
                objBrooder.old_chicks = Math.round(old_chicks);

                report.push(objBrooder);
                objBrooder ={};
                Bday = item.day;
                Bmonth = item.month;
                huevosgranja = 0;
                huevosAlmacenamiento = 0;
                huevosIncubadora = 0;
                old_chicks = 0;
                weekBrooder = item.week;
                huevosgranja += item.huevosquesalendegranja;
                huevosAlmacenamiento += item.huevosAlmacenamiento;
                huevosIncubadora += item.huevosIncubadora;
                old_chicks += item.old_chicks;
                wBrooder++;
            }
        });

        //insertar datos en el reportParameterGoal
        //let addBrooder = await DBbrooder.DBaddBrooderReport(report);

        //Genrar los lotes para engorde

        //Primero - Buscar las granjas de engorde
        /*    let fatteningFarm = await DBfarm.DBfindFarmByPartAndStatus(6 , 2);

    let aFarm = fatteningFarm.map(function(elem) {
       return elem.farm_id;
    });

    let shed = await DBshed.DBfindShedsByFarms(JSON.stringify(aFarm));
    console.log(shed);

    brooderPlanning.forEach(item => {

        let chicks =  item.old_chicks / 2;
        let chicks_h = Math.round(chicks),
            chicks_m = Math.floor(chicks),
            lot_fattening = [];

        //Asignar a los galpones
        let assigned = false;
        let date_fatt = new Date(2018, item.month-1, item.day);

        while(!assigned && i < shed.length){

          let fecha1 = "2017-"+item.month+"-"+item.day;
          let fe = item.dayCalendar + shed[i].rotation_days,
              fecha2 = "-"+"-";
          if(shed[i].capmax >= chicks_h){
            let isAvailableHousing = this.isAvailableHousing(fecha1,fecha2, shed[i].shed_id);


          }else if (shed[i].capmin <= chicks_h){
            let isAvailableHousing = this.isAvailableHousing(fecha1,fecha2, shed[i].shed_id);


          }


          let code = Math.floor((Math.random() * 10000) + 1);

          i++;
        }

    });
*/

        res.status(200).send({
            statusCode: 200,
            msg: "success",
            data: report,
            brooderPlanning: brooderPlanning
        });



    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }
};

function findEggMinimalStorage(aWeeks, week){
    //console.log('Buscar minimo Week: ', week);
    let band = false,
        i = 0,
        eggs = {};
    while(!band && i<aWeeks.length){

        if(aWeeks[i].week == week){
            eggs.minimum_storage = aWeeks[i].minimum_storage;
            eggs.theorical_performance = aWeeks[i].theorical_performance;
            band = true;
        }
        i++;
    }
    //console.log("Voy a retornar eggs: "+ eggs);
    return eggs;
}


exports.syncToERP = async(req, res) => {
    try {

        let dataERP = req.body.dataERP;
        let scenario_id = req.body.scenario_id;

        let columns = await DBlayer.DBsyncToERP(dataERP);

        res.status(200).send({
            statusCode: 200,
            msg: "success"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }
};

exports.isSyncToERP = async(req, res) => {
    try {

        let scenario_id = req.body.scenario_id;

        let columns = await DBlayer.DBisSyncToERP(scenario_id);

        res.status(200).send({
            statusCode: 200,
            msg: "success",
            results: columns
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            statusCode: 500,
            error: err,
            errorCode: err.code
        });
    }
};

exports.getGoalsResults = async(req, res) => {
    try {
        let data = await DBlayer.DBgetGoalsResults();
        res.status(200).send({
            statusCode: 200, data: data
        });

    } catch (err) {
        console.log(err);
        res.status(200).send( { statusCode: 200, error: err.message, errorCode: err.code } );
    }
};

exports.getGoalsResultsDemandSum = async(req, res) => {
    try {
        let data = await DBlayer.DBgetGoalsResultsDemandSum();
        res.status(200).send({
            statusCode: 200, data: data
        });

    } catch (err) {
        console.log(err);
        res.status(200).send( { statusCode: 200, error: err.message, errorCode: err.code } );
    }
};

exports.getGoalsResultsByScenario = async(req, res) => {
    try {
        let scenario_id = req.body.scenario_id;
        let data = await DBlayer.DBgetGoalsResultsByScenario(scenario_id);
        res.status(200).send({
            statusCode: 200, data: data
        });

    } catch (err) {
        console.log(err);
        res.status(200).send( { statusCode: 200, error: err.message, errorCode: err.code } );
    }
};
