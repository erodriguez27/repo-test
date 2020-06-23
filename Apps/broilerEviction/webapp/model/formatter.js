sap.ui.define([], function() {
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString('de-DE');
        },
        formatMiles: function(number){
            return (number !== "" && number !== undefined && number !== null && !isNaN(number)) ? parseInt(number).toLocaleString('de-DE') : number;

        },
        formatFloatMiles: function(number){
            return (number !== "" && number !== undefined && number !== null && !isNaN(number)) ? parseFloat(number).toFixed(2).toLocaleString('de-DE') : number;

        },
        formatGender: function(gender){
            return (gender === "H") ? "Hembra" : "Macho";

        },
        formatStatus:function(status){
            let ret;
            if(parseInt(status) < 0){
                ret = "Error";
				
            }else{
                if(parseInt(status) >= 0){
				  ret = "Success";
				  
                }else{
				  ret = "None";
                }
            }
            return ret;
        },
        formaticon: function(value){
            let ret;
            if (value=== true){
                ret = "sap-icon://accept";
            }else{
                ret = "sap-icon://decline";
            }

            return(ret);

        },
        formatcolor: function(value){
            let ret;
            if (value=== true){
                ret = "green";
            }else{
                ret = "red";
            }

            return(ret);

        },
        formatVisible: function(value, value2){
          
            return !(value||value2);
        }
        // formatVisible: function(value){
        // 	return !value
        // }
    };
});
