const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const moment = require('moment');
const config = require('./config');
const helmet = require('helmet');


var
    path = require('path'),
    passport = require('passport'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    logger = require('morgan'),
    cors = require('cors');
PORT = process.env.PORT || config.port;


const api_entities = require('./routes/entitiesTechnical');
const api_calendar = require('./routes/Calendar');
const api_calendar_day = require('./routes/calendarDay');
//const api_escenario = require('./routes/escenario');
const api_procesos = require('./routes/process');
const api_holiday = require('./routes/Holiday');
const api_scenario = require('./routes/Scenario');
const api_scenarioP = require('./routes/scenarioParameter');
const api_parameter = require('./routes/Parameter');
const api_stage = require('./routes/stage');
const api_product = require('./routes/product');
const api_scenarioProc = require('./routes/scenarioProcess');
const api_measure = require('./routes/measure');
const api_scenarioF = require('./routes/scenarioFormula');
const api_breed = require('./routes/breed');
const api_partnership = require('./routes/partnership');
const api_farm = require('./routes/farm');
const api_center = require('./routes/center');
const api_warehouse = require('./routes/warehouse');
const api_shed = require('./routes/shed');
const api_silo = require('./routes/silo');
const api_farmType = require('./routes/farmType');
const api_housingWay = require('./routes/housingWay');
const api_housingWayD = require('./routes/housingWayDetail');
const api_lot = require('./routes/lot');
const api_fileExport = require('./routes/file-export');
const api_availabilityShed = require('./routes/availabilityShed');
const api_shedStatus = require('./routes/shedStatus');
const api_postureCurve = require('./routes/postureCurve');
const api_lotEggs = require('./routes/lot_eggs');
const api_liftBreeding = require('./routes/lift_breeding');
const api_scenario_posture_curve = require('./routes/scenarioPostureCurve');
const api_brooder_machine = require('./routes/brooderMachine');
const api_incPlant = require('./routes/incubatorPlant');
const api_incubator = require('./routes/incubator');
const api_sales = require('./routes/incubatorSales');
const api_eggsStorage = require('./routes/eggsStorage');
const api_programmed_eggs = require('./routes/programmedEggs');
const api_broiler = require('./routes/broiler');
const api_broiler_detail = require('./routes/broilerDetail');
const api_broilereviction = require('./routes/broilerEviction');
const api_broilereviction_detail = require('./routes/broilerEvictionDetail');
const api_broiler_product = require('./routes/broilerProduct');
const api_slaughterhouse = require('./routes/slaughterhouse');
const api_synchronization = require('./routes/synchronization');
const api_dailyMonitor = require('./routes/dailyMonitor');
const api_users = require('./routes/userControl');
const api_apps = require('./routes/appControl');
const api_userapps = require('./routes/user_appControl');
const api_userM = require('./routes/userManagement');
const api_eggsMovements = require('./routes/eggsMovements');
const api_higherLayer = require('./routes/higherLayer');
// const api_scenario_hen = require('./routes/scenarioHen');
const api_reports = require('./routes/reports');
const api_app_RolControl = require('./routes/app_rolControl');
const api_app_dataImport = require('./routes/dataImport');

const apiAbaElements = require('./routes/abaElements');
const apiAbaElementsProperties = require('./routes/abaElementsProperties');
const apiAbaFormulation = require('./routes/abaFormulation');
const apiAbaTimeUnit = require('./routes/abaTimeUnit');
const apiAbaConsumptionAndMortality = require('./routes/abaConsumptionAndMortality');
const apiAbaElementsAndConcentrations = require('./routes/abaElementsAndConcentrations');
const apiAbaResults = require('./routes/abaResults');
const apiAbaBreedsAndStages = require('./routes/abaBreedsAndStages');
const apiAbaConsumptionAndMortalityDetail = require('./routes/abaConsumptionAndMortalityDetail');
const apiAbaStagesOfBreedsAndStages = require('./routes/abaStagesOfBreedsAndStages');
const apiAbaAlimentsAndStages = require('./routes/abaAlimentsAndStages');
const apiAbaResultsGeneration = require('./routes/abaResultsGeneration');

const api_cold_room = require('./routes/coldRoom');
const api_traceability = require('./routes/traceability');
const api_adjustments = require('./routes/adjustments');
const api_simulator = require('./routes/ave_simulator');
const apiAve_simulator =require('./routes/ave_simulator');

const api_sltx_liftbreeding = require('./routes/sltxLiftBreeding');
const api_sltx_incubator = require('./routes/sltxIncubator');
const api_sltx_broiler = require('./routes/sltxBroiler');
const api_sltx_broiler_detail = require('./routes/sltxbroiler_detail');
const api_sltx_incubator_detail = require('./routes/sltxIncubatorDetail');
const api_sltxBreeding = require('./routes/sltxBreeding');
const api_sltxb_Shed = require('./routes/sltxb_Shed');
const api_sltxbr_shed = require('./routes/sltxbr_shed');
const api_sltxlb_Shed = require('./routes/sltxlb_Shed');
const api_sltxPostureCurve = require('./routes/sltxPostureCurve');
const api_sltxSellsPurchase = require('./routes/sltxSellsPurchase');
const api_sltxInventory = require('./routes/sltxInventory');

// const api_posturecurve_Daily = require('./routes/posturecurveDaily');
// const api_posturecurve_Weekly = require('./routes/posturecurveWeekly');
// Evitar problemas de CORS:
app.use(function (req, res, next) {
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

const appLaunchpad = '/ARP_FRONTEND/launchpad/webapp';
const appCalendar = '/ARP_FRONTEND/my-calendar/webapp/';
const appConfiguration = __dirname + '/ARP_FRONTEND/technicalConfiguration/webapp';
const appManagement = __dirname + '/ARP_FRONTEND/mantenimiento-escenarios/webapp';

const appUsers = '/ARP_FRONTEND/userControl/webapp';

// console.log(appLaunchpad);
console.log("http://127.0.0.1:"+config.port+"/Apps/launchpad/webapp/");

//Alex Prueba --------------------------------------------------------------------
require('./passport.js')(passport);


// app.use(logger('dev'));


const wrap = fn => (...args) => fn(...args).catch(args[2])

app.use(cors());
app.use(cookieParser());

app.use(bodyParser.json({
    limit: '50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 1000000,
    extended: false
}));



app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: 'passport-tutorial',
    resave: true,
    rolling: true,
    saveUninitialized: false
}));

app.use(helmet())

app.use(passport.initialize());
app.use(passport.session());
//--------------------------------------------------------------------------------

app.use('/launchpad', express.static(appLaunchpad));

app.use('/entities', api_entities);
app.use('/userControl', express.static(appUsers));
app.use('/app1', express.static(appCalendar));
app.use('/app2', express.static(appConfiguration));
app.use('/app3', express.static(appManagement));

app.use('/userControl', express.static(appUsers));

app.use('/calendar', api_calendar);

app.use('/calendarDay', api_calendar_day);
//app.use('/escenario', api_escenario);
app.use('/process', api_procesos);
app.use('/holiday', api_holiday);
app.use('/scenario', api_scenario);
app.use('/scenario_param', api_scenarioP);
app.use('/scenario_proc', api_scenarioProc);
app.use('/parameter', api_parameter);
app.use('/stage', api_stage);
app.use('/product', api_product);
app.use('/measure', api_measure);
app.use('/scenario_form', api_scenarioF);
app.use('/breed', api_breed);
app.use('/partnership', api_partnership);
app.use('/farm', api_farm);
app.use('/center', api_center);
app.use('/warehouse', api_warehouse);
app.use('/shed', api_shed);
app.use('/silo', api_silo);
app.use('/farm_type', api_farmType);
app.use('/housingway', api_housingWay);
app.use('/housingwaydetail', api_housingWayD);
app.use('/lot', api_lot);
app.use('/downloadFile', api_fileExport);
app.use('/av_shed', api_availabilityShed);
app.use('/shed_status', api_shedStatus);
app.use('/posture_curve', api_postureCurve);
app.use('/lot_eggs', api_lotEggs);
app.use('/lift_breeding', api_liftBreeding);
app.use('/sposture_curve', api_scenario_posture_curve);
app.use('/brooder_machine', api_brooder_machine);
app.use('/incubator_plant', api_incPlant);
app.use('/incubator', api_incubator);
app.use('/incubatorSales', api_sales);
app.use('/eggs_storage', api_eggsStorage);
app.use('/programmed_eggs', api_programmed_eggs);
app.use('/broiler', api_broiler);
app.use('/broilerdetail', api_broiler_detail);
app.use('/broilerEviction', api_broilereviction);
app.use('/broilerEvictionDetail', api_broilereviction_detail);
app.use('/broiler_product', api_broiler_product);
app.use('/slaughterhouse', api_slaughterhouse);
app.use('/synchronization', api_synchronization);
app.use('/dailyMonitor', api_dailyMonitor);

app.use('/userControl', api_users);
app.use('/appControl', api_apps);
app.use('/user_appControl', api_userapps);
app.use('/userManagement', api_userM);
// app.use('/hen', api_scenario_hen);
app.use('/reports', api_reports);
app.use('/app_rolControl', api_app_RolControl);
app.use('/dataImport', api_app_dataImport);
app.use('/eggsMovements', api_eggsMovements);
app.use('/higherLayer', api_higherLayer);

//ABA
app.use('/abaElements', apiAbaElements);
app.use('/abaElementsProperties', apiAbaElementsProperties);
app.use('/abaFormulation', apiAbaFormulation);
app.use('/abaTimeUnit', apiAbaTimeUnit);
app.use('/abaConsumptionAndMortality', apiAbaConsumptionAndMortality);
app.use('/abaElementsAndConcentrations', apiAbaElementsAndConcentrations);
app.use('/abaResults', apiAbaResults);
app.use('/abaBreedsAndStages', apiAbaBreedsAndStages);
app.use('/abaConsumptionAndMortalityDetail', apiAbaConsumptionAndMortalityDetail);
app.use('/abaStagesOfBreedsAndStages', apiAbaStagesOfBreedsAndStages);
app.use('/abaAlimentsAndStages', apiAbaAlimentsAndStages);
app.use('/abaResultsGeneration', apiAbaResultsGeneration);

app.use('/coldRoom', api_cold_room);
app.use('/traceability', api_traceability);
app.use('/adjustments', api_adjustments);
app.use('/ave_simulator', api_simulator);
app.use('/ave_simulator', apiAve_simulator);


app.use('/sltxliftbreeding',api_sltx_liftbreeding);
app.use('/sltxIncubator',api_sltx_incubator);
app.use('/sltxBroiler',api_sltx_broiler);
app.use('/sltxbroilerDetail',api_sltx_broiler_detail);
app.use('/sltxIncubatorDetail',api_sltx_incubator_detail);
app.use('/sltxBreeding', api_sltxBreeding);
app.use('/sltxb_Shed', api_sltxb_Shed);
app.use('/sltxbr_shed', api_sltxbr_shed);
app.use('/sltxlb_Shed', api_sltxlb_Shed);
app.use('/sltxPostureCurve', api_sltxPostureCurve);
app.use('/sltxSellsPurchase', api_sltxSellsPurchase);
app.use('/sltxInventory', api_sltxInventory);

// app.use('/posturecurveDaily',api_posturecurve_Daily); 
// app.use('/posturecurveWeekly', api_posturecurve_Weekly);

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).json({
        message: err.message
    });
});

module.exports = app;