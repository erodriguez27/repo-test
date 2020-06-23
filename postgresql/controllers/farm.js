const DBlayer = require("../models/farm");
const fetch = require("node-fetch");
const https = require("https");
const utils = require("../../lib/utils");
const DBfarmType = require("../models/farmType");
const DBpartnership = require("../models/partnership");

const partnership = require("../models/partnership");
const warehouse = require("../models/warehouse");
const center = require("../models/center");
const shed = require("../models/shed");
const incubatorplant = require("../models/incubatorPlant");
const incubator = require("../models/incubator");
/*function cleanObjects(array) {
  array.forEach(x => {
    for(let key in x) {
      if (x[key] === "") {
         x[key] = null;
      }
    }
  })
}*/

//  **** Inicio ConfTecnica ****

/**
 * @method findAllFarm
 * @description Función GET que devuelve todos las empresas
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findAllFarm = function (req, res) {

    DBlayer.DBfindAllFarm()
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

/**
 * @method findFarmByPartnetship
 * @description Petición POST, para recibe de la vista la selección de empresa y devuelve las granja y los tipos de granja
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.findFarmByPartnetship = function (req, res) {
    DBlayer.DBfindFarmByPartnetship(req.body.partnership_id).then(function (data1) {
        DBlayer.DBfindFarmByPartnetshipTypes(req.body.partnership_id).then(function (tipos) {
            res.status(200).json({
                statusCode: 200,
                data: data1,
                types: tipos
            });
        }).catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * @method addFarm
 * @description Petición POST que reciba la data de la vista y la envía a la función DBaddFarm del modelo farm para agregar un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.addFarm = function (req, res) {
    DBlayer.DBaddFarm(req.body.partnership_id, req.body.code, req.body.name, req.body.farm_type_id, req.body.order, req.body.os_disable)
        .then(function (data) {
            console.log("Hasta aqui 200");
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

/**
 * @method updateFarm
 * @description Petición PUT que reciba la data de la vista y la envía a la función DBupdateFarm del modelo farm para ser actualizar la información de un registro
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.updateFarm = function (req, res) {
    DBlayer.DBupdateFarm(req.body.farm_id, req.body.name, req.body.code, req.body.farm_type_id, req.body.os_disable, req.body.order)
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

/**
 * @method deleteFarm
 * @description Petición DELETE recibe de la vista el id de un registro específico y lo envía a la función DBdeleteFarm del modelo farm para ser eliminado
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.deleteFarm = function (req, res) {
    DBlayer.DBdeleteFarm(req.body.farm_id)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Granja Eliminada"
            });
        })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

/**
 * @method isBeingUsed
 * @description Petición POST, recibe de la vista el id de la empresa y llama a la función DBisBeingUsed del modelo farm oara verificar si esta siendo usada
 *
 * @param {Object} req información sobre la solicitud HTTP
 * @param {Object} res devolver la respuesta HTTP
 */
exports.isBeingUsed = function(req, res) {
    DBlayer.DBisBeingUsed(req.body.farm_id)
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



//  **** Fin ConfTecnica ****


exports.erp = async function (req, res) {

    try {
    //let data  = await DBlayer.DBfindFarmByPartAndStatus(req.body.partnership_id,req.body.status_id);

        var options = {
            hostname: "appsdev.cmi.co",
            path: "/sap/bc/lrep/flex/data/ZWM_CONFTRANS.Component?sap-client=200",
            method: "GET",
            auth: "XCONSAREVALO:Sofos.001",
        };
        var bodyChunks = [];
        let str = "";
        var req2 = https.request(options, (res2) => {

            //console.log("d: ", res2);
            res2.on("data", (d) => {
                //process.stdout.write(d);
                //bodyChunks.push(d);
                str += d;
            });

            res2.on("error", (e) => {
                console.error(e);
            });
            res2.on("end", function (data) {
                console.log("End");
                console.log(" D: " + str);
                res.status(200).json({
                    statusCode: 200,
                    data: str
                });
            });

        });

        /*res.status(200).json({
        statusCode: 200,
        data: bodyChunks
    });*/
        req2.end();

        /*fetch('https://appsdev.cmi.co/sap/bc/lrep/flex/data/ZWM_CONFTRANS.Component?sap-client=200', {
          method: 'GET',
          headers: {
            'Authorization': 'Basic  WENPTlNBUkVWQUxPOlNvZm9zLjAwMQ=='
          }
        })
        .then(
          function(response) {
            if (response.status !== 200) {
              console.log('Looks like there was a problem. Status Code: ' +
                response.status);
              return;
            }

            response.json().then(function(res2) {
              console.log(res2);
              resolve(res2);


                  res.status(200).json({
                      statusCode: 200,
                      data: res2
                  });

            });
          }
        ).catch(function(err) {
          console.log('Fetch Error :-S', err);
        });*/



    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }

};


exports.bulkAddFarm2 = utils.wrap(async function(req, res) {
    const farms = req.body.registers;
    const errors = [];

    const typeOfFarms = await DBfarmType.DbKnowFarmType2(req.body.registers);
    const partnerships = await DBpartnership.DbKnowPartnership_id2(req.body.registers);
    console.log(partnerships);
    for (const farm of farms) {

        const typeOfFarmMatch = typeOfFarms.find(typeOfFarm => typeOfFarm.name === farm.typeOfFarm);
        if (typeOfFarmMatch !== undefined) {
            farm.farm_type_id = typeOfFarmMatch.farm_type_id;
        }
        else {
            errors.push({object: farm, message: `Tipo de graja: ${farm.typeOfFarm} no existe`});
        }

        const partnershipMatch = partnerships.find(partnership => partnership.code === farm.partnershipCode);
        if (partnershipMatch !== undefined) {
            farm.partnership_id = partnershipMatch.partnership_id;
            console.log(farm);
        }
        else {
            errors.push({object: farm, message: `La empresa con el codigo: ${farm.partnershipCode} no existe`});
        }

        const duplicatedFarm = partnerships.find(p => p.code === farm.partnershipCode && p.farm_code === farm.code);
        if (duplicatedFarm !== undefined) {
            errors.push({object: farm, message: `La combinacion de empresa: ${farm.partnershipCode} y granja: ${farm.code} ya existe`});
        }
    }

    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }

    const result = await DBlayer.DBbulkAddCenter(farms);
    res.status(200).json({
        statusCode: 200,
        data: result
    });

});

exports.bulkAddFarm = function (req, res) {
    let J = 0;
    let band = false;
    //console.log(req.body.registers);
    DBfarmType.DbKnowFarmType(req.body.registers).then(function (typefarm) {
        for (let index = 0; index < req.body.registers.length; index++) {
            while (J < typefarm.length && !band) {
                if (req.body.registers[index].farm_type_id == typefarm[J].name) {
                    req.body.registers[index].farm_type_id = typefarm[J].farm_type_id;
                    band = true;
                }
                J++;
            }
            band = false;
            J = 0;
        }
        band = false;
        J = 0;
        index = 0;
        DBpartnership.DbKnowPartnership_id(req.body.registers).then(function (pa_id) {
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
            let farms = req.body.registers;
            utils.cleanObjects(farms);
            DBlayer.DBbulkAddCenter(farms).then(function (data) {
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
    }).catch(function (err) {
        res.status(500).send(err);
    });

};


exports.findFarmByPartnetship2 = function (req, res) {
    console.log(req.body.partnership_id);
    DBlayer.DBfindFarmByPartnetship2(req.body.partnership_id).then(function (data1) {
        DBlayer.DBfindFarmByPartnetshipTypes(req.body.partnership_id).then(function (tipos) {
            res.status(200).json({
                statusCode: 200,
                data: data1,
                types: tipos
            });
        }).catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
    })
        .catch(function (err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.findShedByFarm = function (req, res) {
    DBlayer.DBfindShedByFarm(req.body.farm_id)
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

exports.findFarmByPartAndStatus = async function (req, res) {
    console.log(req.body.partnership_id, req.body.status_id);
    try {
        let data = await DBlayer.DBfindFarmByPartAndStatus(req.body.partnership_id, req.body.status_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
exports.findFarmByPartAndStatus2 = async function (req, res) {
    console.log(req.body.partnership_id, req.body.status_id);
    try {
        let data = await DBlayer.DBfindFarmByPartAndStatus2(req.body.partnership_id, req.body.status_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findIdByCode = async function (req, res) {
    console.log(req.body.partnership_id, req.body.status_id);
    try {
        let data = await DBlayer.DBfindIdByCode(req.body.farm_code);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findPartnershipIdByCode = async function (req, res) {
    // console.log(req.body.partnership_id, req.body.status_id);
    try {
        let data = await DBlayer.DBfindPartnershipIdByCode(req.body.farm_code);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.encontramosAlgo = function (req, res) {

    console.log(req.body.contenedorSelecter);

    if (req.body.contenedorSelecter == "osfarm") {
        partnership.DBfindSomething().then(function (empresa) {
            if (empresa.length > 0) {
                res.status(201).json({
                    statusCode: 201,
                    empresa: empresa
                });
            } else {
                res.status(401).send(empresa);
            }
        });
    } else {
        if (req.body.contenedorSelecter == "oscenter") {
            partnership.DBfindSomething().then(function (empresa) {
                if (empresa.length > 0) {
                    DBlayer.DBfindSomething().then(function (farm) {
                        if (farm.length > 0) {
                            res.status(202).json({
                                statusCode: 202,
                                farm: farm
                            });
                        } else {
                            res.status(402).send(farm);
                        }
                    });
                } else {
                    res.status(401).send(empresa);
                }
            });
        } else {
            if (req.body.contenedorSelecter == "oswarehouse") {
                partnership.DBfindSomething().then(function (empresa) {
                    if (empresa.length > 0) {
                        DBlayer.DBfindSomething().then(function (farm) {
                            if (farm.length > 0) {
                                center.DBfindSomething().then(function (center) {
                                    if (farm.length > 0) {
                                        res.status(203).json({
                                            statusCode: 203,
                                            center: center
                                        });
                                    } else {
                                        res.status(403).send(center);
                                    }
                                });
                            } else {
                                res.status(402).send(farm);
                            }
                        });
                    } else {
                        res.status(401).send(empresa);
                    }
                });
            } else {
                if (req.body.contenedorSelecter == "osshed") {
                    partnership.DBfindSomething().then(function (empresa) {
                        if (empresa.length > 0) {
                            DBlayer.DBfindSomething().then(function (farm) {
                                if (farm.length > 0) {
                                    center.DBfindSomething().then(function (center) {
                                        if (center.length > 0) {
                                            warehouse.DBfindSomething().then(function (warehouse) {
                                                if (warehouse.length > 0) {
                                                    res.status(204).json({
                                                        statusCode: 204,
                                                        warehouse: warehouse
                                                    });
                                                } else {
                                                    res.status(404).send(warehouse);
                                                }
                                            });
                                        } else {
                                            res.status(403).send(center);
                                        }
                                    });
                                } else {
                                    res.status(402).send(farm);
                                }
                            });
                        } else {
                            res.status(401).send(empresa);
                        }
                    });
                } else {
                    if (req.body.contenedorSelecter == "osincubatorplant") {
                        partnership.DBfindSomething().then(function (empresa) {
                            if (empresa.length > 0) {
                                // DBlayer.DBfindSomething().then(function (farm) {
                                // if (farm.length > 0) {
                                //   center.DBfindSomething().then(function (center) {
                                //     if (center.length > 0) {
                                //       warehouse.DBfindSomething().then(function (warehouse) {
                                //         if (warehouse.length > 0) {
                                // shed.DBfindSomething().then(function (shed) {
                                // if (shed.length > 0) {
                                res.status(205).json({
                                    statusCode: 205,
                                    warehouse: warehouse
                                });
                                // } else {
                                // res.status(405).send(shed);
                                // }
                                //             });
                                //           } else {
                                //             res.status(404).send(warehouse);
                                //           }
                                //         });
                                //       } else {
                                //         res.status(403).send(center);
                                //       }
                                //     })
                                //   } else {
                                //     res.status(402).send(farm);
                                //   }
                                // })
                            } else {
                                res.status(401).send(empresa);
                            }
                        });
                    } else {
                        if (req.body.contenedorSelecter == "osincubator") {
                            // partnership.DBfindSomething().then(function (empresa) {
                            //   if (empresa.length > 0) {
                            //     DBlayer.DBfindSomething().then(function (farm) {
                            //       if (farm.length > 0) {
                            //         center.DBfindSomething().then(function (center) {
                            //           if (center.length > 0) {
                            //             warehouse.DBfindSomething().then(function (warehouse) {
                            //               if (warehouse.length > 0) {
                            //                 shed.DBfindSomething().then(function (shed) {
                            //                   if (shed.length > 0) {
                            incubatorplant.DBfindSomething().then(function (incubatorplant) {
                                if (incubatorplant.length > 0) {
                                    res.status(206).json({
                                        statusCode: 206,
                                        incubatorplant: incubatorplant
                                    });
                                } else {
                                    res.status(406).send(incubatorplant);
                                }
                            });
                            //                   } else {
                            //                     res.status(405).send(shed);
                            //                   }
                            //                 });
                            //               } else {
                            //                 res.status(404).send(warehouse);
                            //               }
                            //             });
                            //           } else {
                            //             res.status(403).send(center);
                            //           }
                            //         })
                            //       } else {
                            //         res.status(402).send(farm);
                            //       }
                            //     })
                            //   } else {
                            //     res.status(401).send(empresa);
                            //   }
                            // })
                        } else {
                            if (req.body.contenedorSelecter == "ospartnership") {
                                res.status(208).json({
                                    statusCode: 208
                                });
                            }
                        }
                    }
                }
            }
        }
    }
};

exports.updateFarmOrder = function (req, res) {
    DBlayer.DBupdateFarmOrder(req.body.data)
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
