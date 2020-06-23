const DBlayer = require("../models/lot_eggs");
const DBeggPlanning = require("../models/eggsPlanning");

exports.findAllLotEggs = async function(req, res) {
    //console.log(req.query.year);
    //let year = req.query.year;
    try {
        let data = await DBlayer.DBfindAllLotEggs();
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }

};

function daysMonth(month){
    if( (month == 1) || (month == 3) || (month == 5) || (month == 7) || (month == 8) || (month == 10) || (month == 12) )
        return 31;
    else if( (month == 4) || (month == 6) || (month == 9) || (month == 11) )
        return 30;
    else if( month == 2 )
    {
        return 28;
    }
}

exports.updateAllLotEggs = async function(req, res) {

    try {

        let records = req.body.changes;

        records.forEach(item => {
            item.theorical_performance = parseFloat(item.theorical_performance);
        });

        //console.log(records);

        let data = await DBlayer.DBupdateAllLotEggs(records);

        let data_length = records.length-1,
            planed_eggs = [];

        //let basa = req.body.changes;

        let value = records[0].theorical_performance,
            production = value * 16668,
            dairy_produce = production / 7,
            sum = dairy_produce * 6,
            //sum_dic = dairy_produce * 4,
            monthly = sum,
            month = 1,
            records2 = [];
        // console.log("** ", records.length);

        for(let i = 1; i<records.length; i++){
            let obj ={};

            value = records[i].theorical_performance;
            production = value * 16668;
            dairy_produce = production / 7;

            //console.log(records[i+1].week_date == undefined? 0:1);
            if(i+1<records.length){
                let aActual_month = records[i].week_date.split("/"),
                    aNext_month = records[i+1].week_date.split("/"),
                    actual_month = parseInt(aActual_month[1]),
                    next_month = parseInt(aNext_month[1]);


                if((month === actual_month) && (month === next_month) ){
                    sum = dairy_produce * 7;
                    monthly += sum;
                    month = actual_month;
                    //console.log("Sum: ", sum);
                    //console.log("Mismo mes voy sumando: ", monthly);

                }else{

                    let aDay = records[i].week_date.split("/"),
                        wday = aDay[0],
                        day = daysMonth(month),
                        diff = day - wday+1;
                    //  console.log("Diff: ", diff, day, aDay);

                    monthly += dairy_produce * diff;
                    //console.log(monthly);
                    //monthly += sum;
                    //console.log("cambio de mes: ",records[i].week_month, day, records[i].week_day ,diff, monthly );
                    obj.month_planning = actual_month;
                    obj.planned = monthly;
                    obj.year_planning = 2018;//Planificacion de cordoba
                    obj.scenario_id = 121;
                    records2.push(obj);

                    let diff_day = 7 - diff,
                        resd = diff_day * dairy_produce ;
                    sum = 0;
                    monthly = resd;
                    month = next_month;

                }
            }

            if((data_length)==i){
                monthly += 2*dairy_produce;
                obj.month_planning = 12;
                obj.planned = monthly;
                obj.year_planning = 2018;//Planificacion de cordoba
                obj.scenario_id = 121;
                records2.push(obj);
            }
        }
        // console.log(records2);
        let tTable  = await DBeggPlanning.DBtruncatePlannedEggs(records2);
        let planed  = await DBeggPlanning.DBaddPlannedEggs(records2);
        res.status(200).json({
            statusCode: 200,
            data: data
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};
