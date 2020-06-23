const DBlayer = require("../models/warehouse");
const utils = require("../../lib/utils");
const DBpartnership = require("../models/partnership");
const DBfarm = require("../models/farm");

exports.findAllWarehouse = function(req, res) {

    DBlayer.DBfindAllWarehouse()
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

exports.bulkAddWarehouse2 = utils.wrap(async function (req, res) {
    const warehouses = req.body.registers;
    const farms = await DBfarm.DbKnowFarmId2(warehouses);
    const errors = [];

    for (const warehouse of warehouses) {
        const farmMatch = farms.find(farm => warehouse.farmCode === farm.farm_code && warehouse.partnershipCode === farm.partnership_code);
        if (farmMatch !== undefined) {
            warehouse.farm_id = farmMatch.farm_id;
            warehouse.partnership_id = farmMatch.partnership_id;
        }
        else {
            errors.push({object: warehouse, message: `la combinacion de empresa: ${warehouse.partnershipCode} y granja : ${warehouse.farmCode} no existe`});
        }
    }
    
    if (errors.length > 0) {
        throw new Error(errors[0].message);
    }

    const result = await DBlayer.DBbulkAddWarehouse(warehouses);
    res.status(200).json({
        statusCode: 200,
        data: result
    });
});

exports.bulkAddWarehouse = function (req, res) {
    let J = 0;
    let band = false;
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
            let warehouses = req.body.registers;
            utils.cleanObjects(warehouses);
            DBlayer.DBbulkAddWarehouse(warehouses).then(function (data) {
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
        console.log(err);
        res.status(500).send(err);
    });
};

exports.addWarehouse = function(req, res) {

    DBlayer.DBaddWarehouse(req.body.partnership_id, req.body.farm_id, req.body.name, req.body.code)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};

exports.findWarehouseByFarm = function(req, res) {
//   console.log('Aqui: '+req.body.farm_id);
    DBlayer.DBfindWarehouseByFarm(req.body.farm_id)
        .then(function(data) {
        //   console.log(data);
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

exports.updateWarehouse = function(req, res) {
    console.log("lo del controlador");
    console.log(req.body);
    // console.log('PUT client_id: '+req.body.client_id);
    DBlayer.DBupdateWarehouse(req.body.partnership_id, req.body.farm_id, req.body.warehouse_id, req.body.name, req.body.code)
        .then(function(data) {
        //   console.log('actualizado', data);
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};


exports.deleteWarehouse = function(req, res) {
    DBlayer.DBdeleteWarehouse(req.body.warehouse_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Almacen Eliminado"
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};
