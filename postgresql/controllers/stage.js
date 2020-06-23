const DBlayer = require("../models/stage");


/*
Funcion GET que devuelve todos los stage
*/
exports.findAllStage = function(req, res) {

    DBlayer.DBfindAllStage()
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

exports.addStage = function(req, res) {
    DBlayer.DBaddStage(req.body.order_, req.body.name)
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

exports.updateStage = function(req, res) {
    DBlayer.DBupdateStage(req.body.order_, req.body.name, req.body.stage_id)
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


exports.deleteStage = function(req, res) {
    DBlayer.DBdeleteStage(req.body.stage_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Etapa Eliminada"
            });
        })
        .catch(function(err) {
        //   console.log(err);
            res.status(500).send(err);
        });
};
