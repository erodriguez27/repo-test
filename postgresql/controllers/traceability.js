const DBlayer = require("../models/traceability");
const DBhousingWayDetail = require("../models/housingWayDetail");
const DBprogrammedEggs = require("../models/programmedEggs");
const DBbroilerDetail = require("../models/broilerDetail");
const DBeggsStorage = require("../models/eggsStorage");
const scenario = {scenario_id:null}


exports.findTraceability = async function (req, res) {

    const stages = {
        c: 1,
        p: 2,
        h: 3,
        i: 4,
        e: 5,
        x: 6,
        a: 7
    };

    const stageLetter = req.body.pref.toLowerCase();
    let result;
    try {
        let stage = stages[req.body.pref.toLowerCase()] - 1;
        console.log("el stage");
        console.log(stage);
        const lot = req.body.pref + req.body.lot;
        const isSapLot = req.body.sap;

        scenario.scenario_id = req.body.scenario_id;
        console.log('scenario', scenario)
        if (req.body.type === "regresiva") {
            switch (stage) {
            case 1:
                result = await breadingTraceability(lot, isSapLot);
                break;
            case 2:
                result = await eggsTraceability(lot, isSapLot);
                break;
            case 3:
                result = await incubatorTraceability(lot, isSapLot);
                break;
            case 4:
                result = await broilerTraceability(lot, isSapLot);
                break;
            default:
                res.status(400).send({
                    message: "etapa no configurada"
                });
            }
        } else if (req.body.type === "progresiva") {
            switch (stage) {
            case 0:
                result = await liftBreadingTraceabilityP(lot);
                break;
            case 1:
                result = await breadingTraceabilityP(lot);
                break;
            case 2:
                result = await eggsTraceabilityP(lot);
                break;
            case 3:
                result = await incubatorTraceabilityP(lot);
                break;
            case 5:
                result = await plexusAndBuyTraceabilityP(lot);
                // result = await incubatorTraceabilityP(lot)
                break;
            case 6:
                result = await plexusAndBuyTraceabilityP(lot);
                break;
            default:
                res.status(400).send({
                    message: "etapa no configurada"
                });
            }
        }
        res.status(200).json(result);

    } catch (e) {
        console.log(e);
        res.status(500).json({
            message: e.message
        });
    }
};

async function breadingTraceability(breadingLot, isSapLot) {
    const {
        housingway_detail_id
    } = await DBlayer.DBfindHousingwayDetailIdByLot(breadingLot, scenario.scenario_id, isSapLot);
    const lots = await DBhousingWayDetail.DBgetPredecesorLot(housingway_detail_id, isSapLot);

    return {
        lot: breadingLot,
        stage: "production",
        predecessors: lots.map(lot => ({
            lot: lot.lot,
            stage: "liftbreading",
            predecessors: []
        }))
    };
}

async function incubatorTraceability(incubatorLot, isSapLot) {
    const {
        programmed_eggs_id
    } = await DBprogrammedEggs.DBfindProgrammedEggsIdByLot(incubatorLot, scenario.scenario_id, isSapLot);
    const lots = await DBprogrammedEggs.DBfindColdRoomLotsByProgramming(programmed_eggs_id, scenario.scenario_id, isSapLot);
    const result = [];

    for (const lot of lots) {
        result.push(await eggsTraceability(lot.lot, isSapLot));
    }
    return {
        lot: incubatorLot,
        stage: "incubation",
        predecessors: result
    };
}

async function broilerTraceability(broilerLot, isSapLot) {
    const {
        broiler_detail_id
    } = await DBbroilerDetail.DBfindBroilerDetailIdByLot(broilerLot, scenario.scenario_id, isSapLot);
    const lots = await DBbroilerDetail.DBfindIncubatorLotByBroilerLot(broiler_detail_id, isSapLot);
    result = [];

    for (const lot of lots) {
        result.push(await incubatorTraceability(lot.lot_incubator, isSapLot));
    }

    return {
        lot: broilerLot,
        stage: "broiler",
        predecessors: result
    };
}

async function eggsTraceability(eggsLot, isSapLot) {
    let breadingLot = [];
    let lot = eggsLot;
    if (isSapLot) {
        lot = (await DBeggsStorage.DBfindArpLotByErpLot(eggsLot, scenario.scenario_id)).lot;    
    }

    if (lot[0] !== "X") {
        let res = lot.split("");
        res[0] = "P";
        res = res.join("");
        lot = res.split("-")[0];
        breadingLot = [await breadingTraceability(lot)];
    }


    return {
        lot: eggsLot,
        stage: "eggs",
        predecessors: breadingLot
    };
}





async function liftBreadingTraceabilityP(liftbreadintLot) {
    const {
        housingway_detail_id
    } = await DBlayer.DBfindHousingwayDetailIdByLot(liftbreadintLot, scenario.scenario_id);
    const {
        housing_way_id
    } = await DBlayer.DBfindHousingwayIdById(housingway_detail_id);
    let lotesProduction = await DBlayer.DBfindHousingwaylotById(housing_way_id);
    const result = [];
    console.log("lotesProduction");
    console.log(lotesProduction);
    for (const lot of lotesProduction) {
        result.push(await breadingTraceabilityP(lot.lot));
    }

    return {
        lot: liftbreadintLot,
        stage: "liftbreading",
        successor: result
    };
}

async function breadingTraceabilityP(breadingLot) {
    console.log("entro en breadingTraceabilityP");
    const result = "H" + breadingLot.substring(1);
    console.log(result);
    const eggsLot = await eggsTraceabilityP(result);
    console.log("eggsLot");


    return {
        lot: breadingLot,
        stage: "production",
        successor: [eggsLot]
    };
}

async function eggsTraceabilityP(eggsLot) {
    console.log("entro en eggsTraceabilityP");
    const lotsIds = await DBlayer.DBfindIncubatorLot(eggsLot, scenario.scenario_id);
    console.log(lotsIds);
    const result = [];

    for (const lot of lotsIds) {
        result.push(await incubatorTraceabilityP(lot.lot_incubator));
    }

    return {
        lot: eggsLot,
        stage: "eggs",
        successor: result
    };
}

async function plexusAndBuyTraceabilityP(eggsLot) {
    console.log("entro en plexusAndBuyTraceabilityP");
    const lotsIds = await DBlayer.DBfindPlexusAndBuyLot(eggsLot, scenario.scenario_id);
    console.log("la respuesta de plexusAndBuyTraceabilityP");
    console.log(lotsIds);
    const result = [];

    for (const lot of lotsIds) {
        result.push(await incubatorTraceabilityP(lot.lot_incubator));
    }

    return {
        lot: eggsLot,
        stage: "eggs",
        successor: result
    };
}


async function incubatorTraceabilityP(incubatorLot) {
    console.log("entro en incubatorTraceabilityP");
    const lotsIds = await DBlayer.DBfindBroilerLot(incubatorLot, scenario.scenario_id);
    console.log("el resultado engorde");
    console.log(lotsIds);




    return {
        lot: incubatorLot,
        stage: "incubation",
        successor: lotsIds.map(lot => ({
            lot: lot.lot,
            stage: "broiler",
            successor: []
        }))
    };
}


exports.getLotLocation = async function(req, res) {
    try {
        const pre = req.body.lot[0];
        let result;
        scenario.scenario_id = req.body.scenario_id;
        console.log('escenario', scenario)
        if (pre === "C" || pre === "P") {
            const {
                housingway_detail_id
            } = await DBlayer.DBfindHousingwayDetailIdByLot(req.body.lot, scenario.scenario_id);
            console.log("hola", housingway_detail_id);
            result = await DBhousingWayDetail.DBfindShedAndFarmProjection2(housingway_detail_id);
        }
        else if (pre === "I") {
            const {
                programmed_eggs_id
            } = await DBprogrammedEggs.DBfindProgrammedEggsIdByLot(req.body.lot, scenario.scenario_id);
            console.log('pase', programmed_eggs_id)
            result = await DBprogrammedEggs.DBfindIncubatorPlantAndMachine(programmed_eggs_id);
        }
        else if (pre === "E") {
            const {
                broiler_detail_id
            } = await DBbroilerDetail.DBfindBroilerDetailIdByLot(req.body.lot, scenario.scenario_id);
            result = await DBbroilerDetail.DBfindShedAndFarm(broiler_detail_id);
        }
        console.log(result);
        res.status(200).json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};