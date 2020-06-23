const DBlayer = require("../models/brooderMachine");


exports.findMachineByPartnership = function(req, res) {

    DBlayer.DBfindMachineByPartnership(req.body.partnership_id)
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

exports.addBrooderMachine = async function(req, res) {
    console.log("llegue: ",req.body);

    try {
        let records = await DBlayer.DBaddBrooderMachine(req.body.partnership_id, parseInt(req.body.farm_id), req.body.machine_name,parseInt(req.body.capacity), req.body.sunday,req.body.monday,req.body.tuesday,req.body.wednesday,req.body.thursday,req.body.friday,req.body.saturday);
        let data = await DBlayer.DBfindMachineByPartnership(req.body.partnership_id);
        res.status(200).send({statusCode: 200, data: data});
    } catch (err) {
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
};

/*
exports.updateBreed = function(req, res) {
  console.log(req.body.breed_id+' '+req.body.code+' '+req.body.type);
    DBlayer.DBupdateBreed(req.body.breed_id, req.body.code, req.body.name)
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
};*/
