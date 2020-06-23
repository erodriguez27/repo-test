sap.ui.define([], function() {
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString();
        },
        formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString() : number;
        },
        formatDate: function(date){
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
            return (projected_quantity-residue).toLocaleString();
        },


		



    };
});
