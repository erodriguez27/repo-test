const DBlayer = require("../models/incubatorSales");

function addDays(nDate, nDay) {
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.addNewSales = async function(req, res) {

    try {

        let record = req.body.records;

        let id = await DBlayer.DBaddSale(record[0].date_sale, record[0].quantity, record[0].gender,record[0].breed_id, record[0].incubator_plant_id);
        let data = await DBlayer.DBfindSaleById(id.incubator_sales_id);
        res.status(200).json({
            statusCode: 200,
            data : data
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findIncubatorSales = async function(req, res) {
    try {
      let beginning = req.body.beginning,
          ending = req.body.ending,
          incubator_plant_id = req.body.incubator_plant_id,
          breed_id = req.body.breed_id,
            aDate = beginning.split("/"),
            dateBg = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
            bDate = ending.split("/"),
            dateEd = `${bDate[2]}-${bDate[1]}-${bDate[0]}`;

        let data = await DBlayer.DBfindIncubatorSales(beginning, ending, incubator_plant_id, breed_id);

        res.status(200).json({
            statusCode: 200,
            data: data
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }

};

exports.findSaleById = async function(req, res) {
    try {
      let incubator_sales_id  = req.body.incubator_sales_id;

        let data = await DBlayer.DBfindSaleById(incubator_sales_id);

        res.status(200).json({
            statusCode: 200,
            data: data
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }

};

exports.updateDeletedIncubatorSales = async function(req, res) {

    try {


        let ids = req.body.ids;
        let send = [];

        if(ids!== undefined && ids !== null && ids.length > 0){
            ids.forEach(itm => {

                send.push({
                    incubator_sales_id: itm.incubator_sales_id,
                    programmed_disable : true
                })
                console.log(send)
            });
        }else{
            let incubator_sales_id = req.body.incubator_sales_id;
            send.push({
                incubator_sales_id: incubator_sales_id,
                    programmed_disable : true
            })
        }

        await DBlayer.DBupdateDeletedIncubatorSales(send);
        res.status(200).json({
            statusCode: 200
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }

};
