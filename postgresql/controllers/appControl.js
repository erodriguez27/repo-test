const DBlayer = require("../models/appControl");


/*
Funcion GET que devuelve todas las razas
*/
exports.findApp = function(req, res) {
    console.log("qloq3");
    DBlayer.DBfindApp(req.body.app_id)
        .then(function(data) {
            console.log("qloq4");
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};

exports.addApp = function(req, res) {
    console.log("llegue: "+ req);
    DBlayer.DBaddApp(req.body.App_id, req.body.App_name)
        .then(function(data) {
            console.log(data);
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

exports.updateApp = function(req, res) {
    console.log(req.body.breed_id+" "+req.body.code+" "+req.body.type);
    DBlayer.DBupdateApp(req.body.App_id, req.body.App_name)
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



exports.deleteApp = function(req, res) {
    DBlayer.DBdeleteApp(req.body.user)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Applicación "+req.body.App_name+" Eliminada"
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};