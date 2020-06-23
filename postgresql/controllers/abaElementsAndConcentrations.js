const DBlayer = require("../models/abaElementsAndConcentrations");
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

exports.findByFormulationId = async function(req, res) {

    try {
        let records = await DBlayer.DBfindByFormulationId(req.body);
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
        let records = await DBlayer.DBdelete(req.query.element);
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

