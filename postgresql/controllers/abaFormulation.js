const DBlayer = require("../models/abaFormulation");
/*const DBbroiler_product = require('../models/broilerProduct');
 const DBslaughterhouse = require('../models/slaughterhouse');*/

exports.findAll = async function(req, res) {

    try {
        let records = await DBlayer.DBfindAll();
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.add = async function(req, res) {

    try {
        let records = await DBlayer.DBadd(req.body);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.addFormula = async function(req, res) {

    try {
        let records = await DBlayer.DBaddFormula(req.body);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.updateFormula = async function(req, res) {

    try {
        let records = await DBlayer.DBupdateFormula(req.body);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

// exports.addAbaElements = async function(req, res) {
//
//     try {
//         let records = await DBlayer.addAbaElements(req.body);
//         res.status(200).json({
//             statusCode: 200,
//             data: records
//         });
//     } catch (err) {
//         console.log(err);
//         res.status(500).json({
//             statusCode: 500,
//             pgErrorCode: err
//         });
//     }
// };

exports.findById = async function(req, res) {

    try {
        let records = await DBlayer.DBfindById(req.body.element);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findByCode = async function(req, res) {

    try {
        let records = await DBlayer.DBfindByCode(req.body.element);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findByName = async function(req, res) {

    try {
        let records = await DBlayer.DBfindByName(req.body.element);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.update = async function(req, res) {

    try {
        let records = await DBlayer.DBupdate(req.body);
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.delete = async function(req, res) {

    try {
        let records = await DBlayer.DBdelete(req.body);
        //todo si responde bien entonces deberia de borrar individual en elementsAndConcentrations
        res.status(200).json({
            statusCode: 200,
            data: records
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

