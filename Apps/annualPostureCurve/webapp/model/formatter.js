sap.ui.define([], function() {
    "use strict";

    return {
    /**
     * Rounds the currency value to 2 digits
     *
     * @public
     * @param {string} sValue value to be formatted
     * @returns {string} formatted currency value with 2 digits
     */
        monthDes: function(month) {

            switch (month) {
            case 1:
                return "Enero";
                break;
            case 2:
                return "Febrero";
                break;
            case 3:
                return "Marzo";
                break;
            case 4:
                return "Abril";
                break;
            case 5:
                return "Mayo";
                break;
            case 6:
                return "Junio";
                break;
            case 7:
                return "Julio";
                break;
            case 8:
                return "Agosto";
                break;
            case 9:
                return "Septiembre";
                break;
            case 10:
                return "Octubre";
                break;
            case 11:
                return "Noviembre";
                break;
            case 12:
                return "Diciembre";
                break;
            default:
                break;
            }
        },
        dateFormat: function(day) {
            if (day < 10) {
                return "0"+day ;
            } else {
                return day;
            }

        },
        formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString('de-DE') : number;
        },
        formatDate: function(date){
            let newDate = new Date(date);
            let day = `${(newDate.getDate() < 10 ? "0" : "") + newDate.getDate()}/${((newDate.getMonth() + 1) < 10 ? "0" : "") + (newDate.getMonth() + 1)}/${newDate.getFullYear()}`;
            return (day);
        },
        enableExecuted: function(n){
            return (n==null);
        }
    
    };

});
