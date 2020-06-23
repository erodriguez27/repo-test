const DBlayer = require("../models/user_appControl");


/*
Funcion GET que devuelve todas las razas
*/
exports.findUserApps = function(req, res) {
    DBlayer.DBfindUserApps(req.body.user_id)
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

exports.addUserApp = function(req, res) {
    DBlayer.DBaddUserApp(req.body.user_app_id,req.body.user_id,req.body. App_id)
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

exports.deleteUserApp = function(req, res) {
    DBlayer.DBdeleteUserApp(req.body.user_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200
            });
        })
        .catch(function(err) {
            res.status(500).send(err);
        });
};