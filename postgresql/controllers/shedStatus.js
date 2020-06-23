const DBlayer = require("../models/shedStatus");


/*
Funcion GET que devuelve todas los estatus
*/
exports.findAllShedStatus = function(req, res) {

    DBlayer.DBfindAllShedStatus()
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
