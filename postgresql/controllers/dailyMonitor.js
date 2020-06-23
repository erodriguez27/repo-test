const DBlayer = require("../models/dailyMonitor");

exports.findLiftBreedingMonitor = function(req, res) 
{
    console.log("monitor. llego al controlador levante");

    console.log(req.body.fecha);

    DBlayer.DBliftBreedingMonitor(req.body.fecha, req.body.fecha2, req.body.stage_id, req.body.partnership_id)
        .then(function(data) 
        {
            console.log("lo retornado controlador levante");
            console.log(data);
            console.log("finalizo lo retornado controlador levante");
            let dActual = data[0].scheduled_date,
                fech = new Date(dActual),
                dias = parseInt(data[0].duracion_dias);
            console.log(fech.getDate()+dias, dias, dActual);
            fech.setDate(fech.getDate() + dias);
            console.log("fech", fech);
            let fechaN = fech.getDay() + "/" + ( fech.getMonth()+1 ) + "/" + fech.getFullYear();
            console.log("Nueva fecha: ", fechaN);
          
            res.status(200).json({
                statusCode: 200,
                data: data  
            });
        })
        .catch(function(err) 
        {
            res.status(500).send(err);
        });
};

exports.findBreedingMonitor = function(req, res) 
{
    console.log("monitor. llego al controlador produccion");
    console.log(req.body);
    DBlayer.DBfindBreedingMonitor(req.body.fecha, req.body.fecha2, req.body.partnership_id)
        .then(function(data) 
        {
            console.log("lo retornado controlador produccion");
            console.log(data);
            console.log("finalizo lo retornado controlador produccion");
          
            res.status(200).json({
                statusCode: 200,
                data: data
                
            });
        })
        .catch(function(err) 
        {
            res.status(500).send(err);
        });
};

exports.findColdRoom = function(req, res) 
{
    DBlayer.DBfindColdRoom(req.body.fecha, req.body.fecha2, req.body.partnership_id, req.body.scenario_id)
        .then(function(data) 
        {
          
            res.status(200).json({
                statusCode: 200,
                data: data
                
            });
        })
        .catch(function(err) 
        {
            res.status(500).send(err);
        });
};


exports.findIncubatorMonitor = function(req, res) 
{
    console.log("monitor. llego al controlador incubadora");
    console.log(req.body);
  
    DBlayer.DBfindincubatorMonitor(req.body.fecha, req.body.fecha2, req.body.partnership_id)
        .then(function(data) 
        {
            console.log("lo retornado controlador incubadora");
            console.log(data);
            console.log("finalizo lo retornado controlador incubadora");
            res.status(200).json({
                statusCode: 200,
                data: data        
            });
        })
        .catch(function(err) 
        {
            res.status(500).send(err);
        });
};

exports.findBroilerMonitor = async function(req, res) 
{
    console.log("monitor. llego al controlador engorde");
    try 
    {
        let partnership_id = req.body.partnership_id,
            date = req.body.fecha;

        let results = await DBlayer.DBfindBroilerMonitor(req.body.fecha, req.body.fecha2, req.body.partnership_id);
        console.log("se trajo de engorde");
        console.log("lo retornado controlador engorde");
        console.log(results); 
        console.log("finalizo lo retornado controlador engorde");
        for(let i = 0; i< results.length; i++)
        {
            let aBroiler_product = await DBlayer.DBfindProductByLot(results[i].lot);
            results[i].product = aBroiler_product;
            console.log(results);
            if (results[i]["execution_quantity"]=== null || results[i]["execution_quantity"]<= 0){
                results[i]["available"]= true;
            }
            else
            {
                results[i]["available"]= false;
            }
        }

        let residue_programmed = 0;
        results.forEach(item => 
        {
            residue_programmed += item.scheduled_quantity;
        });

        res.status(200).json({
            statusCode: 200,
            data: results,
            residue: residue_programmed
        });

    } 
    catch (err) 
    {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};


exports.findBroilerEvictionMonitor = async function(req, res) 
{
    try 
    {
        let partnership_id = req.body.partnership_id,
            date = req.body.fecha;

        let results = await DBlayer.DBfindBroilerEvictionMonitor(req.body.fecha, req.body.fecha2, req.body.partnership_id);
        let dateProg, dateEjec, aDate;

        for(let i = 0; i< results.length; i++)
        {
            results[i]["available"]= (results[i]["execution_date"]=== null)? true: false;

            dateProg= results[i].scheduled_date;
            aDate=  ((dateProg.getDate() )<10? "0"+(dateProg.getDate()): (dateProg.getDate() )) +"/"+
              ((dateProg.getMonth() + 1)<10? "0"+(dateProg.getMonth() + 1): (dateProg.getMonth() + 1) ) + "/" +
              dateProg.getFullYear();
      
            results[i].scheduled_date= aDate;

            if (results[i].execution_date!== undefined && results[i].execution_date!== null)
            {
                dateEjec= results[i].execution_date;
                aDate=  ((dateEjec.getDate() )<10? "0"+(dateEjec.getDate()): (dateEjec.getDate() )) +"/"+
                ((dateEjec.getMonth() + 1)<10? "0"+(dateEjec.getMonth() + 1): (dateEjec.getMonth() + 1) ) + "/" +
                dateEjec.getFullYear();
                results[i].execution_date= aDate;
            }

            let aBroiler_product = await DBlayer.DBfindProductByLotBE(results[i].lot);
            results[i].product = aBroiler_product;
        }
  
        console.log("traido de back desalojo");
        console.log(results);
        res.status(200).json({
            statusCode: 200,
            data: results
        });
    } 
    catch (err) 
    {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};









