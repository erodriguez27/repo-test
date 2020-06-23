sap.ui.define([], function(){
    "use strict";

    return {
        formatDate: function(date) {
            var aux = new Date(date);
            var returnDate = aux.getMonth() + 1 < 10 ? "0" + (aux.getMonth() + 1) : aux.getMonth() + 1;

            return returnDate + "-" + aux.getFullYear();
        },
        formatDecimal: function(number){
            return parseFloat(number).toFixed(2);
        },
        formatColor: function(a){
            // console.log(a);
            return "inputColorParameter";
        },
        formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString() : number;
        },
        formatStatus: function(status){
            if(status==1) return "Success";
            else return "Error";

        },
        formatStatusName: function(status){
            // console.log(status);
            if(status==1) return "Activo";
            else return "Inactivo";
        }
    };
});
