const DBlayer = require("../models/userControl");
const DBlayerApp = require("../models/app_rolControl");

const DBuserManagement = require("../models/userManagement");

const crypto = require('crypto');
const iterations = 100000;
const keylen = 64;
const algorithm = 'sha512';
var passport = require("passport");

exports.inicioPassport = function (req, res, next) {
    passport.authenticate("local", function (err, user, info) {

        if (err || !user) {           
            return res.status(403).send({
                title: err?"err":"userControl"
            });
        }
        
        return req.logIn(user, function (err) {
            if (err) {
                return res.status(403).send({
                    title: "userControl"
                });
            } else {
                if (!req.isAuthenticated()) {
                    res.redirect("/userControl/signin");
                } else {
                    var user = req.user;
                    return res.status(200).send({
                        title: "launchpad",
                        user: user
                    });
                }
            }
        });
    })(req, res, next);
};

exports.passportinicial = function (req, res, next) {
    // If user is not authenticated, redirect them
    // to the signin page.
    if (!req.isAuthenticated()) {
        res.redirect("/userControl/signin");
    } else {
        var user = req.user;
        return res.status(200).send({
            title: "launchpad",
            user: user
        });
    }
};

exports.signin = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect("/userControl/passportInicial");
    } else {
        // console.log('No session');
        return res.status(403).send({
            title: "userControl"
        });
    }
};

exports.signout = function (req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect("/userControl/signin");
    } else {
        req.logOut();
        cookie = req.cookies;
        console.log(cookie);
        req.session.destroy(function (err) {
            return res.status(200).send({
                title: "signout"
            });
        });
    }
};

exports.PassportWithAppValidation = function (req, res, next) {
 
    if (req.isAuthenticated()) {
        DBlayerApp.DBfindAppRolEspecial(req.user[0]["rol_id"] , req.body.Appname)
            .then(function (data){
                return res.status(200).send(data);
            });

    } else {
        return res.status(403).send({
            title: "userControl"
        });
    }
};


exports.LogIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.status(200).send({
            title: "launchpad",
            user: req.user
        });
    } else {
        return res.status(403).send({
            title: "userControl"
        });
    }
};


exports.updateUser = async function (req, res) {
    console.log("body",req.body);
    
    let func = req.body.change;
    let params = req.body.parameters
    let resp = {}

    try{
        if(func.role){

            await DBlayerApp.DBfindRol(params.user_type).then(function (rol) {
                DBuserManagement.DBeditUserType(params.user_id,rol[0]["rol_id"]).then(function (data) {
                    resp.role=200
                }).catch(function (err) {
                    res.status(500).send(err);
                });
        
            }).catch(function (err) {
                res.status(500).send(err);
            });  


        }
        if(func.status){

            await DBlayer.DBeditUserAct(params.user_id, params.active)
            .then(function (data) {

                resp.status=200
            })
            .catch(function (err) {
                res.status(500).send(err);
            });

        }
        if(func.password){

            let username = params.username,
                newPass = params.password,
                user_id = params.user_id;

            crypto.pbkdf2(newPass, username, iterations, keylen, algorithm, async (err, derivedKeyOld) => {
                if (err) throw err;
                hashedPassword = derivedKeyOld.toString('hex');
                await DBlayer.DBupdateUserPassword(user_id, hashedPassword)
                    .then(function (data) {
                        resp.password=200
                    })
                    .catch(function (err) {
                        res.status(500).send(err);
                    });
                
            });



        }

        res.status(200).json({
            statusCode: 200,
            data: resp
        });

    }catch(err) {
        console.log("Error",err);
        
        res.status(500).send(err);
    };

};

exports.editUserAct = function (req, res) {
    DBlayer.DBeditUserAct(req.body.user_id, req.body.active)
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

exports.updateUserPassword = function (req, res) {
    // Encrypto
        let user = req.user,
        username = user[0].username,
        oldPass = req.body.oldpass;
        crypto.pbkdf2(oldPass, username, iterations, keylen, algorithm, (err, derivedKeyOld) => {
            if (err) throw err;
            hashedOld = derivedKeyOld.toString('hex');
            if(req.user[0].password === hashedOld){
                crypto.pbkdf2(req.body.password, username, iterations, keylen, algorithm, (err, derivedKey) => {
                    if (err) throw err;
                    hashedPassword = derivedKey.toString('hex');
                    if(req.user[0].password !== hashedPassword){
                        DBlayer.DBupdateUserPassword(user[0].user_id, hashedPassword)
                                .then(function (data) {
                                    res.status(200).json({
                                        statusCode: 200,
                                        data: data
                                    });
                                })
                                .catch(function (err) {
                                    res.status(500).send(err);
                                });
                    }else{
                        res.status(409).json({
                            statusCode: 409
                        });
                    }
                });
            }else{
                res.status(401).json({
                    statusCode: 401
                });
            }
            
        });

};