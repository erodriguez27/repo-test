const DBlayer = require("../models/silo");

exports.findAllSilo = function(req, res) {

    DBlayer.DBfindAllSilo()
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


exports.findSiloByCenter = function(req, res) {
    // console.log("Center: "+req.body.center_id);
    DBlayer.DBfindSiloByCenter(req.body.center_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};


exports.addSilo = function(req, res) {
    // console.log('ADD');
    DBlayer.DBaddSilo(req.body.client_id, req.body.partnership_id, req.body.farm_id, req.body.center_id, req.body.silo_number, req.body.height, req.body.diameter, req.body.total_capacity_1, req.body.total_rings_quantity, req.body.rings_height, req.body.cone_degrees)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};


exports.updateSilo = async function(req, res) {

    try {
        let data  = await DBlayer.DBupdateSilo(req.body.silo_id, req.body.silo_number, req.body.height, req.body.diameter, req.body.total_capacity_1, req.body.total_rings_quantity, req.body.rings_height, req.body.cone_degrees);
        let silos = req.body.changes.silos;
        for(let i=0 ; i<silos.length; i++){
        // console.log("associated: ", silos[i].associated);
            if(silos[i].associated){
                // console.log("true");
                let associationsInserted = await DBlayer.DBinsertAssociation(silos[i].silo_id, silos[i].shed_id, silos[i].partnership_id, silos[i].farm_id, silos[i].client_id, silos[i].center_id);
            }else{
                // console.log("false");
                let associationsDeleted = await DBlayer.DBdeleteAssociation(silos[i].silo_id, silos[i].shed_id, silos[i].partnership_id, silos[i].farm_id, silos[i].client_id, silos[i].center_id);
            }
        }

        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};


exports.deleteSilo = function(req, res) {
    DBlayer.DBdeleteSilo(req.body.silo_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Silo Eliminado"
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};

exports.findShedBySilo = function(req, res) {
    DBlayer.DBfindShedBySilo(req.body.silo_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function(err) {
            // console.log(err);
            res.status(500).send(err);
        });
};
