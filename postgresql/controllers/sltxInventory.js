const DBsltx_inventory = require("../models/sltxInventory");
const DBsltx_incubator = require("../models/sltxIncubator");
const DBsltx_incubator_curve = require("../models/sltxincubator_curve");
const axios = require("axios");

function addDays(nDate, nDay) { 
    nDate.setDate(nDate.getDate() + nDay);
    return nDate;
} 

exports.findInventoryByFilter = async function(req, res) {

    try {

        console.log("escenario de busqueda", req.body.scenario_id)
        if(req.body.date1 != undefined && req.body.date1 != null && req.body.date1 != "" && req.body.date2 != undefined && req.body.date2 != null && req.body.date2 != "" && 
            req.body.scenario_id != undefined && req.body.scenario_id != null && req.body.scenario_id != ""){
            
            let structure1= req.body.date1.split("-"),
            structure2 = req.body.date2.split("-"),

            date1 = new Date(structure1[0],structure1[1]-1,structure1[2]),
            date2 = new Date(structure2[0],structure2[1]-1,structure2[2]),
            valid;

            console.log("date1",date1)
            console.log("date1",date1)

            console.log("n dia date1",date1.getDay())
            console.log("n dia date2",date2.getDay())

            console.log("dia date1",addDays(date1,-date1.getDay()));
            //console.log("dia date1",date1.setDate(date1.getDate() - (7 - date1.getDay()) % 7))

            console.log("dia date2",addDays(date2,-date2.getDay()));
            
            //console.log("dia date2",date2.setDate(date2.getDate() + (7 - date2.getDay()) % 7))    
            //console.log("dia date2",date2.setDate(date2.getDate() + (7 - date2.getDay()) % 7))    
            //console.log("dia date2",date2.setDate(date2.getDate() + (7 - date2.getDay()) % 7))    
            //console.log("dia date2",date2.setDate(date2.getDate() + (7 - date2.getDay()) % 7))    
            

            let resp_f = await DBsltx_inventory.DBfindInventoryByFilter(date1,date2,req.body.scenario_id);
            // let resp_fd = await DBsltx_inventory.DBfindDateReferencial(req.body.scenario_id)

            // if(resp_f[0].date_from > resp_fd.date){

            //     let date_aux = new Date(resp_f[0].date_from)
            //     if(addDays(date_aux,-7)<=resp_fd.date){
            //         valid = true;
            //     }
            //     else{
            //         valid = false;   
            //     }

            // }
            // else {
            //     valid = true;
            // }

            let band = true;

            for (let i = 0; i < resp_f.length; i++) {
                if(resp_f[i].exist_pc === true){
                    let aux = await DBsltx_incubator.DBfindProjectionByDateAndScenario2(resp_f[i].date_from, req.body.scenario_id)
                    resp_f[i].executable_inv = aux.length > 0
                    console.log("aux",resp_f[i].date_from,
                    aux,resp_f[i].executable_inv )
                    band = band && aux.length > 0 
                }
                
            }
            // if(resp_f[resp_f.length-1].date_to >= resp_fd.date){
            //         valid = true;    
            // }else{
                
            // }

            //console.log("registros retornados", resp_f)

            let result = {
                records : resp_f,
                // date_suggest : resp_fd.date,
                // valid : valid,
                executable : band
            }

            res.status(200).json({
                statusCode: 200,
                data: result
            });
        }else{

            res.status(204).json({
                statusCode: 204,
                error_msg: "Error no se recibió data en la solicitud"
            });

        }

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.executeInventory = async function(req, res) {

    try {

        let records = req.body.records

        await DBsltx_inventory.DBinsertExecution(records)
        console.log("escenario ejecutado ejecutado",records[0].scenario_id)
        let rUp=[],
            inc_pos_ins = [];
        for (let i = 0; i < records.length; i++) {
            let aux = await DBsltx_incubator.DBfindProjectionByDateAndScenario2(records[i].week_date, records[i].scenario_id),
            inc_posture = await DBsltx_incubator_curve.DBfindRecordsByIncubatorId(aux[0].slincubator),
            length_curve = inc_posture.length,
            execute_quantity = records[i].execution_eggs + records[i].execution_plexus_eggs;
            console.log("aux",aux)
            rUp.push({
                slincubator: aux[0].slincubator,
                scheduled_quantity: execute_quantity
            });
            // Calculo la cantidad de las curvas de posture.
            inc_pos_ins = inc_pos_ins.concat( inc_posture.map(item => ({...item,quantity:Math.ceil(execute_quantity/length_curve)})))
            
        }
        console.log("Las length::::: ", rUp.length, inc_pos_ins.length)
        await DBsltx_incubator.DBupdateProjectionsQuantity(rUp);
        await DBsltx_incubator_curve.DBUpdateIncubatorCurveQuantity(inc_pos_ins);
        
        // let ob = {
        //     date1 : req.body.date1,
        //     date2 : req.body.date2,
        //     scenario_id : req.body.scenario_id
        // }
        // let resp = await axios.post( "http://" + req.connection.localAddress.replace(/^.*:/, "") + ":" + req.connection.localPort + "/sltxInventory/findInventoryByFilter", ob);

        
        // let result = resp.data.data

        
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