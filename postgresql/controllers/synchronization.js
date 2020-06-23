//const DBlayer = require('../models/breed');
const configSync = require("../../configSync");
const DBlayer = require("../models/synchronization"); //Model
const DBhw = require("../models/housingWayDetail");
const DBpe = require("../models/programmedEggs");
const DBbd = require("../models/broilerDetail");
const fetch = require("fetch-headers");
const base64 = require("base64-js");
const xmlhttp = require("xmlhttprequest");
var request = require("request");
var axios = require("axios");
const utils = require("../../lib/utils");

var token;
var j = request.jar();

const user = configSync.user;
const pass = configSync.password;
const urlToken = configSync.urlToken;
const urlPostToSap = configSync.urlPostToSap;

// const user = "SOFOS.JMMP";
// const pass = "hc2444_BB";
// const urlToken = "http://sitag-fiori:8002/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/PROD_DEMAND_Set?$format=json&sap-language=ES";
// const urlPostToSap = "http://sitag-fiori:8002/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/PROD_DEMAND_Set";

let serverName = "";

exports.mainSync = async function(req, res) {
    serverName = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort;
    //console.log("la ruta de luis")
    //console.log(serverName);
    var objectToSend;
    var partnershipSyncDone = false;
    var productSyncDone = false;
    var measureSyncDone = false;
    var farmSyncDone = false;

    function syncIsFinished(res) {
        if (partnershipSyncDone && productSyncDone && measureSyncDone && farmSyncDone) {
            // if(partnershipSyncDone){
            // if(farmSyncDone){
            console.log("AL FIN");
            res.status(200).json({
                statusCode: 200
            });
        }
    }

    async function partnershipSync() {
        let counter = 0;
        let dataToSave;
        let respuesta;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/COMPANY_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await partnershipPostWrapper(respuesta.data.d.results);
        } catch (e) {
            console.log("Error empresa" );
            console.log(e);
        }
    }

    async function partnershipPostWrapper(arrayToSend) {
        var ar = new Array();
        let ret = arrayToSend.map(async function (element) {
            objectToSend = {
                name: element.PartnershipName,
                description: " ",
                address: element.CountryId + "," + element.StateId + "," + element.CityId + "," + element.Address + ",",
                code: element.PartnershipCode
            };
            ar.push(objectToSend);
        }
        );
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/partnership", ob); //Insercion en lote

        return ret;
    }

    async function farmSync() {
        let counter = 0;
        let currentEnd;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/FARMS_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await farmPostWrapper(respuesta.data.d.results);
        } catch (e) {
            console.log("Error farm");
            console.log(e);
        }
    }

    async function farmPostWrapper(arrayToSend) {
        var ar = new Array();
        let ret = await Promise.all(arrayToSend.map(async function (element) {
            //aqui necesito conseguir el id del partnership a partir del codigo
            realPartnershipId = await axios.post(serverName + "/partnership/findIdByCode", {
                partnership_code: element.PartnershipCode
            });
            //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
            objectToSend = {
                partnership_id: realPartnershipId.data.data[0].partnership_id,
                code: element.FarmCode,
                name: element.Name,
                farm_type_id: parseInt(element.FarmTypeId)
            };
            ar.push(objectToSend);
        }
        ));
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/farm", ob); //Insercion en lote

        return ret;
    }

    async function productSync() {
        let counter = 0;
        let currentEnd;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/PRODUCTS_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await productPostWrapper(respuesta.data.d.results);
        } catch (e) {
            console.log("Error product");
            console.log(e);
        }
    }

    async function productPostWrapper(arrayToSend) {
        var ar = new Array();
        let ret =  Promise.all(arrayToSend.map(async function (element) {
            objectToSend = {
                code: element.ProductCode,
                name: element.ProductName
            };
            ar.push(objectToSend);
        }
        )
        );
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/product", ob); //Insercion en lote

        return ret;
    }

    async function measureSync() { //Chequear si amerita lote
        let counter = 0;
        let currentEnd;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/PRODUCTS_CF_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await measurePostWrapper(respuesta.data.d.results);
        } catch (e) {
            console.log("Error measure");
            console.log(e);
        }
    }

    async function measurePostWrapper(arrayToSend) {
        var ar = new Array();
        let ret = arrayToSend.map(async function (element) {
            //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
            objectToSend = {
                name: element.MeasureName,
                abbreviation: element.MeasureAbbreviation,
                originvalue: element.MeasureOriginvalue,
                valuekg: element.MeasureValuekg,
                is_unit: null //No viene en el url
            };
            ar.push(objectToSend);
        }
        );
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/measure", ob); //Insercion en lote
        return ret;
    }

    async function incubatorPlantSync() {
        let counter = 0;
        let currentEnd;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/INCUBATION_P_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await incubatorPlantPostWrapper(respuesta.data.d.results);
        } catch (e) {
            console.log("Error incubatorPlant");
            console.log(e);
        }
    }

    async function incubatorPlantPostWrapper(arrayToSend) {
        var ar = Array();
        let ret = await Promise.all(arrayToSend.map(async function (element) {
            //tengo que conseguir el id del partnership a partir del codigo
            let realPartnershipId = await axios.post(serverName + "/partnership/findIdByCode", {
                partnership_code: element.PartnershipCode
            });
            //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
            objectToSend = {
                name: element.IncubatorplantName,
                code: element.IncubatorplantCode,
                description: "",
                partnership_id: realPartnershipId.data.data[0].partnership_id,
                max_storage: 0,
                min_storage: 0
            };
            ar.push(objectToSend);
            //ahora hago insercion
            //let toReturn = await axios.post(serverName + "/incubator_plant", objectToSend);
        }
        )
        );
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/incubator_plant", ob); //Insercion en lote
        return ret;
    }

    async function coreAndShedSync() {
        let counter = 0;
        let currentEnd;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/CENTER_WAREHOUSE_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await Promise.all([corePostWrapper(respuesta.data.d.results)]);
            //await Promise.all([shedPostWrapper(respuesta.data.d.results)])
        } catch (e) {
            console.log("Error core and shed"+ e);
        }
    }

    async function corePostWrapper(arrayToSend) { //Chequear si amerita lote
        var arrayOfCodes = new Array();
        var ar = new Array();
        let ret = await Promise.all(arrayToSend.map(async function (element) {
            //tengo que conseguir el id del partnership a partir del codigo
            try {
                let checkCenterCode = await axios.post(serverName + "/center/findIdByCode", {
                    center_code: element.CenterCode
                });

                //necesito verificar la empresa a partir de la granja

                if (!Array.isArray(checkCenterCode.data.data) || !checkCenterCode.data.data.length) {
                    //obtengo el id de la granja
                    let realFarmId = await axios.post(serverName + "/farm/findIdByCode", {
                        farm_code: element.FarmCode
                    });

                    //obtengo el id de la empresa a traves del codigo de la granja
                    let realPartnershipId = await axios.post(serverName + "/farm/findPartnershipIdByCode", {
                        farm_code: element.FarmCode
                    });

                    //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
                    objectToSend = {
                        partnership_id: realPartnershipId.data.data[0].partnership_id,
                        farm_id: realFarmId.data.data[0].farm_id,
                        name: element.CenterName,
                        code: element.CenterCode
                    };

                    // //para no repetir, por ahora vuelvo a hacer comprobacion (hasta que se coloque en bd)
                    // checkCenterCode = await axios.post(serverName + "/center/findIdByCode", {
                    //     center_code: element.CenterCode
                    // });
                    // if (!Array.isArray(checkCenterCode.data.data) || !checkCenterCode.data.data.length) {
                    //ahora hago insercion

                    //teng oque verificar si ya fue insertado a traves del array en la entrada
                    if(!arrayOfCodes.includes(objectToSend.code)) {
                        arrayOfCodes.push(objectToSend.code);
                        //agrego al array el codigo del centro
                        //let toReturn = await axios.post(serverName + "/center", objectToSend);
                        ar.push(objectToSend);
                    }
                    // }
                    // await shedPostWrapperIndividual(element);//todo pendiente
                    //aqui puedo proceder a insertar ese ya que depende de ese centro que acabo de colocar
                } else {
                    //puedo insertar directamente ya que el centro existe
                    // await shedPostWrapperIndividual(element);//todo pendiente
                    console.log("stuffs");
                }
                // await shedPostWrapperIndividual(element);//todo pendiente
            } catch (e) {

            }
            //todo estar pendiente que pasa si no entra en la condicion
        }
        )
        );
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/center", ob);
        return ret;
    }

    async function shedPostWrapperIndividual(actualObject) {//galpon - unused method
        // return await Promise.all(async function (objectToSend) {
        //tengo que conseguir el id del partnership a partir del codigo
        try {
            //el centro lo debo obtener a partir de su codigo
            //aqui traigo el id de la granja
            let realCenterId = await axios.post(serverName + "/center/findIdByCode", {
                center_code: actualObject.CenterCode
            });

            //aqui traigo el id de la granja
            let realFarmId = await axios.post(serverName + "/farm/findIdByCode", {
                farm_code: actualObject.FarmCode
            });

            //obtengo el id de la empresa a traves del codigo de la granja
            let realPartnershipId = await axios.post(serverName + "/farm/findPartnershipIdByCode", {
                farm_code: actualObject.FarmCode
            });

            //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
            objectToSend = {
                name: actualObject.WarehouseName,
                code: actualObject.WarehouseCode,
                description: "",
                partnership_id: realPartnershipId.data.data[0].partnership_id,
                farm_id: realFarmId.data.data[0].farm_id,
                center_id: realCenterId.data.data[0].center_id,
                // max_storage: 1,
                // min_storage: 1
            };
            //ahora hago insercion
            let toReturn = await axios.post(serverName + "/shed", objectToSend);
        } catch (e) {

        }
        // }
        // )
    }

    async function shedPostWrapper(arrayToSend) {//galpon - unused method
        return await Promise.all(arrayToSend.map(async function (element) {
            //tengo que conseguir el id del partnership a partir del codigo
            try {
                //aqui traigo el id de la granja
                let realCenterId = await axios.post(serverName + "/center/findIdByCode", {
                    center_code: element.CenterCode
                });

                //aqui traigo el id de la granja
                let realFarmId = await axios.post(serverName + "/farm/findIdByCode", {
                    farm_code: element.FarmCode
                });

                //obtengo el id de la empresa a traves del codigo de la granja
                let realPartnershipId = await axios.post(serverName + "/farm/findPartnershipIdByCode", {
                    farm_code: element.FarmCode
                });

                //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
                objectToSend = {
                    name: element.WarehouseName,
                    code: element.WarehouseCode,
                    description: "",
                    partnership_id: realPartnershipId.data.data[0].partnership_id,
                    farm_id: realFarmId.data.data[0].farm_id,
                    center_id: realCenterId.data.data[0].center_id,
                    // max_storage: 1,
                    // min_storage: 1
                };
                //ahora hago insercion
                let toReturn = await axios.post(serverName + "/shed", objectToSend);
            } catch (e) {

            }
        }
        )
        );
    }

    async function warehouseSync() {
        let counter = 0;
        let currentEnd;
        var session_url = "http://audacefiori.com:8004/sap/opu/odata/sap/ZOD_PL_PLANNER_SRV/WAREHOUSE_Set?$format=json&sap-client=250&sap-language=ES";
        try {
            respuesta = await axios.get(session_url, {
                auth: {
                    username: user,
                    password: pass
                }
            });
            await warehousePostWrapper(respuesta.data.d.results);
        } catch (e) {
            console.log("Error warehouse");
            console.log(e);
        }
    }

    async function warehousePostWrapper(arrayToSend) {
        var ar = new Array();
        let ret = await Promise.all(arrayToSend.map(async function (element) {
            //tengo que conseguir el id del partnership a partir del codigo
            let realPartnershipId = await axios.post(serverName + "/partnership/findIdByCode", {
                partnership_code: element.PartnershipCode
            });
            let realFarmId = await axios.post(serverName + "/farm/findIdByCode", {
                farm_code: element.FarmCode
            });
            //armo el objeto acorde a lo que se necesita del lado de planificacion, pendiente si se sobreescribe
            objectToSend = {
                name: element.WarehouseName,
                code: element.WarehouseCode,
                //client_id: "",
                partnership_id: realPartnershipId.data.data[0].partnership_id,
                farm_id: realFarmId.data.data[0].farm_id
            };
            ar.push(objectToSend);
            //ahora hago insercion
            //let toReturn = await axios.post(serverName + "/warehouse", objectToSend);
        }
        )
        );
        ob = { registers: ar };
        let toReturn = await axios.post(serverName + "/dataimport/warehouse", ob); //Insercion en lote

        return ret;
    }

    //Promise.all([partnershipSync(), farmSync()]);
    //Promise.all([warehouseSync()]);
    await Promise.all([partnershipSync(), productSync(), measureSync()]).then(console.log("por favor 1"));
    await Promise.all([farmSync(), incubatorPlantSync()]).then(console.log("por favor 2 "));
    await Promise.all([coreAndShedSync(),warehouseSync()]).then(console.log("por favor 3"));
    res.status(200).json({
        statusCode: 200
    });
};

exports.syncLevanteYCria = utils.wrap(async function(req, res) {

    //obtengo el token con cualqueir ruta
    try {
        let tokenAndData = await Promise.all([getToken(), getDataLevanteYCria(req)]);
        console.log("lo enviado en levante y cria");
        console.log(tokenAndData[1].data.data);
        console.log("finalizo lo enviado en levante y cria");
        console.log("la longitud");
        console.log(tokenAndData[1].data.data.length);
        let resp = [];
        if (tokenAndData[1].data.data.length > 0) {
            let wait = await sendToSap(tokenAndData[1].data.data, 5);
            console.log("el wait");
            console.log(wait);
            resp.push(wait);
        }
    
        res.status(200).json({
            statusCode: 200,
            resp: resp
        });
    }
    catch (e) {
        res.status(500).json({
            message: utils.formatErrorMessage(e)
        });
    }

});

exports.syncReproductora = async function(req, res) {
    console.log("entro en la sync rep");
    try {
        let tokenAndData = await Promise.all([getToken(), getDataReproductora(req)]);
       
        console.log("lo enviado en reproductora");
        console.log(tokenAndData[1].data.data);
    
    
        console.log("finalizo lo enviado en reproductora");
        console.log("la longitud");
        console.log(tokenAndData[1].data.data.length);
        let resp = [];
        if (tokenAndData[1].data.data.length > 0) {
            let wait = await sendToSap(tokenAndData[1].data.data, 3);
            console.log("el wait");
            console.log(wait);
            resp.push(wait);
        }
    
        res.status(200).json({
            statusCode: 200,
            resp: resp
        });
    }
    catch (e) {
        res.status(500).json({
            message: utils.formatErrorMessage(e)
        });
    }
    
};

exports.syncIncubadora = async function(req, res) {
    try {
        let tokenAndData = await Promise.all([getToken(), getDataIncubadora(req)]);
       
        console.log("lo enviado en incubadora");
        console.log(tokenAndData[1].data.data);
        console.log("finalizo lo enviado en incubadora");
        console.log("la longitud");
        console.log(tokenAndData[1].data.data.length);
        let resp = [];
        if (tokenAndData[1].data.data.length > 0) {
            let wait = await sendToSap(tokenAndData[1].data.data, 2);
            console.log("el wait");
            console.log(wait);
            resp.push(wait);
        }
        
        res.status(200).json({
            statusCode: 200,
            resp: resp
        });
    }
    catch (e) {
        res.status(500).json({
            message: utils.formatErrorMessage(e)
        });
    }
};

exports.syncEngorde = async function(req, res) {
    
    try {
        
        let tokenAndData = await Promise.all([getToken(), getDataEngorde(req)]);
        
        console.log("lo enviado en engorde");
        console.log(tokenAndData[1].data.data);
        console.log("finalizo lo enviado en engorde");
        console.log("la longitud");
        console.log(tokenAndData[1].data.data.length);
        let resp = [];
        if (tokenAndData[1].data.data.length > 0) {
            let wait = await sendToSap(tokenAndData[1].data.data, 1);
            console.log("el wait");
            console.log(wait);
            resp.push(wait);
        }
        
        res.status(200).json({
            statusCode: 200,
            resp: resp
        });
    }
    catch (e) {
        res.status(500).json({
            message: utils.formatErrorMessage(e)
        });
    }
};

async function getToken(){
    return new Promise(function(resolve, reject) {
        request({
            url: urlToken,
            jar: j,
            headers: {
                "Authorization": "Basic c29mb3Muam1tcDpoYzI0NDRfQkI=",
                "x-csrf-token": "Fetch",
                "Content-Type": "application/json",
            }
        }, function (error, response, body) {
            console.log(error);
            if (error) {
                reject(error);
                return;
            }
            /*console.log("Error: ");
                console.log(error);
                console.log("Response: ");
                console.log(response);
                console.log("Body: ");
                console.log(body);*/
            token = response.headers["x-csrf-token"];
            console.log("Obtenido el token csrf");
            console.log(token);
            // console.log("respuesta del token")
            // console.log(response)
            resolve();
        });
    });
    
}

async function getDataLevanteYCria(req){
    // var session_url = 'http://localhost:3009/housingwaydetail/syncLevanteYCria';
    var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort +  "/synchronization/syncGetAllDateQuantityFarmProductLevanteYCria";
    console.log("la ruta levante y cria sync");
    console.log(session_url);
    try {
        respuesta = await axios.get(session_url, {
        });
        return respuesta;
    } catch (e) {
        console.log("Error");
    }
}

async function getDataReproductora(req){
    /// vieja luis
    // var session_url = 'http://localhost:3009/housingwaydetail/syncReproductora';
    // var session_url = 'http://localhost:3009/eggs_storage/syncReproductora';
    var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort +  "/synchronization/syncGetDateQuantityFramProductReproductora";
    
   
    try {
        respuesta = await axios.get(session_url, {
        });
        console.log("la respuesta");
        // console.log(respuesta)
        return respuesta;
    } catch (e) {
        console.log("Error");
    }
}

async function getDataIncubadora(req){
    // var session_url = 'http://localhost:3009/programmed_eggs/syncIncubadora';
    //var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, '') + ":" + req.connection.localPort + '/programmed_eggs/syncIncubadora';
    //var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, '') + ":" + req.connection.localPort + '/programmed_eggs/syncIncubadora';
    var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort + "/synchronization/syncGetAllDateQuantityFarmProductIncubator";

    try {
        respuesta = await axios.get(session_url, {
        });
        return respuesta;
    } catch (e) {
        console.log("Error");
    }
}

async function getDataEngorde(req){
    // var session_url = 'http://localhost:3009/broilerdetail/syncEngorde';
    //var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, '') + ":" + req.connection.localPort + '/broilerdetail/syncEngorde';
    var session_url = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort + "/synchronization/syncGetAllDateQuantityFarmProductBroiler";
    try {
        respuesta = await axios.get(session_url, {
        });
        return respuesta;
    } catch (e) {
        console.log("Error");
    }
}

async function sendToSap(JsonString, stage){
    var postDataToSAP =  async function(GlobalJson){
        // var passToFunction = GlobalJson;
        return new Promise(function(resolve, reject) {
            request({
                url: urlPostToSap,
                method: "POST",
                jar: j,
                headers: {
                    "Authorization": "Basic c29mb3Muam1tcDpoYzI0NDRfQkI=",
                    "Content-Type": "application/json;charset=utf-8",
                    "X-CSRF-Token": token, // set CSRF Token for post or update
                },
                json: {
                    "Data": JSON.stringify(GlobalJson)
                }
            }, async function (error, response, body) {
                console.log("el stage");
                console.log(stage);
                console.log("Datos de indicadores transferidos a SAP de forma exitosa");
                // console.log("response")
                // console.log(response);
                console.log("finalizo response");
                console.log("body");
                console.log(response.body);
                console.log("finalizo body");
                console.log("el stage");
                console.log(stage);
                console.log("message");
                let cadena = response.body.d.Message;
                console.log(response.body.d.Message);
                console.log("finalizo message");
                let vec = cadena.split("-");
                console.log("el vector");
                console.log(vec);
                let sumError = 0;
                let sep = [];
                for (var i = 0; i < vec.length-1; i++) {
                    let ca = vec[i];
                    let caa = ca.split("/");

                    if (caa[1] === "error") 
                    {
                        sumError++;
                    }
                    else{
                        sep.push({
                            id:caa[0],
                            message: caa[1]
                        });
                    }
                      
                      
                }
                console.log("el sep");
                console.log(sep);
                console.log("errores");
                console.log(sumError);
                console.log("satisfactorios");
                console.log(sep.length);

                switch(stage) {
                case 1:
                    console.log("case 1");
                    console.log("case 1");
                    for (var i = 0; i < sep.length; i++) {
                        console.log(sep[i].id);
                        console.log(sep[i].message);
                        DBbd.DBupdateSyncStatus(sep[i].id, sep[i].message);
                    }
                    break;
                case 2:
                    console.log("case 2");
                    console.log("case 2");
                    for (var i = 0; i < sep.length; i++) {
                        console.log(sep[i].id);
                        console.log(sep[i].message);
                        DBpe.DBupdateSyncStatus(sep[i].id, sep[i].message);
                            
                    }
                    break;
                case 3:
                    console.log("case 3");
                    console.log("case 3");
                    for (var i = 0; i < sep.length; i++) {
                        console.log(sep[i].id);
                        console.log(sep[i].message);
                        await DBhw.DBupdateSyncStatus(sep[i].id, sep[i].message);
                    }
                    break;
                case 5:
                    console.log("case 5");
                    console.log("case 5");
                    for (var i = 0; i < sep.length; i++) {
                        console.log(sep[i].id);
                        console.log(sep[i].message);
                        await DBhw.DBupdateSyncStatus(sep[i].id, sep[i].message);
                    }
                    break;
                }

                // console.log("body sendToSap")
                // console.log(body);
                resolve({
                    error: sumError,
                    satisfactorios: sep.length
                });
                //"Data" :  "[{\"HOUSINGWAY_DETAIL_ID\":45,\"HOUSING_WAY_ID\":46,\"SCHEDULED_DATE\":\"20180606\",\"SCHEDULED_QUANTITY\":4562,\"FARM_CODE\":\"1001\",\"PRODUCT_CODE\":\"30001\"}]"
            });
        });
    };
    return (await postDataToSAP(JsonString));
}

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

exports.findAllDateQuantityFarmProductReproductora = function(req, res) {
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

exports.findAllDateQuantityFarmProductIncubator = function(req, res) {
    DBlayer.DBfindAllDateQuantityFarmProductIncubator()
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

exports.findAllDateQuantityFarmProductBroiler = function(req, res) {
    DBlayer.DBfindAllDateQuantityFarmProductBroiler()
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


// ------------------------ Old ----------------------

/*
Funcion GET que devuelve todas las razas
*/
exports.synchronizationAllBreed = function(req, res) {


};

function returnOk(res){
    res.status(200).json({
        statusCode: 200,
        data: data
    });
}

function returnFail(res){
    res.status(500).send(err);
}