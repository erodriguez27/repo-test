sap.ui.define([], function() {
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString('de-DE');
        },
        formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString('de-DE') : number;
        },
         formatMilesP: function(eggs_executed,quantity,plexus){
            let ret;
            if(plexus){
                ret=(quantity !== "" && !isNaN(quantity)) ? quantity.toLocaleString('de-DE') : quantity;
            }else{
                ret = (eggs_executed !== "" && !isNaN(eggs_executed)) ? eggs_executed.toLocaleString('de-DE') : eggs_executed;
            }
            return ret
        },
        formatDays: function(date){
            let aDay=["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                aDate = date.split("-"),
                dt = new Date(aDate[2], aDate[1]-1, aDate[0]);
            return `${aDay[dt.getUTCDay()]} ${aDate[0]}/${aDate[1]}/${aDate[2]}`;
        },
        formatAjuste: function(ajus){

            if (ajus == "Ajuste") {
                ajus = "Ajuste Ingreso";
            }else{
                ajus = "Ajuste Egreso";
            }
            return ajus;
        },
        formatDate: function(date){

            if(date!== null){
                let c= "/";//caracter separatos
                date= new Date(date.toString());
                if(!isNaN( date.getFullYear() )){
                    date= ( ((date.getDate()<10)? "0"+date.getDate(): date.getDate() )+c+
							((date.getMonth()+1<10)? "0"+(date.getMonth()+1): date.getMonth()+1 )+c+
							date.getFullYear() );
                }
                else
                    date=null;
            }
            return (date);
        },
        /*Convierto la fecha a un objeto de tipo fecha javascript para poder usarlo como minDate */
        formatDateJ: function(date){
            console.log(date.toString());
            if(date!== null){
                let c= "/";//caracter separatos
                date= new Date(date.toString());
                if(isNaN( date.getFullYear() )){
                    date=null;
                }
                    
            }
            return (date);
        },

        formatDateE: function(date){
            let aux = date.split("/"),
                objDate = new Date(aux[2]+"/"+aux[1]+"/"+aux[0]);
            return (objDate);
        },
        showBtnForLength: function(records){
            return (records!== null && records.length>0);
        },
        formatIcon: function(value){
            if(value=== true){
                return("sap-icon://search");
            }else{
                return("sap-icon://add");
            }
        }
    };
});
