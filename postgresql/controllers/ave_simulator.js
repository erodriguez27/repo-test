var axios = require("axios");
const fetch = require("node-fetch");
const DBlayer = require("../models/postureCurve");
const DBlayerSimula = require("../models/ave_simulator");
const DBlayerbreed = require("../models/breed");
const express = require('express');
const {spawn} = require('child_process');
const puerto = 3009;//backend abaARP
const puerto2 = 3009;//backend ARP sin aba
const urlAbaResults = 'abaResults';
const urlGoalsResults = 'scenario_param/getParameterGoal';
const urlActiveScenario = 'scenario/activeScenario';
const urlMerma = 'scenario_proc/getScenariosProcess';
const lotReproduct ='/reports/breeding2'
let oAviProj;
let serverName = "";
exports.openSimulator = async function(req,res)
{

    try{
    
        let sFilName = 'api.py';
        oAviProj = spawn('python', ["./controllers/birds_simulator-master/" + sFilName]);
        res.status(200).json({
            statusCode: 200,
            data: "OK"
        });
    }catch(err) {
        await Closeprocess();
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
}
async function getAlllotReproduct(fecha1,fecha2,post,activeScenario) {
    let respuesta;
    // var url = 'http://127.0.0.1:' + puerto + lotReproduct;
    // respuesta = await axios.post(url,{
    //     "date1":fecha1,
    //     "date2":fecha2,
    //     "breed_id":post,
    //     "scenario_id":activeScenario,
    // });

    let date1 = fecha1,
        date2 = fecha2,
        breed_id = post,
        scenario_id = activeScenario,
        tod = false;
    let recordsd = [];

    let aDate = date1.split("."),
        init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

    let aDate2 = date2.split("."),
        end_date = `${aDate2[2]}-${aDate2[1]}-${aDate2[0]}`;

    recordsd = await DBlayerSimula.DBfindBreeding2(init_date, end_date, breed_id, scenario_id);

    return recordsd;
}
exports.updateparameter = async function (req, res)
{
    let optimizer_id = await req.body.id;
    let breed_id = await req.body.breed_id;
    let max_housing =await req.body.max_housing;
    let min_housing =await req.body.min_housing;
    let difference =await req.body.difference;
    data = await DBlayerSimula.DBupdateparameter(optimizer_id ,breed_id,max_housing,min_housing,difference)
    res.status(200).json({
        statusCode: 200,
        data: "OK"
    });
}
exports.insertparameter = async function (req, res)
{
    let breed_id = await req.body.breed_id;
    let max_housing =await req.body.max_housing;
    let min_housing =await req.body.min_housing;
    let difference =await req.body.difference;
    data = await DBlayerSimula.DBinsertparameter(breed_id,max_housing,min_housing,difference)
    res.status(200).json({
        statusCode: 200,
        data: "OK"
    });
}
exports.changeActive = async function (req, res)
{
    let optimizer_id = await req.body.optimizer_id;
    let breed_id = await req.body.breed_id;
    let active = await req.body.active;
    data = await DBlayerSimula.DBchangeActive(optimizer_id ,breed_id,active)
    res.status(200).json({
        statusCode: 200,
        data: "OK"
    });
}
exports.deleteparameter = async function (req, res)
{
    let optimizer_id = await req.body.optimizer_id;
    data = await DBlayerSimula.DBdeleteparameter(optimizer_id)
    res.status(200).json({
        statusCode: 200,
        data: "OK"
    });
}
exports.findparameter = async function (req, res)
{
    data = await DBlayerSimula.DBfindparameter();
    breed = await DBlayerbreed.DBfindAllBreedWP("Plexus")
    parameterActive = await DBlayerSimula.DBfindparameterinTrue()

    res.status(200).json({
        statusCode: 200,
        data: data,
        breed: breed,
        parameterActive:parameterActive
    });
}
exports.findbreedByscenari = async function (req, res)
{
    let activeScenario = await req.body.idScenario;
    breed = await DBlayerSimula.DBfindpostureByscenari(activeScenario)
    res.status(200).json({
        statusCode: 200,

        breed: breed
    });
}
exports.generateSimulator = async function (req, res) {
    try {
        console.log("body",req.body);
        
        //escenario a utilizar
        serverName = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort;
        let algorit = await req.body.algoritmo;
        let sCosto = await req.body.sCosto;
        let sAloja = await req.body.sAloj;
        let activeScenario = await req.body.idScenario;
        let fecha = await req.body.fecha;
        let post = await req.body.breed_id;
        fecha = fecha.split(".")
        var fechaD = new Date(fecha[2],fecha[1]-1,fecha[0])
        fecha = new Date(fecha[2],fecha[1]-1,fecha[0])
        var fecha1 =new Date(fecha.setDate(fecha.getDate()-259));
        fecha1 = fecha1.getDate()+ "." + (fecha1.getMonth()+1) + "." + fecha1.getFullYear()
        var fecha2= fechaD.getDate()+ "." + (fechaD.getMonth()+1) + "." + fechaD.getFullYear()
        let lotReproductos =[];
        if(sAloja=="Con alojamiento"){
            lotReproductos = await getAlllotReproduct(fecha1,fecha2,post,activeScenario)
        }
        let processes = await getAllProcessByStage();
        let allDemandData = await getGoalsResults(activeScenario,fecha2,post, processes, req);
        //obtengo salida de la regresiva para ese escenario
        let  curvePosture = await DBlayer.DBfindCurveByBreed(post);
        let curvaPostura = []
        for (let i = 0; i < curvePosture.length; i++) 
        {
            curvaPostura.push(curvePosture[i].theorical_performance);
            
        }   
        var alojamientoPrevio = [];
        for (let i = 0; i < curvePosture.length; i++) 
        {
            alojamientoPrevio.push(0);
            
        }   
        for (let i = 0; i < lotReproductos.length; i++) 
        {
            alojamientoPrevio[alojamientoPrevio.length - lotReproductos[i].ext - 1] = lotReproductos[i].sum
        }
        if(lotReproductos.length==0){
            sAloja = "Sin alojamiento"
        }
        var parameters = await DBlayerSimula.DBgetActive(post);
        let finalj= null
        
        var finalJ={
            "demand": allDemandData.demand[0],
            "posture": curvaPostura,
            "previous":alojamientoPrevio,
            "fecha":allDemandData.fecha,
            "lower_bound": parameters[0].min_housing,
            "upper_bound": parameters[0].max_housing,
            "algoritm": sAloja,
            "diference":parameters[0].difference,
            "optimizer":algorit
        } 
        if(allDemandData.demand[0]!=undefined && parameters[0].min_housing!= undefined && parameters[0].max_housing!=undefined && parameters[0].difference!=undefined){
            console.log(finalJ)
            let process = spawn('python', ["./postgresql/controllers/optimizador.py",
                JSON.stringify(finalJ)
            ]);
            process.stdout.on('data', function (data) {
                console.log(data)
                report = data.toString().trim();
                report =  report.replace(new RegExp("'", 'g'), '"');
                console.log(report)
                report =JSON.parse(report)
                res.status(200).json({
                    statusCode: 200,
                    data: report
                });
            });
        }else{
            res.status(500).json({
                statusCode: 500,
                pgErrorCode: err
            });
        }
        
    } catch(err) {
        console.log(err)
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

async function getActiveScenario() {
    let respuesta;
    var url = serverName + '/' + urlActiveScenario;
    respuesta = await axios.get(url);
    return respuesta.data.scenario_id;
}


async function getAbaResults() {
    let respuesta;
    var url = serverName + '/' + urlAbaResults;
    respuesta = await axios.get(url);
    return respuesta.data;
}



async function getMermas(scenario_id) {
    let respuesta;
    var url = serverName + '/' + urlMerma;
    respuesta = await axios.post(url, {
        "scenario_id":scenario_id,
    });
    return respuesta.data.results;
}

async function getAllProcessByStage() {
    let respuesta;
    var url = serverName + '/' + "process/findProcessByStage";
    respuesta = await axios.post(url, {
        "stage_id": 3
    });
    return respuesta.data;
}

async function getAllProcess() {
    let respuesta;
    var url = serverName + '/' + "process";
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getGoalsResults(scenario_id,fechaInicio,post, processes, req) {
    let respuesta;
    var pos = post;
    var url = serverName + '/' + urlGoalsResults;
    respuesta = await axios.post(url, {
        "scenario_id":scenario_id,
        "filter_breed" : [pos],
        "filter_stage" : []
    });
    var tempMap = [];
    fechaInicio = fechaInicio.split(".")
    var fecha = new Date(fechaInicio[2],fechaInicio[1]-1,fechaInicio[0]);
    //obtener años y ver si esta en el array de años
    var tempyear = []
    var tempfecha = []
    var demanda = respuesta.data.data_to_erp;
    var i=0;
    while(i<demanda.length && tempyear.length<42){
        //buscar si el producto es de reproductora
        let answer = processes.data.find(function(temp) {
            return temp.product_id === demanda[i].product_id && pos === demanda[i].breed_id;
        });
        fechaInicio= demanda[i].fecha.split("/");
        var fecha2 = new Date(fechaInicio[2],fechaInicio[1],fechaInicio[0]);
        //considerar solo los que esten dentro del año y sean de reproductora
        if(answer && fecha < fecha2) {
            var tempdate = fecha2.getDate() + "/" + parseInt(fecha2.getMonth()+1, 10) + "/" + fecha2.getFullYear();
            tempfecha.push(tempdate)
            tempyear.push(demanda[i].value);
        }
        i++;
    }
    if(tempyear.length>0){
        tempMap.push(tempyear);
    }
    
    return {fecha:tempfecha,demand:tempMap};
}