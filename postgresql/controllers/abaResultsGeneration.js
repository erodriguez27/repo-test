var axios = require("axios");

const urlAbaElements = 'abaElements';
const urlAbaElementsProperties = 'abaElementsProperties';
const urlAbaFormulation = 'abaFormulation';
const urlAbaConsumptionAndMortality = 'abaConsumptionAndMortality';
const urlAbaElementsAndConcentrations = 'abaElementsAndConcentrations';
const urlAbaResults = 'abaResults';
const urlAbaBreedsAndStages = 'abaBreedsAndStages/withProcessInfo';
const urlAbaConsumptionAndMortalityDetail = 'abaConsumptionAndMortalityDetail';
const urlAbaStagesOfBreedsAndStages = 'abaStagesOfBreedsAndStages';
const urlAbaAlimentsAndStages = 'abaAlimentsAndStages';
const urlGoalsResults = 'scenario_param/getParameterGoal';
const urlActiveScenario = 'scenario/activeScenario';
const urlMerma = 'scenario_proc/getScenariosProcess';
let serverName = "";

exports.generateResults = async function (req, res) {
    console.log("hola")
    try {
        //escenario a utilizar
        serverName = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort;
        let activeScenario = await req.body.idScenario;
        let processes = await getAllProcessByStage();
        let allProcesses = await getAllProcess();

        //obtengo salida de la regresiva para ese escenario
        allDemandData = await getGoalsResults(activeScenario, processes, req);
    
        //aqui armo estructura con los datos del proceso de ABA
        let allTheData = [];
        allTheData.push(await getAbaElements());
        allTheData.push(await getAbaElementsProperties());
        allTheData.push(await getAbaFormulation());
        allTheData.push(await getAbaConsumptionAndMortality());
        allTheData.push(await getAbaElementsAndConcentrations());
        allTheData.push(await getAbaBreedsAndStages());
        allTheData.push(await getAbaConsumptionAndMortalityDetail());
        allTheData.push(await getAbaStagesOfBreedsAndStages());
        allTheData.push(await getMermas(activeScenario));

               //aqui separo los elementos basandome en sus propiedades
        let prop1 = allTheData[0].filter(actualElement => actualElement.id_aba_element_property == 1);
        let prop2 = allTheData[0].filter(actualElement => actualElement.id_aba_element_property == 2);
        let prop3 = allTheData[0].filter(actualElement => actualElement.id_aba_element_property == 3);

        //array con elementos separados por propiedades
        let arrayOfProperties = new Array(prop1, prop2, prop3);

        //mapa con id de producto y cantidad de macroelementos

        var resultMapOrg = new Map();
        //mapa con id de producto y cantidad de macroelementos cuando se sustituye en equivalencia
        var alternativeResultMapOrg = new Map();

        //variables para la demanda clasificada por
        let sumOfCriaYLevante = 0;
        let sumOfEngorde = 0;


        var mesResultMap = new Map();
        //inicio de los calculos
        for(let DemandMes  of  allDemandData){
            var allDemandMes = DemandMes[1];
            var fecha = DemandMes[0].split("/");
            if(!mesResultMap.has(fecha[2])){
                mesResultMap.set(fecha[2], new Map());
            }
            if(!mesResultMap.get(fecha[2]).has(fecha[1])){
                mesResultMap.get(fecha[2]).set(fecha[1], new Map());
            }
            if(!mesResultMap.get(fecha[2]).get(fecha[1]).has(DemandMes[0])){
                mesResultMap.get(fecha[2]).get(fecha[1]).set(DemandMes[0], {macroElement: new Map(),altElement: new Map()});
            }
            var resultMap = new Map();
            //mapa con id de producto y cantidad de macroelementos cuando se sustituye en equivalencia
            var alternativeResultMap = new Map()
            for (let demandRow of allDemandMes) {
                //encuentro el breedAndStage con ese producto
                let currentBreedAndStage = allTheData[5].filter(breedAndStage => breedAndStage.product_id == demandRow[0]);
                //ahora busco los stages de ese BreedAndStages en StagesOfBreedsAndStages
                if (currentBreedAndStage.length > 0) {
                    //veo si tiene predecesor igual a 0 para buscar la merma en txscenarioprocess
                    if(currentBreedAndStage[0].predecessor_id == 0){//cria y levante
                        //busco en txscenarioprocess la merma
                        let tempMerma = allTheData[8].find(rows => rows.process_id == currentBreedAndStage[0].process_id);
                        //ahora obtengo la merma y la aplico a la demanda con ese producto
                        demandRow[1] = demandRow[1] + demandRow[1] * tempMerma.decrease_goal/100;
                        sumOfCriaYLevante = sumOfCriaYLevante + demandRow[1];
                    }else{
                        //busco en txscenarioprocess la merma
                        let tempMerma = allTheData[8].find(rows => rows.process_id == currentBreedAndStage[0].process_id);
                        //ahora obtengo la merma y la aplico a la demanda con ese producto
                        demandRow[1] = demandRow[1] + demandRow[1] * tempMerma.decrease_goal/100;
                        sumOfEngorde = sumOfEngorde + demandRow[1];
                    }
                    let stagesOfCurrentBreedAndStage = allTheData[7].filter(id_aba_breeds_and_stages => id_aba_breeds_and_stages.id_aba_breeds_and_stages == currentBreedAndStage[0].id);
                    //aqui tomo la demanda, la demanda la tomo con el id de consumo y mortalidad que esta en breedsandstages
                    let consAndMortalityOfCurrentBreedAndStage = allTheData[3].filter(consumptionAndMortality => consumptionAndMortality.id == currentBreedAndStage[0].id_aba_consumption_and_mortality);
                    //ahora pido toda la demanda por unidad de tiempo con ese id
                    let consAndMortalityWithTimeOfCurrentBreedAndStage = allTheData[6].filter(consumptionAndMortalityDetail => consumptionAndMortalityDetail.id_aba_consumption_and_mortality == consAndMortalityOfCurrentBreedAndStage[0].id);
                    //ya tengo las fases, ahora itero sobre ellas
                    let sumOfTimes = 0;
                    
                    for (let stage of stagesOfCurrentBreedAndStage) {
                        //obtengo los elementos en elementsAndConcentrations con el idFormulation del Stage
                        let currentFormulationElements = allTheData[4].filter(formulation => formulation.id_aba_formulation == stage.id_formulation);
                        //ahora itero sobre sus duraciones
                        //usar el consumo de ese breedandstage y el porcentaje en funcion al elemento
                        let sumOfMortality = 0;
                        let sumOfAliments = 0;
                        for (i = 0; i < stage.duration; i++) {
                            //ahora sobre los elementos de la formula en esa fase
                            for (let elementAndProportions of currentFormulationElements){
                                if(!resultMapOrg.has(elementAndProportions.id_aba_element)){
                                    resultMapOrg.set(elementAndProportions.id_aba_element, 0);
                                }
                                if(!resultMap.has(elementAndProportions.id_aba_element)){
                                    resultMap.set(elementAndProportions.id_aba_element, 0);
                                }
                                //consumo en ese momento * proporcion del elemento dentro de 1g de formula * demanda
                                //tengo que usar al consumptionAndMortalityDetail allTheData[6] a partir de breedsAndStages
                                //asumo que viene pre ordenado
                                let temp = elementAndProportions.proportion/100 *
                                    consAndMortalityWithTimeOfCurrentBreedAndStage[sumOfTimes+i].consumption
                                    * demandRow[1];
                                resultMap.set(elementAndProportions.id_aba_element, resultMap.get(elementAndProportions.id_aba_element) + temp);
                                resultMapOrg.set(elementAndProportions.id_aba_element, resultMapOrg.get(elementAndProportions.id_aba_element) + temp);
                                sumOfAliments = sumOfAliments + temp;
                                //alimentos alternativos
                                let elementToSearch = allTheData[0].find(actualElement => actualElement.id == elementAndProportions.id_aba_element);
                                //ya tengo el elemento cuyo tipo de propiedad buscare en el vector
                                let equivalentElements = arrayOfProperties[elementToSearch.id_aba_element_property-1];
                                //ya tengo los elementos equivalentes, no repetir con el actual
                                //itero sobre esos equivalentes asignando en funcion al resultado anterior sin repetir el original
                                if(!alternativeResultMap.has(elementToSearch.id)){
                                            
                                    alternativeResultMap.set(elementToSearch.id, new Map());
                                }
                                if(!alternativeResultMapOrg.has(elementToSearch.id)){
                                            
                                    alternativeResultMapOrg.set(elementToSearch.id, new Map());
                                }
                                for (let elementToSee of equivalentElements){
                                    if(elementToSearch.id != elementToSee.id){
                                        //inicializacion
                                        var tempMap = alternativeResultMap.get(elementToSearch.id);
                                        var tempMap2 = alternativeResultMapOrg.get(elementToSearch.id);
                                        if(!tempMap.has(elementToSee.id)){
                                            tempMap.set(elementToSee.id,0);
                                        }
                                        if(!tempMap2.has(elementToSee.id)){
                                            tempMap2.set(elementToSee.id,0);
                                        }
                                        let temp2 = (elementAndProportions.proportion/100*
                                                    elementToSearch.equivalent_quantity/elementToSee.equivalent_quantity) *
                                                    consAndMortalityWithTimeOfCurrentBreedAndStage[sumOfTimes+i].consumption
                                                    * demandRow[1];
                                        tempMap.set(elementToSee.id,tempMap.get(elementToSee.id) + temp2);
                                        tempMap2.set(elementToSee.id,tempMap2.get(elementToSee.id) + temp2);
                                        alternativeResultMap.set(elementToSearch.id,tempMap);
                                        alternativeResultMapOrg.set(elementToSearch.id,tempMap2);
                                    }
                                }                            
                            }
                            //ya paso una unidad de tiempo asi que mato a los pollos, los mato luego por fase
                            sumOfMortality = sumOfMortality + consAndMortalityWithTimeOfCurrentBreedAndStage[sumOfTimes+i].mortality;
                        }
                        demandRow[1] = demandRow[1] - (demandRow[1] * sumOfMortality/100);
                        sumOfTimes += stage.duration;
                    }
                }
            }
            jsonResult = {macroElement: resultMap,altElement: alternativeResultMap};
            mesResultMap.get(fecha[2]).get(fecha[1]).set(DemandMes[0],jsonResult);
        }
        //suma de las demandas dependiendo del stage
        // for (let row of allDemandData) {
        //     for (let proc of allProcesses.data) {
        //         if (proc.product_id == row[0]){
        //             if(proc.stage_id == 5){
        //                 sumOfCriaYLevante = sumOfCriaYLevante + row[1];
        //             }else{
        //                 if(proc.stage_id == 1){
        //                     sumOfEngorde = sumOfEngorde + row[1];
        //                 }
        //             }
        //         }
        //     }
        // }
        // console.log(resultMap);
        // console.log(alternativeResultMap);
        var finalJ = {"equivalents": []};
    
        var iterator1 = resultMapOrg[Symbol.iterator]();
        var JsonGeneral = {"fecha":"General","equivalents": []};
        //enviar json con resultados: id, nombre y cantidad
        for (let element of iterator1) {
            let type = allTheData[0].find(actualElement => actualElement.id == element[0]);
            let tempElement = {"fecha": "Macroelemento","id": type.id, "name": type.name, "quantity": (element[1]/1000).toLocaleString('de-DE'), "equivalents": []};
            tempAlternativeMap=alternativeResultMapOrg.get(element[0]);
            arrayOfProperties[type.id_aba_element_property-1].forEach(function(element2) {
                if(tempAlternativeMap.has(element2.id)){
                    let tempAlternativeElement = {"fecha": "Equivalente","id": element2.id, "name": element2.name};
                    tempAlternativeElement.quantity = (tempAlternativeMap.get(element2.id)/1000).toLocaleString('de-DE')
                    console.log(tempAlternativeMap.get(element2.id).toLocaleString('de-DE').replace(/[.,]/g, function(x) {
                        return x == ',' ? '.' : ',';
                    }));
                    tempElement.equivalents.push(tempAlternativeElement);
                }
            });
            JsonGeneral.equivalents.push(tempElement);
        };
        //armar json a retornar con elementos principales y equivalentes
        finalJ.equivalents.push(JsonGeneral)
        var meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
        var JsonDetallado = {"fecha": "Detallados","equivalents": []};
        var iterator1 =  mesResultMap[Symbol.iterator]();
        for(let anios of iterator1){
            var inteator2 = anios[1][Symbol.iterator]();
            var Jsonanio = {"fecha": anios[0] ,"equivalents": []};
            
            //enviar json con resultados: id, nombre y cantidad
            for(let month of inteator2){ 
                var inteator4 = month[1][Symbol.iterator]();
                var Jsonmes = {"fecha": meses[parseInt(month[0])-1] ,"equivalents": []};
                for(let Days of inteator4){
                    var date = Days[0].split("/")
                    var finalJson = {"fecha": date[0] + "/" + date[1] + "/" + date[2] ,"equivalents": []};
                    var inteator3 = Days[1].macroElement[Symbol.iterator]();
                    for (let element of inteator3) {
                        let type = allTheData[0].find(actualElement => actualElement.id == element[0]);
                        let tempElement = {"fecha": "Macroelemento", "name": type.name, "quantity": (element[1]/1000).toLocaleString('de-DE'), "equivalents": []};
                        tempAlternativeMap = Days[1].altElement.get(element[0]);
                        arrayOfProperties[type.id_aba_element_property-1].forEach(function(element2){
                            if(tempAlternativeMap.has(element2.id)){
                                let tempAlternativeElement = {"fecha": "Equivalente", "name": element2.name};
                                tempAlternativeElement.quantity = (tempAlternativeMap.get(element2.id)/1000).toLocaleString('de-DE')
                                console.log(tempAlternativeMap.get(element2.id).toLocaleString('de-DE').replace(/[.,]/g, function(x) {
                                    return x == ',' ? '.' : ',';
                                }));
                                tempElement.equivalents.push(tempAlternativeElement);
                            }
                        });
                        finalJson.equivalents.push(tempElement);
                    };
                    Jsonmes.equivalents.push(finalJson);
                };
                Jsonanio.equivalents.push(Jsonmes);
            };
            JsonDetallado.equivalents.push(Jsonanio);
        };
        finalJ.equivalents.push(JsonDetallado);

        res.status(200).json({
            statusCode: 200,
            data: finalJ,
            stats: [{"text": "Cría y Levante",
                    "quantity": parseInt(sumOfCriaYLevante).toLocaleString('de-DE')},
                    {"text": "Engorde",
                    "quantity": parseInt(sumOfEngorde).toLocaleString('de-DE')}
                    ]
        });
    } catch(err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
}
;

async function getActiveScenario() {
    let respuesta;
    var url = serverName + '/' + urlActiveScenario;
    respuesta = await axios.get(url);
    return respuesta.data.scenario_id;
}

async function getAbaElements() {
    let respuesta;
    var url = serverName + '/' + urlAbaElements;
    respuesta = await axios.get(url);
    return respuesta.data.data;

}

async function getAbaElementsProperties() {
    let respuesta;
    var url = serverName +  '/' + urlAbaElementsProperties;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getAbaFormulation() {
    let respuesta;
    var url = serverName +  '/' + urlAbaFormulation;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getAbaConsumptionAndMortality() {
    let respuesta;
    var url = serverName +  '/' + urlAbaConsumptionAndMortality;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getAbaElementsAndConcentrations() {
    let respuesta;
    var url = serverName + '/' + urlAbaElementsAndConcentrations;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getAbaResults() {
    let respuesta;
    var url =serverName +  '/' + urlAbaResults;
    respuesta = await axios.get(url);
    return respuesta.data;
}

async function getAbaBreedsAndStages() {
    let respuesta;
    var url =  serverName + '/' + urlAbaBreedsAndStages;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getAbaConsumptionAndMortalityDetail() {
    let respuesta;
    var url = serverName +  '/' + urlAbaConsumptionAndMortalityDetail;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getAbaStagesOfBreedsAndStages() {
    let respuesta;
    var url = serverName + '/' + urlAbaStagesOfBreedsAndStages;
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getMermas(scenario_id) {
    let respuesta;
    var url =  serverName + '/' + urlMerma;
    respuesta = await axios.post(url, {
        "scenario_id":scenario_id,
    });
    return respuesta.data.results;
}

async function getAllProcessByStage() {
    let respuesta;
    var url =  serverName +'/' + "process/findProcessByStage";
    respuesta = await axios.post(url, {
        "stage_id": 5
    });
    return respuesta.data;
}

async function getAllProcess() {
    let respuesta;
    var url =  serverName + '/' + "process";
    respuesta = await axios.get(url);
    return respuesta.data.data;
}

async function getGoalsResults(scenario_id, processes, req) {
    let respuesta;
    var url = serverName + '/' + urlGoalsResults;
    respuesta = await axios.post(url, {
        "scenario_id":scenario_id,
        "filter_breed" : [],
        "filter_stage" : []
    });
    var tempMap = new Map();

    //obtener años y ver si esta en el array de años
    let yearsArray = req.body.years;
    let initialYear = req.body.initialYear;
    respuesta.data.data_to_erp.forEach(function(element) {
        //buscar si el producto es de reproductora
        let answer = processes.data.find(function(temp) {
            return temp.product_id == element.product_id;
        });
        //considerar solo los que esten dentro del año y sean de reproductora
        var fecha = element.fecha.split("/")
        if((yearsArray.length==0 || yearsArray.includes(fecha[2])) && answer) {

            if(!tempMap.has(element.fecha)){
                                        
                tempMap.set(element.fecha, new Map());
            } 
            var tempElement = tempMap.get(element.fecha);
            if(!tempElement.has(element.product_id)){        
                tempElement.set(element.product_id, 0);
            } 
            tempElement.set(element.product_id,tempElement.get(element.product_id) + element.value);
            tempMap.set(element.fecha,tempElement);
        }
    });
    return tempMap;
}