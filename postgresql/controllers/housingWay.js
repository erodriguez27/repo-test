const DBlayer = require("../models/housingWay");

exports.findAllHousingWay = function(req, res) {

    DBlayer.DBfindAllHousingWay()
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

exports.addHousingWay = function(req, res) {
//   console.log(req.body);
    DBlayer.DBaddHousingWay(req.body.projected_quantity,req.body.projected_date, req.body.stage_id, req.body.partnership_id, req.body.scenario_id, req.body.breed_id, req.body.predecessor_id )
    //DBlayer.DBaddHousingWay(req.body.groupCount)
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

exports.findGroupByPartnership = async function(req, res) {
//   console.log(req.body.partnership_id);
    try {
        let data  = await DBlayer.DBfindGroupByPartnership(req.body.partnership_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
    //   console.log(err);
        res.status(500).send(err);
    }
};

exports.deleteHousingWay = function(req, res) {
    console.log(req);
    DBlayer.DBdeleteHousingWay(req.body.partnership_id)
        .then(function(data) {
            res.status(200).json({
                statusCode: 200,
                msg: "Grupos elimandos con exito"
            });
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send(err);
        });
};

exports.deleteHousingWayById = async function(req, res) {
    let is_programmed = await DBlayer.DBisProgrammedHousingway(req.body.housing_way_id);
    console.log("is_programmed");
    console.log(is_programmed);
    console.log(is_programmed.length);

    if (is_programmed.length == 1 && is_programmed[0].programmed == false) {
        console.log(" se puede eliminar no hay programaciones de ningun tipo");
        await DBlayer.DBdeleteHousingWayById(req.body.housing_way_id);
        console.log("stage_id ", req.body.stage_id);
        let data = await DBlayer.DBfindHousingByStage(req.body.stage_id, req.body.partnership_id, req.body.scenario_id);
        console.log("la nueva data ", data);
        res.status(200).json({
            statusCode: 200,
            data: data,
            msg: "Grupos elimandos con exito"
        });
    }
    else{
        if (is_programmed.length == 1 && (is_programmed[0].programmed == true && is_programmed[0].programmed_disable == true)) {
            console.log("es true aqui se deshabilita");
            await DBlayer.DBupdateDisableHousingWayById(req.body.housing_way_id);
            console.log("stage_id ", req.body.stage_id);
            let data = await DBlayer.DBfindHousingByStage(req.body.stage_id, req.body.partnership_id, req.body.scenario_id);
            console.log("la nueva data ", data);
            res.status(200).json({
                statusCode: 200,
                data: data,
                msg: "Grupos elimandos con exito"
            });
        }
        if ((is_programmed.length > 1 && (is_programmed[0].programmed_disable == null || is_programmed[1].programmed_disable == null))
            || (is_programmed.length == 1 && (is_programmed[0].programmed == true && is_programmed[0].programmed_disable == null))) {
            console.log("es null aqui no se puede eliminar");
            res.status(409).json({
                statusCode: 409,
                msg: "No se puede eliminar"
            });
        }
        
    }

    




    /*  programmed = is_programmed.programmed;
    console.log("resultado ",is_programmed.programmed);
    if(!programmed){
        await DBlayer.DBdeleteHousingWayById(req.body.housing_way_id);
        console.log("stage_id ", req.body.stage_id);
        let data = await DBlayer.DBfindHousingByStage(req.body.stage_id, req.body.partnership_id, req.body.scenario_id);
        console.log("la nueva data ", data);
        res.status(200).json({
            statusCode: 200,
            data: data,
            msg: "Grupos elimandos con exito"
        });
         
    }else{
        res.status(409).json({
            statusCode: 409,
            msg: "No se puede eliminar"
        });
    }*/
    
};


exports.findHousingWByPartnership = async function(req, res) {
    console.log(req.body.partnership_id);
    try {
        let data  = await DBlayer.DBHousingWByPartnership(req.body.partnership_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.findHousingByStage = async function(req, res) {
    console.log(req.body.partnership_id);
    try {
        let data  = await DBlayer.DBfindHousingByStage(req.body.stage_id, req.body.partnership_id, req.body.scenario_id);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};


exports.findHousingByFilters = async function(req, res) {
    console.log("llego al findHousingByFilters");
    console.log(req.body.partnership_id);

    try {
        console.log("el body");
        console.log(req.body);
        console.log("el lot");
        console.log(req.body.lot);
        console.log("el programmed");
        console.log(req.body.programmed);

        let data;
        if (req.body.lot !== null) 
        {
            console.log("entro en el lot");
            data  = await DBlayer.DBfindHousingByFilters(req.body.stage_id, req.body.partnership_id, req.body.scenario_id, req.body.lot);
            console.log("Sali de lot");
        }
        else
        {
            if (req.body.programmed !== true) 
            {
                console.log("entro en el programmed");
                data  = await DBlayer.DBfindHousingByProgrammed(req.body.stage_id, req.body.partnership_id, req.body.scenario_id);
            }
            if (req.body.programmed !== false) 
            {
                console.log("entro en el not programmed");
                data  = await DBlayer.DBfindHousingByNotProgrammed(req.body.stage_id, req.body.partnership_id, req.body.scenario_id);
            }
          
        
        }
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    }catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};
