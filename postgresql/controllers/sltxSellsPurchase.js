const DBsltx_sellspurchase = require("../models/sltxSellsPurchase");
const DBincubator = require("../models/sltxIncubator");
const DBhigherLayer = require("../models/higherLayer");


async function createLotComp(){
    let lot = "A1";
    let lote = await DBsltx_sellspurchase.DBfindMaxLotComp();
    console.log("el ultimo lote");
    console.log(lote.max);
    if(lote.max != null)
    {
        let numeracion = parseInt((lote.max));
        console.log(numeracion);
        numeracion++;
        console.log(numeracion);
        lot = "A"+numeracion;
        console.log("lote final");
        console.log(lot);
    }
    
    return lot;
}

exports.saveOperation = async function(req, res) {

    try {

        //let lot = req.body.lot;
        let scenario_id = req.body.scenario_id,
            quantity = req.body.quantity,
            pDate = req.body.programmed_date,
            aDate = pDate.split('-'),
            nDate = new Date (aDate[0], aDate[1]-1, aDate[2]),
            type = req.body.type,
            concept = req.body.concept,
            register = [req.body];
        console.log("El body de compra::: ", req.body)

        register[0].lot = register[0].concept ==="Compra"? await createLotComp(): null;
        let resp_i = await DBsltx_sellspurchase.DBinsertOperation(register);
        console.log(resp_i);
        let resp_f = await DBsltx_sellspurchase.DBfindOperationById(resp_i[0].slsellspurchase_id);

        console.log(resp_f);
        let scenarios = await DBhigherLayer.DBfindAllScenariosProgrammed("sltxsellspurchase");

        res.status(200).json({
            statusCode: 200,
            data: [resp_f],
            scenarios: scenarios
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findOperationsByFilter = async function(req, res) {

    try {

        let concept = req.body.concept,
            type = req.body.type,
            breed_id = req.body.breed_id,
            date1 = req.body.date1,
            date2 = req.body.date2,
            scenario_id = req.body.scenario_id,
            operations;
            
            console.log(concept,typeof(type),breed_id,date1,date2);
        if((date1 != undefined && date1!=null && date2 != undefined && date2!=null) || 
            (breed_id != undefined && breed_id!=null) || (concept != undefined && concept!=null) || (type != undefined && type!=null) || (scenario_id != undefined && scenario_id!=null) ){
                operations = await DBsltx_sellspurchase.DBfindOperationsByFilter(concept,type,breed_id,date1,date2,scenario_id);
        }else{
            res.status(204).json({
                statusCode: 204,
                error_msg: "Error no se recibió data en la solicitud"
            });
        }

        res.status(200).json({
            statusCode: 200,
            data: operations
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.saveDeleted = async function(req, res) {

    try {

        //let lot = req.body.lot;
        let search = req.body.search,
            data = req.body.data,
            ret = {deleted:false};
        console.log(req.body)
        if(data.concept==='Venta'){
            ret = await DBsltx_sellspurchase.DBupdateStatus([req.body]);
            // console.log(resp_d);
        }else{
            if(data.type==='Huevo Fértil'){
                ret = await DBhigherLayer.DBpurchaseEgg_delete_cascade(data.slsellspurchase_id);
            }else{
                if(data.type==='Pollito de un día'){
                    ret = await DBhigherLayer.DBpurchaseChicken_delete_cascade(data.slsellspurchase_id);
                }else{
                    ret = await DBsltx_sellspurchase.DBupdateStatus([req.body]);
                }
            }
            
        }
        console.log("el search",search)
        let data_ret = await DBsltx_sellspurchase.DBfindOperationsByFilter(search.concept, search.type, search.breed_id, search.date1, search.date2, search.scenario_id);
        
        let stat = ret.deleted === true ?200:409 ,
            msg = ret.deleted === true ?'Eliminación exitosa':'No se puede eliminar el registro porque influye sobre una programación de engorde que ya ha sido sincronizada'
        
            let scenarios = await DBhigherLayer.DBfindAllScenariosProgrammed("sltxsellspurchase");
        console.log(stat, msg)
            res.status(stat).json({
                statusCode: stat,
                data: data_ret,
                msj: msg,
                scenarios: scenarios
            });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};