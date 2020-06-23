const DBlayer = require("../models/scenarioFormula");
const scenario = require("../models/Scenario");
const parameter = require("../models/process");


exports.getScenariosFormula = async (req, res) => {
    try {

        let scenario_id = req.body.scenario_id;
        let results = await DBlayer.getGetAllScenarioFormById(scenario_id);

        res.status(200).send({statusCode: 200, results: results});

    } catch (err) {
    // console.log(err);
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }
};

exports.deleteAllFormula = async (req, res) =>{
    try {

        let scenario_id = req.body.scenario_id;
        let results = await DBlayer.DBdeleteAllFormula(scenario_id);

        res.status(200).send({statusCode: 200, msg: "success"});

    } catch (err) {
    // console.log(err);
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }


};
