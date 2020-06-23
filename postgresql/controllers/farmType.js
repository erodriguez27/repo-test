const DBlayer = require("../models/farmType");

exports.findAllFarmType = function(req, res) {

    DBlayer.DBfindAllFarmType()
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
