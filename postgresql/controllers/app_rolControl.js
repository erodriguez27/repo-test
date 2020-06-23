const DBlayer = require("../models/app_rolControl");
const utils = require("../../lib/utils");
const Scenario = require("../models/Scenario");

exports.otbenerAppXrol = function (req, res) {
    DBlayer.DBfindAppRol(req.body.user_infor.rol_id)
        .then(function (data) {
            var i = 0;
            var band = true;
            var a= true,b= true,c = true;
        
            while (i < data.length && band) {
                if (data[i].type == "configuracion" && a) {
                    a=false;
                }
                if (data[i].type == "regresiva" && b) {
                    b=false;
                }
                if (data[i].type == "progresiva" && c) {
                    c=false;
                }
                if (a==false && b== false && c==false) {
                    band = false;
                }
                i++;
            }
            Scenario.DBScenarioActive().then(function (Active) {
                res.status(200).json({
                    statusCode: 200,
                    data: data,
                    band: {a:a,b:b,c:c},
                    Active: Active
                });
            });
        });
};

exports.otbenerAppXrolEnEspecial = function (req, res) {
    DBlayer.DBfindAppRolEspecial(req.body.user_infor.rol_id, req.body.applicacion_name)
        .then(function (data) {
            res.status(200).send(data);
        });
};

exports.AddRolXApps = function (req, res) {
    
    DBlayer.DBInsertNameRol(req.body.name, req.body.userAdmin).then(function (data) {

        let appid = req.body.selectedItems;
        appid=appid.map(itm=>({application_id:itm,rol_id:data.rol_id}))

        DBlayer.DBAppsXRolByLot(appid);

        res.status(200).send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });
};

exports.GetName = function (req, res) {
    DBlayer.DBGetName(req.body.name).then(function (data) {
        res.status(200).send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });
};


exports.findRolId = function (req, res) {
    DBlayer.DBfindRolid(req.body.name).then(function (data) {
        res.status(200).send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });
};

exports.otbenerApps = function (req, res) {
    DBlayer.DBotbenerApps(req.body.rol_id).then(function (data) {
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    });
};

exports.updateRole = function (req, res) {

    console.log("req",req.body);
    

    (DBlayer.DBupdateRole(req.body)).then(function (data) {
        console.log("data",data)
        res.status(200).send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });

    
}

exports.updateRolName = function (req, res) {
    DBlayer.DBUpdateRolName(req.body.rol_id, req.body.rolname).then(function (data) {
        res.status(200).send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });
};

exports.updateAppsXRol = function (req, res) {
    DBlayer.DBdeleteAppsXrol(req.body.rol_id).then(function (data) {
        let appid = req.body.NewSelectedItems;
        for (let index = 0; index < appid.length; index++) {
            DBlayer.DBAppsXRol(appid[index], req.body.rol_id);
        }
        res.status(200).send(data);
    }).catch(function (err) {
        res.status(500).send(err);
    });

};