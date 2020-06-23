const DBlayer = require("../models/shed");
const utils = require("../../lib/utils");
const DBpartnership = require("../models/partnership");
const DBfarm = require("../models/farm");
const DBcenter = require("../models/center");
const DBshedStatus = require("../models/shedStatus");
const DBfarmType = require("../models/farmType");
const DBAdjustments = require("../models/adjustments");
const status_disponible = 1;
const status_ocupado = 2;
const status_vacio = 3;
const status_inhabiliado = 4;
const DBProcess = require("../models/process");
const DBincubator = require("../models/incubator");
var axios = require("axios");

formatterDate = function (dateopt) {

    let parts = dateopt.split('/')
    parseInt(parts[0]) < 10 ? parts[0] = "0" + parts[0] : parts[0]
    parseInt(parts[1]) < 9 ? parts[1] = "0" + parts[1] : parts[1]
    return (parts[0] + '/' + parts[1] + '/' + parts[2])

}

callOptimizer = async function (req, serverName) {
    try {
        let newDate = req.date.split("-")
        console.log(newDate)
        newDate = newDate[2] + '.' + newDate[1] + '.' + newDate[0]
        console.log(newDate)
        // let serverName = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort;
        console.log(serverName)
        var urlop = serverName + "/ave_simulator";
        let respuestaop = await axios.post(urlop, {
            "sAloj": 'Con alojamiento',
            "idScenario": parseInt(req.scenario_id),
            "fecha": newDate,
            "breed_id": parseInt(req.breed_id),
            "algoritmo": '2'
        });
        console.log("respuestaop")
        console.log(respuestaop.data)

        let ob = {
            statusCode: respuestaop.data.statusCode,
            records: [],
            message: 'Error'
        }
        if (respuestaop.data.statusCode === 200) {
            let dato = []
            ob.statusCode = 200
            if (respuestaop.data.data.demand.length > 0) {
                selectedDate = respuestaop.data.data.dates[0].split("/")
                var dates = new Date(selectedDate[2], selectedDate[1] - 1, selectedDate[0])
                dates.setDate(dates.getDate() - 7 * (respuestaop.data.data.lot_size.length - respuestaop.data.data.dates.length))
                var formatter = new Intl.NumberFormat('en-US');
                for (var i = 0; i < respuestaop.data.data.demand.length; i++) {
                    var tempdate = dates.getDate() + "/" + parseInt(dates.getMonth() + 1, 10) + "/" + dates.getFullYear();
                    tempdate = this.formatterDate(tempdate)
                    if ((respuestaop.data.data.lot_size[i] > 0) && ((respuestaop.data.data.lot_size[i]) - (respuestaop.data.data.isPrevios[i])) > 0) {
                        var temp = {
                            "datesCom": new Date(dates.getFullYear(), parseInt(dates.getMonth(), 10), dates.getDate()),
                            "date": tempdate,
                            "quantity": parseInt(respuestaop.data.data.lot_size[i] - respuestaop.data.data.isPrevios[i]),
                            "isPrevios": respuestaop.data.data.isPrevios[i]
                        };
                        dato.push(temp);
                    }
                    dates.setDate(dates.getDate() + 7);
                }
                console.log("optimizerData", dato);
                ob.records = dato
                ob.message = "Todo bien"
            }
            else {
                ob.statusCode = 201
                ob.records = []
                ob.message = "No hay solucion factible"
            }
        }
        // else {
        //     console.log("error != 200 llamada optimizador")
        //     ob.statusCode = respuestaop.data.statusCode
        //     ob.records = []
        //     ob.message = "Error"
        // }
        return ob
    } 
    catch (err) {
        console.log("catch");
        console.log(err);
        return ob = {
            statusCode: err.response.status,
            records: [],
            message: 'Error Optimizador'
        }
    }
}


callRecalculation = async function (req, serverName, dato) {
    try {
        let respuesta;
            var url = serverName + "/process/recalculateGoals";
            respuesta = await axios.post(url, {
                "breed_id": parseInt(req.breed_id),
                "scenario_id": parseInt(req.scenario_id),
                "records": dato
            });
        console.log("respuesta")
        console.log(respuesta.data)
        let ob = {
            statusCode: respuesta.data.statusCode,
            records: [],
            message: 'Error'
        }
        let result = []
        if (respuesta.data.statusCode === 200) {
            console.log("todo bien")
            let registro = respuesta.data.data
            switch (req.stage) {
                case 1:
                    // engorde 
                    for (let i = 0; i < registro.length; i++) {
                        if (registro[i].dayoldChick > 0) {
                            for (let j = 0; j < registro[i].records.length; j++) {
                                if (registro[i].records[j].dayoldChick > 0) {
                                    result.push({
                                        quantity: registro[i].records[j].dayoldChick,
                                        date: registro[i].records[j].date_
                                    })
                                }
                            }
                        }
                    }
                    break;
                case 2:
                    // incubadora
                    for (let i = 0; i < registro.length; i++) {
                        if (registro[i].fertEgg > 0) {
                            for (let j = 0; j < registro[i].records.length; j++) {
                                if (registro[i].records[j].fertEgg > 0) {
                                    result = result.concat(registro[i].records[j].fertEggRecords);
                                }
                            }
                        }
                    }
                    break;
                case 3:
                    // produccion 
                    for (let i = 0; i < registro.length; i++) {
                        if (registro[i].breeding > 0) {
                            for (let j = 0; j < registro[i].records.length; j++) {
                                if (registro[i].records[j].breeding > 0) {
                                    result.push({
                                        quantity: registro[i].records[j].breeding,
                                        date: registro[i].records[j].date_
                                    })
                                }
                            }
                        }
                    }
                    break;
                case 5:
                    // cria y levante 
                    for (let i = 0; i < registro.length; i++) {
                        if (registro[i].liftBreeding > 0) {
                            for (let j = 0; j < registro[i].records.length; j++) {
                                if (registro[i].records[j].liftBreeding > 0) {
                                    result.push({
                                        quantity: registro[i].records[j].liftBreeding,
                                        date: registro[i].records[j].date_
                                    })
                                }
                            }
                        }
                    }
                    break;
                default:
                    break;
            }
            console.log("result")
            console.log(result)
            ob.records = result
            ob.message = ob.message = "Todo bien"

        }
        // else {
        //     console.log("error != 200 llamada recalculation")
        // }
        return ob
    } 
    catch (err) {
        console.log("catch");
        console.log(err);
        return ob = {
            statusCode: err.response.status,
            records: [],
            message: 'Error Recalculation'
        }
    }
}


exports.automatedScheduling = async function (req, res) {
    console.log("llego al controlador de automatedScheduling")
    console.log("lo que recibe es:", req.body)
    
    try {
        let sCode,
            message,
            recordsRes = []
        let serverName = "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort;
        let opti = await this.callOptimizer(req.body, serverName)
        // console.log("opti")
        // console.log(opti)
        sCode = opti.statusCode
        message = opti.message
        if (opti.statusCode === 200 && opti.records.length > 0) {
            // console.log("entro en el if de opti")
            let recal = await this.callRecalculation(req.body, serverName, opti.records)
            // console.log("recal")
            // console.log(recal)
            sCode = recal.statusCode
            message = recal.message
            if (recal.statusCode === 200 && recal.records.length > 0) {
                // console.log("todo bien recal")
                let procesos = await DBProcess.DBfindProcessByStageBreed(req.body.stage, req.body.breed_id, req.body.scenario_id)
                // console.log("proceso")
                // console.log(procesos)
                let arra = recal.records
                let final = []
                let duracion = procesos[0].duration_goal
                if (req.body.stage === 2) {
                    let records = await DBincubator.DBautomatedScheduling();
                    let newRecords = [],
                        residuo = 0
                    for (let j = 0; j < arra.length; j++) {
                        newRecords = []
                        let qtty = arra[j].quantity + residuo
                        let day2 = new Date(arra[j].date).getDay() + 1
                        let weekDay = ''
                        switch (day2) {
                            case 0: weekDay = 'sunday'
                                break;
                            case 1: weekDay = 'monday'
                                break;
                            case 2: weekDay = 'tuesday'
                                break;
                            case 3: weekDay = 'wednesday'
                                break;
                            case 4: weekDay = 'thursday'
                                break;
                            case 5: weekDay = 'friday'
                                break;
                            case 6: weekDay = 'saturday'
                                break;
                            default:
                                break;
                        }
                        let i = 0
                        let fecha = new Date(arra[j].date);
                        fecha.setDate(fecha.getDate() + duracion);
                        let month = fecha.getMonth() + 1
                        let day = fecha.getDate() + 1
                        let ndate = fecha.getFullYear() + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2)
                        while (qtty > 0 && i < records.length) {
                            if (records[i][weekDay] === 1 && (records[i].date === null || records[i].date <= arra[j].date)) {
                                console.log("entro en if")
                                if (qtty > records[i].capacity) {
                                    records[i].usado = true
                                    records[i].date = ndate
                                    qtty = qtty - records[i].capacity
                                    newRecords.push({
                                        incubatorPlant: records[i].plant,
                                        incubator_id: records[i].incubator_id,
                                        incubator: records[i].name,
                                        code: records[i].code,
                                        date: arra[j].date,
                                        quantity: records[i].capacity,
                                        order: records[i]._order
                                    })
                                }
                            }
                            i++
                        }
                        if (qtty === 0) {
                            residuo = 0
                            final.push({
                                residuo: 0,
                                lista: newRecords,
                                date: arra[j].date,
                                quantity: arra[j].quantity
                            })
                        }
                        else {
                            residuo = qtty
                            final.push({
                                residuo: qtty,
                                lista: newRecords,
                                date: arra[j].date,
                                quantity: arra[j].quantity
                            })
                        }
                    }
                }
                else {
                    // SI VIENE EN ORDEN SE ELIMINA ESTO Y SE SACA EL ULTIMO DEL ARRAY
                    let dates = [];
                    arra.forEach(element => {
                        dates.push(new Date(element.date))
                    });
                    var maxDate = new Date(Math.max.apply(null, dates));
                    let month = maxDate.getMonth() + 1
                    let day = maxDate.getDate() + 1
                    let ndate = maxDate.getFullYear() + '-' + month + '-' + day
                    // HASTA AQUI

                    let records = await DBlayer.DBautomatedScheduling(req.body.farm_type, ndate, req.body.partnership_id);
                    console.log("records")
                    console.log(records)
                    let newRecords = []

                    for (let j = 0; j < arra.length; j++) {
                        console.log("entro con arra: ", arra[j])
                        newRecords = []
                        let qtty = arra[j].quantity
                        let i = 0
                        while (qtty > 0 && i < records.length && records[i].avaliable_date <= arra[j].date) {
                            console.log("entro en el while")
                            if (qtty >= records[i].minimo) {
                                let fecha = new Date(records[i].avaliable_date);
                                fecha.setDate(fecha.getDate() + records[i].rotation_days);
                                let month = fecha.getMonth() + 1
                                let day = fecha.getDate() + 1
                                let ndate = fecha.getFullYear() + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2)
                                records[i].avaliable_date = ndate
                                if (qtty <= records[i].maximo) {
                                    newRecords.push({
                                        shed_id: records[i].shed_id,
                                        farm: records[i].name,
                                        shed: records[i].shed,
                                        date: arra[j].date,
                                        quantity: qtty,
                                        maximo: records[i].maximo,
                                        minimo: records[i].minimo,
                                        rotation_days: records[i].rotation_days
                                    })
                                    qtty = 0
                                }
                                else {
                                    qtty = qtty - records[i].maximo
                                    newRecords.push({
                                        shed_id: records[i].shed_id,
                                        farm: records[i].name,
                                        shed: records[i].shed,
                                        date: arra[j].date,
                                        quantity: records[i].maximo,
                                        maximo: records[i].maximo,
                                        minimo: records[i].minimo
                                    })
                                }
                            }
                            i++;
                        }
                        if (qtty === 0) {
                            final.push({
                                residuo: 0,
                                lista: newRecords,
                                date: arra[j].date,
                                quantity: arra[j].quantity
                            })
                        }
                        else {
                            i = 0
                            while (qtty > 0 && i < newRecords.length) {
                                if (qtty <= newRecords[i].minimo) {
                                    newRecords[i].quantity += qtty
                                    qtty = 0
                                }
                                else {
                                    qtty = qtty - records[i].minimo
                                    newRecords[i].quantity += records[i].minimo
                                }
                                i++;
                            }
                            final.push({
                                residuo: qtty,
                                lista: newRecords,
                                date: arra[j].date,
                                quantity: arra[j].quantity
                            })
                        }
                    }
                }
                recordsRes = final
            }
        }
        res.status(sCode).json({
            statusCode: sCode,
            data: message,
            records: recordsRes,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

//  **** Inicio ConfTecnica ****


exports.findShedByCenter3 = async function (req, res) {
    await DBlayer.DBcheckUpdateStatusShed();
    DBlayer.DBfindShedByCenter3(req.body.center_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data,
                asd: "asd"
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};


exports.addShed = function (req, res) {

    DBlayer.DBaddShed(req.body.partnership_id, req.body.farm_id, req.body.center_id, req.body.code, req.body.status_id, req.body.stall_height, req.body.stall_width, req.body.capacity_min, req.body.capacity_max, req.body.rotation_days, req.body.os_disable, req.body.rehousing, req.body.order, new Date())

        .then(function (data) {
            console.log(data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

exports.updateShed = async function (req, res) {

    try {

        let username = "user";

        await DBlayer.DBupdateShed(req.body.shed_id, req.body.code, req.body.status_id, req.body.stall_height, req.body.stall_width, req.body.capacity_min, req.body.capacity_max, req.body.rotation_days, req.body.os_disable, req.body.rehousing, req.body.order)
        let f = new Date();
        let fecha = f.getFullYear() + "-" + (f.getMonth() + 1) + "-" + f.getDate();

        let data = await DBAdjustments.DBInsertOsAdjustmentsControl(username, fecha, "shed", req.body.shed_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        res.status(500).send(err);
    }
};


exports.deleteShed = function (req, res) {
    DBlayer.DBdeleteShed(req.body.shed_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Galpon Eliminado"
            });
        })
        .catch(function (err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

exports.isBeingUsed = function (req, res) {
    DBlayer.DBisBeingUsed(req.body.shed_id)
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
};
//  **** Fin ConfTecnica ****


exports.findAllShed = function (req, res) {

    DBlayer.DBfindAllShed()
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


exports.bulkAddShed2 = utils.wrap(async function (req, res) {
    const sheds = req.body.registers;
    const centers = await DBcenter.DbKnowCenterId2(sheds);
    const types = await DBfarmType.DbKnowFarmTypeShed2(sheds);
    const dbStatus = await DBshedStatus.DbKnowShedStatus2(sheds);
    const errors = [];

    for (const shed of sheds) {

        const centerMatch = centers.find(center =>
            shed.farmCode === center.farm_code &&
            shed.partnershipCode === center.partnership_code &&
            shed.centerCode === center.center_code
        );
        if (centerMatch !== undefined) {
            shed.farm_id = centerMatch.farm_id;
            shed.partnership_id = centerMatch.partnership_id;
            shed.center_id = centerMatch.center_id;
        } else {
            errors.push({
                object: shed,
                message: `la combinacion de empresa: ${shed.partnershipCode}, granja : ${shed.farmCode} y centro : ${shed.centerCode} no existe`
            });
        }



        const typeMatch = types.find(type => type.name === shed.type);
        if (typeMatch !== undefined) {
            shed.type_id = typeMatch.type_id;
        } else if (shed.type) {
            errors.push({
                object: shed,
                message: `el tipo de galpon : ${shed.type} no existe`
            });
        }

        const statusMatch = dbStatus.find(status => status.name === shed.statusShed);
        if (statusMatch !== undefined) {
            shed.statusshed_id = statusMatch.shed_status_id;
        } else {
            errors.push({
                object: shed,
                message: `el estatus : ${shed.statusShed} no existe`
            });
        }

        const duplicatedShed = centers.find(c =>
            c.partnership_code === shed.partnershipCode &&
            c.farm_code === shed.farmCode &&
            c.center_code === shed.centerCode &&
            c.shed_code === shed.code
        );
        if (duplicatedShed !== undefined) {
            errors.push({
                object: shed,
                message: `La combinacion de empresa: ${shed.partnershipCode}, granja: ${shed.farmCode}, nucleo: ${shed.centerCode} y galpon: ${shed.code} ya existe`
            });
        }

    }

    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }


    utils.cleanObjects(sheds);
    const result = await DBlayer.DBbulkAddShed(sheds);
    res.status(200).json({
        statusCode: 200,
        data: result
    });
});


exports.bulkAddShed = function (req, res) {
    let J = 0;
    let band = false;
    DBpartnership.DbKnowPartnership_id(req.body.registers).then(function (pa_id) {
        console.log("el body");
        for (let index = 0; index < req.body.registers.length; index++) {
            while (J < pa_id.length && !band) {
                if (req.body.registers[index].partnership_id == pa_id[J].code) {
                    req.body.registers[index].partnership_id = pa_id[J].partnership_id;
                    band = true;
                }
                J++;
            }
            band = false;
            J = 0;
        }
        band = false;
        J = 0;
        DBfarm.DbKnowFarmId(req.body.registers).then(function (farm_id) {
            for (let index = 0; index < req.body.registers.length; index++) {
                while (J < farm_id.length && !band) {
                    if (req.body.registers[index].farm_id == farm_id[J].code) {
                        req.body.registers[index].farm_id = farm_id[J].farm_id;
                        band = true;
                    }
                    J++;
                }
                band = false;
                J = 0;
            }
            band = false;
            J = 0;
            DBcenter.DbKnowCenterId(req.body.registers).then(function (center_id) {
                for (let index = 0; index < req.body.registers.length; index++) {
                    while (J < center_id.length && !band) {
                        if (req.body.registers[index].center_id == center_id[J].code &&
                            req.body.registers[index].partnership_id == center_id[J].partnership_id &&
                            req.body.registers[index].farm_id == center_id[J].farm_id) {
                            req.body.registers[index].center_id = center_id[J].center_id;
                            band = true;
                        }

                        J++;
                    }
                    if (!band) {

                        console.log("No hubo coincidencia");
                        console.log(`farm : ${req.body.registers[index].farm_id}
                           center : ${req.body.registers[index].center_id}
                           code : ${req.body.registers[index].code}`);
                        req.body.registers.splice(index, 1);
                    }

                    band = false;
                    J = 0;
                }
                band = false;
                J = 0;
                console.log("victor llego hasta aqui ");
                DBfarmType.DbKnowFarmTypeShed(req.body.registers).then(function (type_id) {
                    for (let index = 0; index < req.body.registers.length; index++) {
                        while (J < type_id.length && !band) {
                            if (req.body.registers[index].type_id == type_id[J].name) {
                                req.body.registers[index].type_id = type_id[J].farm_type_id;
                                band = true;
                            }
                            J++;
                        }
                        band = false;
                        J = 0;
                    }
                    band = false;
                    J = 0;
                    DBshedStatus.DbKnowShedStatus(req.body.registers).then(function (shedStatus) {
                        for (let index = 0; index < req.body.registers.length; index++) {
                            while (J < shedStatus.length && !band) {
                                if (req.body.registers[index].statusshed_id == shedStatus[J].name) {
                                    req.body.registers[index].statusshed_id = shedStatus[J].shed_status_id;
                                    band = true;
                                }
                                J++;
                            }
                            band = false;
                            J = 0;
                        }
                        let sheds = req.body.registers;
                        utils.cleanObjects(sheds);
                        console.log("adriana se quedo aqui");
                        DBlayer.DBbulkAddShed(sheds).then(function (data) {
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
                });
            }).catch(function (err) {
                console.log(err);
                res.status(500).send(err);
            });
        }).catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    });
};

exports.findShedByCenter = async function (req, res) {
    // console.log("llegue");
    await DBlayer.DBcheckUpdateStatusShed();
    DBlayer.DBfindShedByCenter(req.body.center_id)
        .then(function (data) {
            console.log("data sheds", data);
            res.status(200).json({
                statusCode: 200,
                data: data,
                asd: "asd"
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};
exports.findShedByCenter2 = async function (req, res) {
    console.log("llegue");
    console.log(req.body);
    await DBlayer.DBcheckUpdateStatusShed();
    DBlayer.DBfindShedByCenter2(req.body.center_id)
        .then(function (data) {
            console.log("data sheds", data);
            res.status(200).json({
                statusCode: 200,
                data: data,
                asd: "asd"
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};


exports.findShedsByPartnership = function (req, res) {
    // console.log("llegue");
    DBlayer.DBfindShedsByPartnership(req.body.partnership_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            // console.log(err);
            res.status(500).send(err);
        });
};
exports.findShedsByPartnership2 = function (req, res) {
    // console.log("llegue");
    DBlayer.DBfindShedsByPartnership2(req.body.partnership_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            // console.log(err);
            res.status(500).send(err);
        });
};


exports.updateRehousingShed = function (req, res) {

    DBlayer.DBupdateRehousingShed(req.body.shed_id, req.body.rehousing)

        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            console.log("error en updateRehousingShed::::: ", err);
            res.status(500).send(err);
        });
};

exports.updateRotationDays = function (req, res) {

    const records = req.body.data;
    const dataLength = records.length;

    try {
        for (let i = 0; i < dataLength; i++) {
            // console.log(records[i].shed_name);
            let uRD = DBlayer.DBupdateRotationDays(records[i].shed_id, records[i].rotation_days, records[i].capacity_theoretical);
        }
        res.status(200).json({
            statusCode: 200,
            mgs: "Galpon Actualizado"
        });

    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.findShedsByFarms = async function (req, res) {
    try {
        await DBlayer.DBcheckUpdateStatusShed();
        let data = await DBlayer.DBfindShedsByFarms(req.body.farms);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
exports.findShedsByFarms2 = async function (req, res) {
    try {
        await DBlayer.DBcheckUpdateStatusShed();
        let data = await DBlayer.DBfindShedsByFarms2(req.body.farms);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.findShedsByFarm = async function (req, res) {
    try {
        await DBlayer.DBcheckUpdateStatusShed();
        let data = await DBlayer.DBfindShedsByFarm(req.body.farm_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
exports.findShedsByFarm2 = async function (req, res) {
    try {
        await DBlayer.DBcheckUpdateStatusShed();
        let data = await DBlayer.DBfindShedsByFarm2(req.body.farm_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.findShedsByFarmForReprod = async function (req, res) {
    try {
        // let data = await DBlayer.DBcheckUpdateStatusShedForReprod(req.body.farm_id);
        await DBlayer.DBcheckUpdateStatusShed();
        data = await DBlayer.DBfindShedsByFarm(req.body.farm_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};
exports.findShedsByCenterForReprod = async function (req, res) {
    try {
        // let data = await DBlayer.DBcheckUpdateStatusShedForReprodByCenter(req.body.center_id);
        await DBlayer.DBcheckUpdateStatusShed();
        // data = await DBlayer.DBfindShedByCenter(req.body.center_id);
        data = await DBlayer.DBfindShedByCenter2(req.body.center_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};

exports.updateShedOrder = function (req, res) {
    DBlayer.DBupdateShedOrder(req.body.data)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};
