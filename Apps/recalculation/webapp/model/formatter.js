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
            if(status==1) return true;
            else return false;

        },
        formatStatusName: function(status){
            // console.log(status);
            if(status==1) return "Activo";
            else return "Inactivo";
        },

        formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString() : number;
        },

        parameterColor: function(isStatic, residue,capacity, ranges){
            // if(isNaN(residue) || residue== 0 || isStatic){
            //     return "normal";
            // }
            // else{
            //     let minRange= parseInt(ranges[0]) /100;
            //     let maxRange= parseInt(ranges[1]) /100;
            //     residue= parseInt(residue);

            //     if (residue < minRange * capacity){
	        //         return "red";
	        //     }else if (residue>(maxRange * capacity)) {
	        //         return "green";
	        //     } else if (residue <= (maxRange * capacity)) {
	        //         return "yellow";
	        //     } else {
		    //         return "normal";
		    //     }

            // }
            if(isNaN(residue) || isStatic){
                return "None";
            }
            else{
                let minRange= parseInt(ranges[0]) /100;
                let maxRange= parseInt(ranges[1]) /100;
                residue= parseInt(residue);

                if (residue < minRange * capacity){
	                return "Error";
	            }else if (residue>(maxRange * capacity)) {
	                return "Success";
	            } else if (residue <= (maxRange * capacity)) {
	                return "Warning";
	            } else {
		            return "None";
		        }

            }


            // if(isNaN(residue) || residue== 0 || isStatic){
            //     return "None";
            // }
            // else{
            //     let minRange= parseInt(ranges[0]) /100;
            //     let maxRange= parseInt(ranges[1]) /100;
            //     residue= parseInt(residue);

            //     if (residue < minRange * capacity){
	        //         return "Error";
	        //     }else if (residue>(maxRange * capacity)) {
	        //         return "Success";
	        //     } else if (residue <= (maxRange * capacity)) {
	        //         return "Warning";
	        //     } else {
		    //         return "None";
		    //     }

            // }


			



            /*if (residue < capacity * minRange){
                return 'Error';
            }else if ((capacity * maxRange ) > residue) {
                return 'Success';
            } else if ((capacity * maxRange) < residue) {
                return 'Warning';
            } else {
	            return 'None';
	        }*/

        }	
    };
});
