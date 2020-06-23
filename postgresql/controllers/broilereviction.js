const DBlayer = require("../models/broilereviction");
const DBbroiler_product = require("../models/broilerProduct");
const DBslaughterhouse = require("../models/slaughterhouse");

function addDays(nDate, nDay) {  
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.findprojectedbroilereviction = async function(req, res) {

    try { 
        console.log("Entro luigie");
        let partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            // _date = req.body._date,
            init_age = req.body.init_age,
            end_age = req.body.end_age,
            breed_id = req.body.breed_id,
            pAgDate = req.body.age_date.split("-")
            age_date = `${pAgDate[2]}-${pAgDate[1]}-${pAgDate[0]}`;
        // let aDate = _date.split("-"),
    
        //     init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
        // let nDate = new Date(aDate[2], aDate[1] - 1, aDate[0]),
        //     sDate = addDays(nDate, 6),
        //     end_date = `${sDate.getFullYear()}-${sDate.getMonth()+1}-${sDate.getDate()}`;
        // console.log("Date::: ", _date, init_date) 
        console.log("las ages::: ", init_age, end_age, age_date)
        let records = await DBlayer.DBfindprojectedbroilerevictionByAgeRange(partnership_id, scenario_id, init_age, end_age, breed_id, age_date),
        // let records = await DBlayer.DBfindprojectedbroilereviction2(partnership_id, scenario_id, init_date, end_date, breed_id),
            // broiler_product = await DBbroiler_product.DBfindAllBroilerProduct(), 
            broiler_product = await DBbroiler_product.DBfindBroilerProductbyBreedId(breed_id),
            slaughterhouse = await DBslaughterhouse.DBfindAllslaughterhouse();

        console.log("el proyectado de desalojo");
        console.log(records);
        console.log("termino el proyectado de desalojo");
        console.log(broiler_product);

        console.log("plantas de beneficio");
        console.log(slaughterhouse);
        res.status(200).json({
            statusCode: 200,
            data: records,
            product: broiler_product,
            slaughterhouse: slaughterhouse
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findBroilerEvictionLot = async function(req, res) {

    try {
        console.log("Entro luigie1");
        let scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            rDate = req.body._date,
            aDate = rDate.split("/"),
            _date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;


        let records = await DBlayer.DBfindBroilerEvictionLot(scenario_id, partnership_id, breed_id, _date);

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

exports.findBroilerEvictionFarmAndProduct = async function(req, res) {

    try {
        let broilereviction_id = req.body.broilereviction_id;
        console.log("Mi id en el find products",broilereviction_id)

        let data = await DBlayer.findBroilerEvictionFarmAndProduct(broilereviction_id);
        console.log("Volvi y me traje:::: ",data)
        res.status(200).json({
            statusCode: 200,
            data: data
        });

    } catch (err) {
        console.log("Error en findBroilerEvictionFarmAndProduct:::: ",err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }

};