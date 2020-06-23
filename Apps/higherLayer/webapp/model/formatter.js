sap.ui.define([], function() {
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString('de-DE');
        },
        formatMiles: function(number){
            number = (number !== "" && !isNaN(number) && number !== null && number !== undefined) ? parseInt(number) : number;
            return (number !== "" && !isNaN(number) && number !== null && number !== undefined) ? number.toLocaleString('de-DE') : number;
        },
        formatMilesBalance: function(number, number2){
            let ret;
            number = (number !== "" && !isNaN(number) && number !== null && number !== undefined) ? parseInt(number) : number;
            number2 = (number2 !== "" && !isNaN(number2) && number2 !== null && number2 !== undefined) ? parseInt(number2) : number2;
            if(number !== "" && !isNaN(number) && number !== null && number !== undefined && number2 !== "" && !isNaN(number2) && number2 !== null && number2 !== undefined){
                ret = number - number2;
                ret = ret.toLocaleString('de-DE'); 
            }else{
                if(number !== "" && !isNaN(number) && number !== null && number !== undefined){
                    ret = number.toLocaleString('de-DE');
                }else{
                    ret = number2.toLocaleString('de-DE');
                }
            }
            return ret;
        },
        formatDate: function(date){
            let aDay=["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                aDate = date.split("-"),
                dt = new Date(aDate[2], aDate[1]-1, aDate[0]);
            return `${aDay[dt.getUTCDay()]} ${aDate[0]}/${aDate[1]}/${aDate[2]}`;
        },
        formatStatus:function(status){
            let ret;
            if(parseInt(status) === 0){
                ret = "Error";

            }else{
                if(parseInt(status) > 0){
                  ret = "None";

                }
            }
            return ret;
        },
        formatAjuste: function(ajus){

            if (ajus == "Ajuste") {
                ajus = "Ajuste Ingreso";
            }else{
                ajus = "Ajuste Egreso";
            }
            return ajus;
        },
        formatDate2: function(date){
            if(date!== null){
                let aDay=["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
                date= new Date(date.toString());
                let c="/";
                date= aDay[date.getUTCDay()]+ "\n"+ date.getDate()+c+(date.getMonth()+1)+c+date.getFullYear();
            }
            return(date);
        },
        formatDate3: function(date){
            if(date!== null && date!== undefined){

                date= new Date(date.toString());
                let c="/";
                date = date.getDate()+c+(date.getMonth()+1)+c+date.getFullYear();
            }
            return(date);
        },
        formatAntiguedad: function(init_date){
            let diasdif;
            if(init_date!== null){
                let date = new Date();
                init_date = new Date(init_date.toString());
                console.log(date);
                console.log(init_date);

                diasdif= date.getTime()-init_date.getTime();
                diasdif = Math.round(diasdif/(1000*60*60*24))+1;

                console.log(diasdif);
                // date = new Date()

                // let fecha1 = new Date(init_date.toString());
                // let fecha2 = new Date(date.toString());
                // 	console.log("las dos fechas")
                // console.log(fecha1)
                // console.log(fecha2)

                // console.log(fecha2.diff(fecha1, 'days'), ' dias de diferencia');

            }
            return(diasdif);
        },
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString('de-DE');
        },

        formatVisibleVerification: function(from, breading, buy, curve) {
            console.log(from, breading, buy, curve)

            return (from && breading && !curve && !buy);
        },

        formatColorFrom : function(value){

          console.log("Value---->", value)
          if(value == true){
            value = "red"
          }else
              if(value == false){
                value = "green"
          }else
            if(value == "warning"){
            value ="yellow"
          }
          return value
        },
      formatIcon : function(value){
          if(value == true || value == "warning" ){
            value = "sap-icon://accept";
          }else
              if(value == false){

                value = "sap-icon://accept";

          }
          console.log(value)
          return(value);

      }



    };
});
