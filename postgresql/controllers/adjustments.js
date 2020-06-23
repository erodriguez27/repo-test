const DBlayer = require("../models/adjustments");
const DBhousingWayDetail = require("../models/housingWayDetail");
const DBbroilerDetail = require("../models/broilerDetail");
const DBcoldRoom = require("../models/coldRoom");
const DB_housingWay = require("../models/housingWay");
const DB_postureCurve = require("../models/postureCurve");
const BD_scenarioPostureCurve = require("../models/scenarioPostureCurve");
const DB_eggsPlanning = require("../models/eggsPlanning");
const DB_shed = require("../models/shed");

const status_vacio= 3;



//BUSQUEDA DE INFORMACION DE LEVANTE Y CRIA Y PRODUCCION
exports.findLiftBreedingAndBreedingByLot = function(req, res) {
    DBhousingWayDetail.DBfindLiftBreedingAndBreedingByLot(req.body.lot)
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

//BUSQUEDA DE INFORMACION DE ALMACEN DE HUEVO FERTIL
exports.findColdRoomByLot = function(req, res) {
    DBcoldRoom.DBfindColdRoomByLot(req.body.lot)
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

//BUSQUEDA DE INFORMACION DE ENGORDE
exports.findBroilerByLot = function(req, res) {
    DBbroilerDetail.DBfindBroilerByLot(req.body.lot)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            console.log(err)
            res.status(500).send(err);
        });
};


exports.updateHousingWayDetailExecutionQuantityByLot = async function(req, res) {
    try {
        if(req.isAuthenticated()){
            let user = req.user,
                username = user[0].username;

            // await DBhousingWayDetail.DBInsertAdjustmentsControl(req.body.lot, req.body.execution_quantity)
            await DBhousingWayDetail.DBupdateHousingWayDetailExecutionQuantityByLot(req.body.execution_quantity, req.body.lot)
            
            let f = new Date();
            let fecha = f.getFullYear() + "-" + (f.getMonth() +1) + "-" + f.getDate()

            await DBlayer.DBInsertAdjustmentsControl(username, fecha, req.body.lot, "ajuste")

            res.status(200).json({
                statusCode: 200
            });
        }
    } catch (e) {
        console.log("Error e.message");
        console.log(e)
        res.status(500).json({
            statusCode: 500
        });
    }
};

exports.updateBroilerDetailExecutionQuantityByLot = async function(req, res) {
    try {
        if(req.isAuthenticated()){
            let user = req.user,
                username = user[0].username;

            await DBbroilerDetail.DBupdateBroilerDetailExecutionQuantityByLot( req.body.execution_quantity,req.body.lot)

            let f = new Date();
            let fecha = f.getFullYear() + "-" + (f.getMonth() +1) + "-" + f.getDate()

            await DBlayer.DBInsertAdjustmentsControl(username, fecha, req.body.lot, "ajuste")

            res.status(200).json({
                statusCode: 200
            });
        }
    } catch (e) {
        console.log("Error e.message");
        console.log(e)
        res.status(500).json({
            statusCode: 500
        });
    }
};


exports.updateColdRoomAdjustmentsByLot = async function(req, res) {
    try {
        if(req.isAuthenticated()){
            let user = req.user,
                username = user[0].username;

            await DBcoldRoom.updateColdRoomAdjustmentsByLot(req.body.fecha_movements, req.body.lot, req.body.cant, req.body.state, req.body.eggs_storage_id, req.body.descrip)

            let f = new Date();
            let fecha = f.getFullYear() + "-" + (f.getMonth() +1) + "-" + f.getDate()

            await DBlayer.DBInsertAdjustmentsControl(username, fecha, req.body.lot, "ajuste")

            res.status(200).json({
                statusCode: 200
            });
        }
    } catch (e) {
        console.log("Error e.message");
        console.log(e)
        res.status(500).json({
            statusCode: 500
        });
    }
};

//BUSQUEDA DE AJUSTES REALIZADOS A UN LOTE
exports.findAdjustmentsByLot = function(req, res) {
    console.log(req.body.lot)
    DBlayer.DBfindAdjustmentsByLot(req.body.lot)
        .then(function(data) {
            console.log(data)
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

// Aqui empiezo con lo de los desalojos forzosos, en teoria, serán solo dos funciones

//Busqueda de lote para desalojos forzosos
exports.findLotData =  async function (req, res) {
    console.log("el body de la request:::: ", req.body);

    try {
        // if (req.isAuthenticated()) {

            let stage = req.body.stage,
                lot = req.body.lot,
                scenario_id = req.body.scenario_id,
                data = [];

            if ((stage != undefined && stage != null) && (lot != undefined && lot != null) && (scenario_id != undefined && scenario_id != null)) {

                switch (stage) {
                    case 'C':
                        data = await DBlayer.DBFindLiftBreadingProductionLotData(stage+lot, scenario_id);
                        break;
                    case 'P':
                        data = await DBlayer.DBFindLiftBreadingProductionLotData(stage+lot, scenario_id);
                        break;
                    case 'D':
                        data = await DBlayer.DBFindBroilerEvictionLotData('E'+lot, scenario_id);
                        break;

                    case 'E':
                        data = await DBlayer.DBFindBroilerLotData(stage+lot, scenario_id);
                        break;
                }

                res.status(200).json({
                    statusCode: 200,
                    data: data
                });

            } else {
                res.status(204).json({
                    statusCode: 204,
                    error_msg: "Error no se recibió data en la solicitud"
                });
            }

        // } else {
        //     res.status(511).json({
        //         statusCode: 511,
        //         msg: "Debe estar loggeado para realizar esta acción"
        //     });

        // }
    } catch (e) {
        console.log("Error e.message");
        console.log(e)
        res.status(500).json({
            statusCode: 500
        });
    }
};

exports.updateEvictionedStage = async function(req, res) {
    console.log("el body de la request:::: ", req.body);
    
    try {
        if(req.isAuthenticated()){
            
            let user = req.user,
                username = user[0].username,
                stage = req.body.stage,
                id = req.body.id,
                lot = req.body.lot;

            if((stage != undefined && stage!=null) || (lot != undefined && lot!=null)){
                let f = new Date(),
                    fecha = f.getFullYear() + "-" + (f.getMonth() +1) + "-" + f.getDate(),
                    eviction_date = req.body.eviction_date,
                    aDate = eviction_date.split("-"),
                    EvDate = new Date(aDate[0], aDate[1]-1, aDate[2]);

                switch (stage) {
                    case 'C':
                        await DBlayer.DBupdateEvictionedProgrammed("txhousingway_detail", "housingway_detail_id", id);
                        await DBlayer.DBupdateEvictionedProjected("txhousingway", "predecessor_id", id);

                        break;
                        case 'P':
                            let wp = parseInt(lot.substr(1)),
                                lot_h = (wp<100)? ( (wp<10)?'H00'+wp:'H0'+wp ):'H'+wp;
                            console.log(lot_h);
                            await DBlayer.DBupdateEvictionedProgrammed("txhousingway_detail", "housingway_detail_id", id);
                            await DBlayer.DBupdateEvictionedProjectedCurve(eviction_date, lot_h);
                        break;
                    case 'D':
                        await DBlayer.DBupdateEvictionedProgrammed("txbroilereviction_detail", "broilereviction_detail_id", id);
                        
                        break;
                        
                        case 'E':
                        await DBlayer.DBupdateEvictionedProgrammed("txbroiler_detail", "broiler_detail_id", id);
                        await DBlayer.DBupdateEvictionedProjected("txbroilereviction", "broiler_detail_id", id);

                        break;
                }

                let shed_id = req.body.shed_id,
                            shed = await await DB_shed.DBupdateStatusShed(shed_id, status_vacio),
                            newEvDate =  addDays(EvDate,shed[0].rotation_days);

                await DB_shed.DBupdateAvaliableDateShed(shed_id, newEvDate);
                await DBlayer.DBInsertAdjustmentsControl(username, fecha, lot, "desalojo");

                res.status(200).json({
                    statusCode: 200
                });

            }else{
                res.status(204).json({
                    statusCode: 204,
                    error_msg: "Error no se recibió data en la solicitud"
                });
            }
                
            }else{
                res.status(511).json({
                    statusCode: 511
                });

            }
        } catch (e) {
            console.log("Error e.message");
            console.log(e)
            res.status(500).json({
                statusCode: 500
            });
        }
};

function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}
