const DBlayer = require("../models/broilerEvictionDetail");
const status_disponible= 1;
const status_ocupado= 2;
const status_vacio= 3;
const status_inhabiliado= 4;
const DBshed = require("../models/shed");
const DBslaughterhouse = require("../models/slaughterhouse");
const DBbroiler_product = require("../models/broilerProduct");

exports.updatebroilerdetail= async function(req, res) {
    console.log("update:::");
    console.log(req.body);
    try{
        let projected_date = req.body.projected_date,
            aDate = projected_date.split("/"),
            records = req.body.records,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            broilereviction_id = req.body.records[0].broilereviction_id,
            shedEviction = req.body.shedEviction,
            shed_id = req.body.shed_id,
            pDate = records[0].execution_date.split("/");

        console.log(pDate);

        if(pDate.length==3){
            var nDate = `${pDate[2]}-${pDate[1]}-${pDate[0]}`;
            console.log(nDate);
            records[0].execution_date = nDate;
        }

        console.log("el IDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD");
        console.log(broilereviction_id);

        //castea la fecha para el retorno de la data
        // projected_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;
        console.log(records.length);
        //pasa a actualizar cada registro
        // for(let i = 0; i < records.length; i++){
        if(records[0].execution_quantity !== null ){
            //castea cada fecha para el update
            // aDate = records[i].execution_date.split("-");
            // records[i].execution_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;               
            console.log("ASDASDASDASDADDAD");
            //realiza el update
            if (records[0].execution_date!== null && records[0].execution_date!==undefined){
                let results = await DBlayer.DBupdateBroilerEvictionDetail(records[0].execution_date, records[0].execution_quantity, records[0].broilereviction_detail_id, records[0].executionslaughterhouse_id);
                    
            }
        }
        // }
        console.log("salio del for");
        console.log(records);
        //trae la data
        // let data = await DBlayer.DBfindBroilerEvictionDetail(projected_date, breed_id, partnership_id, scenario_id);
        let data = await DBlayer.DBfindBroilerEvictionDetail2(projected_date, breed_id, partnership_id, scenario_id, broilereviction_id);
        console.log("el resultado del find");
        console.log(data);
        data.forEach(element => {
            if(element.execution_quantity && element.execution_date && element.executionslaughterhouse_id){
                element.isexecuted = true;
            }else{
                element.isexecuted = false;
            }
          
        });
        //libera los galpones que cumplen la condicion
        if(shedEviction){
            DBshed.DBupdateStatusShed(shed_id, status_vacio);
        }

        console.log("data");
        console.log(data);

        //para cada data, le agrega el campo de available
        for(let i = 0; i< data.length; i++){
            //si no se ha ejecutado, aun est� disponible (para ejecutarse)
            data[i]["available"]= (data[i]["execution_date"]=== null)? true: false;

            //limpia las fechas (formatea) que se van a mostrar
            aDate=  ((data[i].scheduled_date.getDate())<10? "0"+(data[i].scheduled_date.getDate()): (data[i].scheduled_date.getDate())) +"/"+
                    ((data[i].scheduled_date.getMonth() + 1)<10? "0"+(data[i].scheduled_date.getMonth() + 1): (data[i].scheduled_date.getMonth() + 1) ) + "/" +
                    data[i].scheduled_date.getFullYear();
            data[i].scheduled_date= aDate;

            if (data[i].execution_date!== undefined && data[i].execution_date!== null){
                aDate= data[i].execution_date;
                aDate=  ((aDate.getDate() )<10? "0"+(aDate.getDate()): (aDate.getDate() )) +"/"+
                        ((aDate.getMonth() + 1)<10? "0"+(aDate.getMonth() + 1): (aDate.getMonth() + 1) ) + "/" +
                        aDate.getFullYear();
                data[i].execution_date= aDate;
            }

            let aBroiler_product = await DBlayer.DBfindProductByLot(data[i].lot);
            data[i].product = aBroiler_product;
        }

        //retorna la data
        res.status(200).json({
            statusCode: 200,
            data: data
        });

    }catch (err) {
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};



exports.addBroilerEvictionDetail = async function(req, res) {
    console.log("agregar uno nvo");
    console.log(req.body);
    try {
        let records = req.body.records,
            farm_id = parseInt(req.body.farm_id),
            shed_id = parseInt(req.body.shed_id),

            center_id = parseInt(req.body.center_id),

            _date = req.body._date,
            sum_chicken = 0,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            be_id = req.body.broilereviction_id,
            projected_date= req.body.projected_date,
            broilereviction_id = req.body.broilereviction_id;

        let lot, register = [];
        console.log("REGISTROS");
        console.log(req.body);
        // guarda los lotes creados en;
        records.forEach(item => {
        //crea el codigo del lote de desalojo
            lot= item.name;

            register.push({
                broilereviction_id: be_id,
                scheduled_date: _date,
                scheduled_quantity: item.quantity_chicken,
                farm_id: farm_id,
                shed_id: shed_id,
                center_id: center_id,
                confirm: 0,
                execution_date: null,
                execution_quantity: null,
                lot: lot,
                broiler_product_id: item.selected_product_id,
                slaughterhouse_id: parseInt(item.slaughterhouse_id)
            });
            console.log(register);
        });

        console.log("registros a guardar");
        console.log(register);

        // guarda los registros
        let save = await DBlayer.DBaddBroilerEvictionDetail(register);

        console.log("recuperaci�n de data");
        // recupera la data
        // let results = await DBlayer.DBfindBroilerEvictionDetail(projected_date, breed_id, partnership_id, scenario_id);
        let results;
        try
        {   
            results = await DBlayer.DBfindBroilerEvictionDetail2(projected_date, breed_id, partnership_id, scenario_id, broilereviction_id);
        }
        catch (err) {
            console.log("el error");
            console.log(err);
        }
        console.log("los results");
        console.log(results);
        //para cada registro, setea las fechas y los habilita o deshabilita
        for(let i = 0; i< results.length; i++){
        //si no se ha ejecutado, aun est� disponible (para ejecutarse)
            results[i]["available"]= (results[i]["execution_date"]=== null)? true: false;

            aDate= results[i].scheduled_date;
            aDate=  ((aDate.getDate())<10? "0"+(aDate.getDate()): (aDate.getDate())) +"/"+
                ((aDate.getMonth() + 1)<10? "0"+(aDate.getMonth() + 1): (aDate.getMonth() + 1) ) + "/" +
                aDate.getFullYear();
            results[i].scheduled_date= aDate;

            if (results[i].execution_date!== undefined && results[i].execution_date!== null){
                aDate= results[i].execution_date;
                aDate=  ((aDate.getDate() )<10? "0"+(aDate.getDate()): (aDate.getDate() )) +"/"+
                    ((aDate.getMonth() + 1)<10? "0"+(aDate.getMonth() + 1): (aDate.getMonth() + 1) ) + "/" +
                    aDate.getFullYear();
                results[i].execution_date= aDate;
            }

            console.log("anted del by lot");
            let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
            results[i].product = aBroiler_product;
        }
        console.log("data seteada");
        console.log(results);
        res.status(200).json({
            statusCode: 200,
            data: results
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findBroilerEvictionDetail = async function(req, res) {

    try {
        let partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            _date = req.body._date,
            breed_id = req.body.breed_id,
            broilereviction_id = req.body.broilereviction_id,
            gender = req.body.gender;
        console.log("el body");
        console.log(req.body);

        console.log("el id recibido en back");
        console.log(broilereviction_id);

        // let results = await DBlayer.DBfindBroilerEvictionDetail(_date, breed_id, partnership_id, scenario_id);
        let results = await DBlayer.DBfindBroilerEvictionDetail2(_date, breed_id, partnership_id, scenario_id, broilereviction_id);
        prods = await DBbroiler_product.DBfindBroilerProductbyBreedAndGender(breed_id, gender)
        console.log("EL DETALLE BROILEREVICTION");
        console.log(results);
        let dateProg, dateEjec, aDate;

        for(let i = 0; i< results.length; i++){
            results[i]["available"]= (results[i]["execution_date"]=== null)? true: false;

            dateProg= results[i].scheduled_date;
            aDate=  ((dateProg.getDate() )<10? "0"+(dateProg.getDate()): (dateProg.getDate() )) +"/"+
                ((dateProg.getMonth() + 1)<10? "0"+(dateProg.getMonth() + 1): (dateProg.getMonth() + 1) ) + "/" +
                dateProg.getFullYear();
            results[i].scheduled_date= aDate;

            if (results[i].execution_date!== undefined && results[i].execution_date!== null){
                dateEjec= results[i].execution_date;
                aDate=  ((dateEjec.getDate() )<10? "0"+(dateEjec.getDate()): (dateEjec.getDate() )) +"/"+
                    ((dateEjec.getMonth() + 1)<10? "0"+(dateEjec.getMonth() + 1): (dateEjec.getMonth() + 1) ) + "/" +
                    dateEjec.getFullYear();
                results[i].execution_date= aDate;
            }

            let aBroiler_product = await DBlayer.DBfindProductByBroilerEvictionDetailId(results[i].broilereviction_detail_id);
            results[i].product = aBroiler_product;
        }
    

        console.log("traido de back");
        console.log(results);
        res.status(200).json({
            statusCode: 200,
            data: results,
            product: prods
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findBroilerEvictionDetailById = async function(req, res) {

    try {
        let broilereviction_detail_id = req.body.broilereviction_detail_id;
        
        // broilereviction_id = req.body.broilereviction_id,
        // partnership_id = req.body.partnership_id,
        // scenario_id = req.body.scenario_id,
        // _date = req.body._date,
        // breed_id = req.body.breed_id,
        
        console.log("el body");
        console.log(req.body.broilereviction_detail_id);

        // console.log("el id recibido en back")
        // console.log(broilereviction_id)

        // let results = await DBlayer.DBfindBroilerEvictionDetail(_date, breed_id, partnership_id, scenario_id);
        let results = await DBlayer.DBfindBroilerEvictionDetailById(broilereviction_detail_id);
        console.log("EL DETALLE BROILEREVICTION");
        console.log(results);
        let dateProg, dateEjec, aDate;
        results[0].slaughterhouse = await DBslaughterhouse.DBfindAllslaughterhouse(); 
        for(let i = 0; i< results.length; i++){
            results[i]["available"]= (results[i]["execution_date"]=== null && (results[i]["execution_quantity"]=== null || results[i]["execution_quantity"]<= 0) && results[i]["executionslaughterhouse_id"]=== null)? true: false;

            dateProg= results[i].scheduled_date;
            aDate=  ((dateProg.getDate() )<10? "0"+(dateProg.getDate()): (dateProg.getDate() )) +"/"+
                ((dateProg.getMonth() + 1)<10? "0"+(dateProg.getMonth() + 1): (dateProg.getMonth() + 1) ) + "/" +
                dateProg.getFullYear();
            results[i].scheduled_date= aDate;

            if (results[i].execution_date!== undefined && results[i].execution_date!== null){
                dateEjec= results[i].execution_date;
                aDate=  ((dateEjec.getDate() )<10? "0"+(dateEjec.getDate()): (dateEjec.getDate() )) +"/"+
                    ((dateEjec.getMonth() + 1)<10? "0"+(dateEjec.getMonth() + 1): (dateEjec.getMonth() + 1) ) + "/" +
                    dateEjec.getFullYear();
                results[i].execution_date= aDate;
            }

        // let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
        // results[i].product = aBroiler_product;
        }
    

        console.log("traido de back");
        console.log(results);
        res.status(200).json({
            statusCode: 200,
            data: results
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};
exports.updateDisabledBroilerEvictionDetail = async function(req, res) {
    console.log("here i am");
    try {
        let broilereviction_detail_id = req.body.broilereviction_detail_id,
            broilereviction_id = req.body.broiler_eviction_id,
            scenario_id = req.body.scenario_id,
            partnership_id = req.body.partnership_id,
            breed_id = req.body.breed_id,
            shed_id = req.body.shed_id,
            _date = req.body._date;
        var a = await DBlayer.DBupdateDisabledBroilerEvictionDetail(broilereviction_detail_id);
        let shed= await DBshed.DBupdateStatusShed(shed_id, status_disponible);//actualiza el status del galpon
        console.log("Acutalicé el shed: ",shed);
        DBshed.DBupdateAvaliableDateShed(shed_id, null);
        let results = await DBlayer.DBfindBroilerEvictionDetail2(_date, breed_id, partnership_id, scenario_id, broilereviction_id);
        console.log("traido de back");
        console.log(results);
        res.status(200).json({
            statusCode: 200,
            data: results
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};
