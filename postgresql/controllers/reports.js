const DBlayer = require("../models/reports");



exports.findLiftBreeding = async function(req, res)
{
    console.log("llego al controlador de back de levante con los datos:");
    console.log(req.body);


    try {

        let date1 = req.body.date1,
            date2 = req.body.date2,
            breed_id = req.body.breed_id,
            partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            tod = false;
        let records = [];
        let aDate = date1.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let aDate2 = date2.split("-"),
            end_date = `${aDate2[2]}-${aDate2[1]}-${aDate2[0]}`;


        console.log("LA FECHA");
        console.log(init_date);
        console.log(end_date);

        if(breed_id==="Todas"){
            records = await DBlayer.DBfindAllLiftBreeding(init_date, end_date, partnership_id, scenario_id);
            console.log("los records", records);
            tod = true;
        }else{
            records = await DBlayer.DBfindLiftBreeding(init_date, end_date, breed_id, partnership_id, scenario_id);
            console.log("los records", records);
        }

    
    

        // records.forEach(element => {
        //   if(parseInt(element.diferentquantity)<0){
        //     element.state = "Error";
        
        //   }else{
        //     if(parseInt(element.diferentquantity)>0){
        //       element.state = "Success";
          
        //     }else{
        //       element.state = "None";
        //     }
        //   }
    
      
        // });
    
        console.log(records);
        res.status(200).json({
            statusCode: 200,
            data: records,
            raza:tod
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findBreeding = async function(req, res)
{
    console.log("llego al controlador de back de reproductora con los datos:");
    console.log(req.body);


    try {

        let date1 = req.body.date1,
            date2 = req.body.date2,
            breed_id = req.body.breed_id,
            partnership_id = req.body.partnership_id,
            scenario_id = req.body.scenario_id,
            tod = false;
        let records = [];

        let aDate = date1.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let aDate2 = date2.split("-"),
            end_date = `${aDate2[2]}-${aDate2[1]}-${aDate2[0]}`;


        console.log("LA FECHA");
        console.log(init_date);
        console.log(end_date);

        if(breed_id==="Todas"){
            records = await DBlayer.DBfindAllBreeding(init_date, end_date, partnership_id, scenario_id);
            console.log("los records", records);
            tod = true;
        }else{
            records = await DBlayer.DBfindBreeding(init_date, end_date, breed_id, partnership_id, scenario_id);
            console.log("los records", records);
        }


        // records.forEach(element => {
        //   if(parseInt(element.diferentquantity)<0){
        //     element.state = "Error";
        
        //   }else{
        //     if(parseInt(element.diferentquantity)>0){
        //       element.state = "Success";
          
        //     }else{
        //       element.state = "None";
        //     }
        //   }
    
      
        // });




        console.log(records);
        res.status(200).json({
            statusCode: 200,
            data: records,
            raza:tod
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};




exports.findBroiler = async function(req, res)
{
    console.log("llego al controlador de back de engorde con los datos:");
    console.log(req.body);


    try {

        let date1 = req.body.date1,
            date2 = req.body.date2,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            tod = false;
        let records = [];

        let aDate = date1.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let aDate2 = date2.split("-"),
            end_date = `${aDate2[2]}-${aDate2[1]}-${aDate2[0]}`;


        console.log("LA FECHA");
        console.log(init_date);
        console.log(end_date);

        if(breed_id==="Todas"){
            records = await DBlayer.DBfindAllBroiler(init_date, end_date, scenario_id);
            console.log("los records", records);
            tod = true;
        }else{
            records = await DBlayer.DBfindBroiler(init_date, end_date, breed_id, scenario_id);
            console.log("los records", records);
        }

        // records.forEach(element => {
        //   if(parseInt(element.diferentquantity)<0){
        //     element.state = "Error";
        
        //   }else{
        //     if(parseInt(element.diferentquantity)>0){
        //       element.state = "Success";
          
        //     }else{
        //       element.state = "None";
        //     }
        //   }
    
      
        // });


        console.log(records);
        res.status(200).json({
            statusCode: 200,
            data: records,
            raza:tod
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};

exports.findBroilerEviction = async function(req, res)
{
    console.log("llego al controlador de back de engorde con los datos:");
    console.log(req.body);


    try {

        let date1 = req.body.date1,
            date2 = req.body.date2,
            breed_id = req.body.breed_id,
            scenario_id = req.body.scenario_id,
            type_bird = req.body.type_bird,
            tod = false;
        let records = [];
console.log("escenario:::::", req.body);
        let aDate = date1.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let aDate2 = date2.split("-"),
            end_date = `${aDate2[2]}-${aDate2[1]}-${aDate2[0]}`;


        console.log("LA FECHA");
        console.log(init_date);
        console.log(end_date);

        if(breed_id==="Todas"){
            records = await DBlayer.DBfindAllBroilerEviction(init_date, end_date, scenario_id, type_bird);
            console.log("los records", records);
            tod = true;
        }else{
            records = await DBlayer.DBfindBroilerEviction(init_date, end_date, breed_id, scenario_id, type_bird);
            console.log("los records", records);
        }

        // records.forEach(element => {
        //   if(parseInt(element.diferentquantity)<0){
        //     element.state = "Error";
        
        //   }else{
        //     if(parseInt(element.diferentquantity)>0){
        //       element.state = "Success";
          
        //     }else{
        //       element.state = "None";
        //     }
        //   }
    
      
        // });


        console.log(records);
        res.status(200).json({
            statusCode: 200,
            data: records,
            raza:tod
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};
//Aqui estuvo Fabi


exports.findIncubator = async function(req, res)
{
    console.log("llego al controlador de back de engorde con los datos:");
    console.log(req.body);


    try {

        let date1 = req.body.date1,
            date2 = req.body.date2,
            breed_id = req.body.breed_id;

        let aDate = date1.split("-"),
            init_date = `${aDate[2]}-${aDate[1]}-${aDate[0]}`;

        let aDate2 = date2.split("-"),
            end_date = `${aDate2[2]}-${aDate2[1]}-${aDate2[0]}`;


        console.log("LA FECHA");
        console.log(init_date);
        console.log(end_date);

    
        console.log("LA raza");
        console.log(breed_id);
        let records;
        if (parseInt(breed_id) == 0) 
        {
            records = await DBlayer.DBFindIncubatorAllBreed(init_date, end_date);
        }
        else{
            records = await DBlayer.DBFindIncubator(init_date, end_date, breed_id);
        }
        // let records = await DBlayer.DBFindIncubator(init_date, end_date, breed_id);


        console.log("la respuesta en incubadora");
        console.log(records);
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


