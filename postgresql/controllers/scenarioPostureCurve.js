const DBlayer = require("../models/scenarioPostureCurve");
const DBscenario = require("../models/Scenario");
// const DBscenarioHen = require('../models/scenarioHen');

function semanaISO($fecha){

    if($fecha.match(/\//)){
        $fecha   =   $fecha.replace(/\//g,"-",$fecha);
        //Permite que se puedan ingresar formatos de fecha ustilizando el "/" o "-" como separador
    }

    $fecha   =   $fecha.split("-"); //Dividimos el string de fecha en trozos (dia,mes,año)
    $dia   =   eval($fecha[0]);
    $mes   =   eval($fecha[1]);
    $ano   =   eval($fecha[2]);

    if ($mes==1 || $mes==2){
        //Cálculos si el mes es Enero o Febrero
        $a   =   $ano-1;
        $b   =   Math.floor($a/4)-Math.floor($a/100)+Math.floor($a/400);
        $c   =   Math.floor(($a-1)/4)-Math.floor(($a-1)/100)+Math.floor(($a-1)/400);
        $s   =   $b-$c;
        $e   =   0;
        $f   =   $dia-1+(31*($mes-1));
    } else {
        //Calculos para los meses entre marzo y Diciembre
        $a   =   $ano;
        $b   =   Math.floor($a/4)-Math.floor($a/100)+Math.floor($a/400);
        $c   =   Math.floor(($a-1)/4)-Math.floor(($a-1)/100)+Math.floor(($a-1)/400);
        $s   =   $b-$c;
        $e   =   $s+1;
        $f   =   $dia+Math.floor(((153*($mes-3))+2)/5)+58+$s;
    }

    //Adicionalmente sumándole 1 a la variable $f se obtiene numero ordinal del dia de la fecha ingresada con referencia al año actual.

    //Estos cálculos se aplican a cualquier mes
    $g   =   ($a+$b)%7;
    $d   =   ($f+$g-$e)%7; //Adicionalmente esta variable nos indica el dia de la semana 0=Lunes, ... , 6=Domingo.
    $n   =   $f+3-$d;

    if ($n<0){
        //Si la variable n es menor a 0 se trata de una semana perteneciente al año anterior
        $semana   =   53-Math.floor(($g-$s)/5);
        $ano      =   $ano-1;
    } else if ($n>(364+$s)) {
        //Si n es mayor a 364 + $s entonces la fecha corresponde a la primera semana del año siguiente.
        $semana   = 1;
        $ano   =   $ano+1;
    } else {
        //En cualquier otro caso es una semana del año actual.
        $semana   =   Math.floor($n/7)+1;
    }

    return $semana+"-"+$ano; //La función retorna una cadena de texto indicando la semana y el año correspondiente a la fecha ingresada
}

exports.findLotByScenario = async function(req, res) {
    // console.log(req.body);
    // console.log(req.body.year);
    try {
        let objScenario = await DBscenario.findByStatus(1),
            scenario_id = objScenario.scenario_id;
        year = req.body.year,
        breed_id = req.body.breed_id;

        let lot_eggs = await DBlayer.DBfindLotByScenario(scenario_id, breed_id, year);
        console.log("Buscar la cantidad de gallinas por Escenario");
        //Buscar la cantidad de gallinas por Escenario
        /*let quantity_hens = await DBscenarioHen.DBfindHensByScenario(scenario_id, breed_id);
    console.log('--: ', quantity_hens)
    let quantity_hen = 0;
    
    if(quantity_hens.length) 
      quantity_hen = quantity_hens.quantity_hen;

     console.log("quantity_hens: ", quantity_hens.quantity_hen);*/


        let data = [];
        if(lot_eggs.length>0){
            let initDate = lot_eggs[0].posture_date;
            pdate = semanaISO(`${initDate.getDate()}-${initDate.getMonth()+1}-${initDate.getFullYear()}`),
            aDate = pdate.split("-"),
            weekYear = aDate[1];
            weedDay = aDate[0];
            sum = 0 ,
            searchLot = [],
            week = 1;
            //console.log('Fecha inicial: ', pdate, ' ', prev_week,' ', prev_year);

            let prev_value = lot_eggs[0].posture_date;

            for(let i = 0; i<lot_eggs.length; i++){

                //console.log("Es igual: ", prev_value,'===',lot_eggs[i].posture_date, "Week: ", week);
                if((prev_value.getTime() === lot_eggs[i].posture_date.getTime()) && week<=7){


                    if(searchLot.indexOf(lot_eggs[i].housingway_detail_id) == -1) {
                        searchLot.push(lot_eggs[i].housingway_detail_id);
                    }

                    sum += lot_eggs[i].eggs*lot_eggs[i].execution_quantity;
                }else if(week<7){
                    sum += lot_eggs[i].eggs*lot_eggs[i].execution_quantity;
                    prev_value = lot_eggs[i].posture_date;
                    week++;
                    if(searchLot.indexOf(lot_eggs[i].housingway_detail_id) == -1) {
                        searchLot.push(lot_eggs[i].housingway_detail_id);
                    }

                }else{
                    let obj = {};
                    let lots = await DBlayer.DBfindLotsByHousingDetail(searchLot);
                    let alots = lots.map(function(item) {
                        return item.lot;
                    });
                    obj.week =weedDay;
                    obj.year = weekYear;
                    obj.lot = alots.toString();
                    obj.eggs = Math.round(sum);
                    data.push(obj);
                    searchLot = [];
                    sum = 0;
                    sum = lot_eggs[i].eggs*lot_eggs[i].execution_quantity;
                    week = 1;
                    prev_value = lot_eggs[i].posture_date;
                    searchLot.push(lot_eggs[i].housingway_detail_id);

                    let posture_date = lot_eggs[i].posture_date,
                        new_date = `${posture_date.getDate()}-${posture_date.getMonth()+1}-${posture_date.getFullYear()}`,
                        info_date = semanaISO(new_date),// retorma semanaDelAnio-Anio
                        aInfo_date = info_date.split("-");

                    weekYear = aInfo_date[1];
                    weedDay = aInfo_date[0];

                }

            }
        }//Fin - No hay lotes
        /*for(let i = 0; i<lot_eggs.length; i++){
      let posture_date = lot_eggs[i].posture_date,
          new_date = `${posture_date.getDate()}-${posture_date.getMonth()+1}-${posture_date.getFullYear()}`;
      let info_date = semanaISO(new_date);// retorma semanaDelAnio-Anio
      let aInfo_date = info_date.split('-');
      console.log('info_date: ', info_date);
      if(aInfo_date[1]===year){
        console.log("Entre ", aInfo_date[0], prev_week, aInfo_date[1], prev_year);
          if(searchLot.length==0){
            console.log('Search es cero');
            prev_week = aInfo_date[0];
            prev_year = aInfo_date[1];
            console.log('pre: ', prev_week, prev_year);
          }
          console.log(aInfo_date[0], prev_week, aInfo_date[1],prev_year);
      if((aInfo_date[0]=== prev_week) && (aInfo_date[1] === prev_year)){
        sum += lot_eggs[i].eggs;
        console.log('si');
        let idx = searchLot.indexOf(lot_eggs[i].housingway_detail_id);
        console.log(idx);
        if(idx == -1) {
          searchLot.push(lot_eggs[i].housingway_detail_id);
        }
      }else{
        let obj = {};
        obj.week = prev_week;
        obj.year = prev_year;
        console.log("searchLot: ", searchLot);
        let lots = await DBlayer.DBfindLotsByHousingDetail(searchLot);

        let alots = lots.map(function(item) {
           return item.lot;
        });


        obj.lot = alots.toString();
        obj.eggs = sum;
        data.push(obj);
        searchLot = [];
        sum  = lot_eggs[i].eggs;
        prev_week = aInfo_date[0];
        prev_year = aInfo_date[1];
      }
    }else{
      //Cambie de anio para verificar si pertenece a la semana que esta corriendo
      if(prev_week==aInfo_date[0]){
        sum += lot_eggs[i].eggs;
      }
    }

    }
    if(searchLot.toString()){
      let obj = {};
      obj.week = prev_week;
      obj.year = prev_year;
      obj.lot = searchLot.toString();
      obj.eggs = sum;
      data.push(obj);
    }*/
        //console.log("data2: ", data);
        res.status(200).send({statusCode: 200, data: data});

    } catch (err) {
    // console.log(err);
        res.status(500).send( { statusCode: 500, error: err.message, errorCode: err.code } );
    }


};
