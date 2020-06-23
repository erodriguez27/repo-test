sap.ui.define([], function() {
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString('de-DE');
        },
        calculateResidue2: function(projected_quantity, residue, partial_residue = 0) {
            return (projected_quantity - residue - partial_residue).toLocaleString('de-DE');
        },
        sumResidues: function(records = []) {
            const sum = records.reduce((result, actual) => {
                return result + actual.projected_quantity - actual.residue;
            }, 0);
            return sum.toLocaleString('de-DE');
        },

        formatMiles: function(number){
            return (number !== "" && number !== undefined && number !== null && !isNaN(number)) ? parseInt(number).toLocaleString('de-DE') : number;

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

        enabledSaveBtn: function(records){
            return(records.length>0);
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
    };
});
