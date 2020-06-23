const DBlayer = require("../models/scenarioProcesses");
const scenario = require("../models/Scenario");
const parameter = require("../models/process");
const DBFormula = require("../models/scenarioFormula");
const formula = require("./Scenario");


exports.getScenariosProcess = async (req, res) => {
    try {

        let scenario_id = req.body.scenario_id;
        let results = await DBlayer.getGetAllScenarioProcById(scenario_id);
    
        res.status(200).send({statusCode: 200, results: results});

    } catch (err) {
    // console.log(err);
        res.status(200).send( { statusCode: 200, error: err.message, errorCode: err.code } );
    }
};


exports.updateScenarioProcesses = async (req, res) => {
    try {
        scenario_id = req.body.scenario_id;
        let records = req.body.changes;
        for(let objProcess of records){
            DBlayer.BDupdateScenarioProcesses(objProcess);
        }

        let deletesFormula =  await DBFormula.DBdeleteAllFormula(scenario_id);

        //let generatedFormulaI = await formula.generateScenarioFormulaI(req, res);
        //let generatedFormulaO = await formula.generateScenarioFormulaO(req, res);
        let generatedFormulaO = await formula.generateScenarioProcessFormulaO(req, res);
        // console.log('Genere la formula');

        res.status(200).send({statusCode: 200, msg:"success"});

    } catch (err) {
    // console.log(err);
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }
};
