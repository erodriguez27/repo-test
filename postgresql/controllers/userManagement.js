const DBlayer = require("../models/userManagement");
const DBlayerRol = require("../models/app_rolControl");

const crypto = require('crypto');
const iterations = 100000;
const keylen = 64;
const algorithm = 'sha512';

exports.findUsers = function (req, res) {
    DBlayer.DBfindUsers()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findUsername = function (req, res) {
    DBlayer.DBfindUsername(req.body.username)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.findApps = function (req, res) {
    DBlayer.DBfindApps(req.body.type)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};


exports.findUserIds = function (req, res) {
    DBlayer.DBfindUserIds()
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.addUser = function (req, res) {
    // Aqui encrypto la contraseña
    crypto.pbkdf2(req.body.password, req.body.username, iterations, keylen, algorithm, (err, derivedKey) => {
        if (err) throw err;
        hashedPassword = derivedKey.toString('hex');
        DBlayerRol.DBfindRol(req.body.type_user).then(function (roldata) {
            if (roldata.length > 0) {
                DBlayer.DBaddUser(req.body.username, hashedPassword, req.body.active, req.body.name, req.body.lastname, req.body.userAdmin, roldata[0]["rol_id"])
                    .then(function (data) {
                        res.status(200).json({
                            statusCode: 200,
                            data: data
                        });
                    })
                    .catch(function (err) {
                        console.log(err)
                        res.status(500).send(err);
                    });
            }else{
                res.status(200).json({
                    statusCode: 200
                });
            }

        });
    });

};

// exports.addUser_app = function(req, res) {
//       DBlayer.DBaddUser_app(req.body.user_id, req.body.app_id)
//           .then(function(data) {
//               res.status(200).json({
//                   statusCode: 200,
//                   data: data
//               });
//           })
//           .catch(function(err) {
//               res.status(500).send(err);
//           });
//   };

exports.editUserType = function (req, res) {

    DBlayerRol.DBfindRol(req.body.user_type).then(function (rol) {
        DBlayer.DBeditUserType(req.body.user_id,rol[0]["rol_id"]).then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        }).catch(function (err) {
            res.status(500).send(err);
        });
 
    }).catch(function (err) {
        res.status(500).send(err);
    });  
};

exports.updateUserPassword = function (req, res) {
    DBlayer.DBupdateUserPassword(req.body.user, req.body.password)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                data: data
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};

exports.deleteUser = function (req, res) {
    DBlayer.DBdeleteUser(req.body.user)
        .then(function (data) {
            res.status(200).json({
                statusCode: 200,
                mgs: "Usuario " + req.body.user + " Eliminado"
            });
        })
        .catch(function (err) {
            res.status(500).send(err);
        });
};


exports.findRol = function (req, res) {
    DBlayer.DBfindRols().then(function (data) {
        res.status(200).json({
            statusCode: 200,
            data: data
        });

    }).catch(function (err) {
        res.status(500).send(err);
    });
};

exports.findApps = function (req, res) {
    DBlayer.DBfindApps().then(function (data) {
        res.status(200).json({
            statusCode: 200,
            data: data
        });

    }).catch(function (err) {
        res.status(500).send(err);
    });
};
