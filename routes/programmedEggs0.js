const DBlayer = require("../models/programmedEggs");
const DBeggsStorage = require("../models/eggsStorage");
const DBprogrammedEggs = require("../models/programmedEggs");
const DBincubator = require("../models/incubator");
const DB_process = require("../models/process");
const DB_housingWay = require("../models/housingWay");
const DB_broiler = require("../models/broiler");


exports.addProgrammed = async(req, res) => {
    try{
    //   console.log(req.body.records );
    //   console.log(req.body.pdate);
        let lot = req.body.records,
            programmed_eggs = [],
            subtract_availability = [],
            nDdate = req.body.pdate.split("-"),
            aDate = new Date(nDdate[2], nDdate[1]-1, nDdate[0]),
            pdate = `${aDate.getFullYear()}-${aDate.getMonth()+1}-${aDate.getDate()}`,
            breed_id = req.body.breed_id,
            incubator_plant_id = req.body.incubator_plant_id;
        //   console.log("pdate: ", pdate);
        lot.forEach(item=>{
            let sum = 0;
            //console.log("item: ", item);
            if(item.assigned.length>0){
                item.assigned.forEach(item2=>{

                    //Cada registro de lo programado de huevo
                    programmed_eggs.push({
                        incubator_id: item2.selected_incubator,
                        lot_breed: item.lot,
                        lot_incubator: 0,
                        _date: pdate,
                        eggs: item2.quantity_eggs,
                        breed_id: breed_id
                    });
                    // console.log("Sum2: ", sum);
                    sum += item2.quantity_eggs;

                });
            }
            //Lo que voy a descontar de la disponibilidad de almacenamiento
            subtract_availability.push({
                eggs_storage_id: item.eggs_storage_id,
                eggs: sum
            });
            // console.log("programmed_eggs: ", programmed_eggs);
            // console.log("Sum: ", sum);

            sum = 0;
        });

        //   console.log("subtract_availability: ", subtract_availability);
        for(let i= 0; i <subtract_availability.length; i++){
        //   console.log("Voy a restar ID: ",subtract_availability[i].eggs_storage_id, "Eggs: ", subtract_availability[i].eggs);
            let isSubtract  = await DBeggsStorage.DBsubtractAvailability(subtract_availability[i].eggs, subtract_availability[i].eggs_storage_id );
        }


        //Generar el lote de cada maquina
        let gen_lot = [];
        programmed_eggs.forEach(item=>{

            let index = gen_lot.map(function(e) { return e.incubator_id; }).indexOf(item.incubator_id);
            if(index>=0){
                item.lot_incubator = gen_lot[index].lot_incubator;
            }else{
                item.lot_incubator = "I-"+Math.round( Math.random() * (10000 - 5000) + 5000);
                gen_lot.push({
                    incubator_id: item.incubator_id,
                    lot_incubator: item.lot_incubator
                });
            }
        });

        //Guardar los registros progrmados
        let records_eggs = await DBlayer.DBaddProgrammed(programmed_eggs);

        //DEvolver los datos a mostrar en progrmacion
        let incubator = [],
            aIncubator = await DBincubator.DBfindIncubatorByPlant(incubator_plant_id);
        aIncubator.forEach(item=>{
            incubator.push(item.incubator_id);
        });
        let records = await DBprogrammedEggs.DBfindProgrammerLot(breed_id, incubator, pdate);
        let prog_eggs = [];
        //   console.log("Brayan records: ", records);
        records.forEach(item=>{
            let index = prog_eggs.map(function(e) { return e.incubator_id; }).indexOf(item.incubator_id);
            if(index>=0){
                prog_eggs[index].eggs += item.eggs;
                prog_eggs[index].diff -= item.eggs;
                prog_eggs[index].lot_breed += ","+item.lot_breed;
            }else{
                let lot = [];
                prog_eggs.push({
                    incubator_id: item.incubator_id,
                    name: item.name,
                    lot_incubator: item.lot_incubator,
                    capacity: item.capacity,
                    lot_incubator: item.lot_incubator,
                    lot_breed: item.lot_breed,
                    eggs: item.eggs,
                    diff: item.capacity - item.eggs
                });
            }
        });
        //   console.log("prog_eggs: ", prog_eggs);

        res.status(200).json({statusCode:200,
            status: "sucess",
            data: records,
            records: prog_eggs});
    }
    catch(err){
    //   console.log(err);
        res.status(500).send( { statusCode: 500, error: err, errorCode: err.code } );
    }
};



exports.findProgrammedEggs = async (req, res) => {

    try {
    // console.log("findProgrammedEggs: ", req.body);
        const records = await DBlayer.DBfindProgrammedEggs();
        res.status(200).send({statusCode: 200, data: records});
    }catch (err) {
    // console.log(err);
        res.status(500).send( { status: 500, error: err, errorCode: err.code } );
    }

};

function addDays(nDate, nDay){
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
}

exports.updateProgrammedEggs = async function(req, res) {


    let records = req.body.records,
        stage_id = req.body.stage_id,
        _date = req.body._date,
        partnership_id = req.body.partnership_id,
        breed_id = req.body.breed_id,
        scenario_id = req.body.scenario_id;

    try {
        //Incubacion
        // console.log(stage_id, breed_id, scenario_id);
        let info = await DB_process.DBfindProcessByStageBreed(stage_id, breed_id, scenario_id) ;
        // console.log("Info: ", info);

        let aDate = _date.split("-"),
            new_date = new Date(aDate[2], aDate[1]-1, aDate[0]),
            next_date = addDays(new_date , info[0].duration_goal);

        // console.log(records, stage_id, _date);
        for(let i = 0; i < records.length; i++){

            //Actualizar las cantidades
            let updateHW = await DBlayer.DBupdateProgrammedEggs(records[i].execution_quantity, records[i].lot_incubator );

            //generar los datos de la siguiente etapa
            let execution_quantity = records[i].execution_quantity - (records[i].execution_quantity * (info[0].decrease_goal/100));

            //Insertar lo proyectado de la siguiente etapa ENGORDE
            let broiler = await DB_broiler.DBaddBroiler(execution_quantity, next_date, partnership_id, scenario_id, breed_id,  records[i].lot_incubator);

        }

        //let data = await DBlayer.DBfindHousingWayDetByHw(housing_way_id);
        res.status(200).json({
            statusCode: 200,
            data: []
        });
    } catch (err) {
        // console.log(err);
        res.status(500).send(err);
    }
};
