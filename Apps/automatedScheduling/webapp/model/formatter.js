sap.ui.define(["sap/m/MessageToast"], function(MessageToast) {
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) {
            return (projected_quantity-residue).toLocaleString();
        },
        calculateResidue2: function(projected_quantity, residue, partial_residue = 0) {
            return (projected_quantity - residue - partial_residue).toLocaleString();
        },
        sumResidues: function(records = []) {
            const sum = records.reduce((result, actual) => {
                return result + actual.projected_quantity - actual.residue;
            }, 0);
            return sum.toLocaleString();
        },
        selectableRow: function(projections = [], row) {
            if (projections.length === 0) {
                return "Active";
            }
		
            if (row.breed_name !== projections[0].breed_name || row.projected_date !== projections[0].projected_date) {
                return "Inactive";
            }

            else {
                return "Active";
            }
        },
        formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString() : number;
        },
        formatDate: function(date){
            let aDay=["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
                aDate = date.split("/"),
                dt = new Date(aDate[2], aDate[1]-1, aDate[0]);
            return `${aDay[dt.getUTCDay()]} ${aDate[0]}`;
        },
        formatFecha: function(date){
            let newDate = new Date(date);
            console.log(newDate)
            let month = newDate.getMonth()+1
                let day = newDate.getDate()+1
                let ndate = newDate.getFullYear() + '-' + ('0'+month).slice(-2) + '-' + ('0'+day).slice(-2)
                return ndate
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
            console.log(value, value2);
            console.log(!value||!value2);
            return !(value||value2);
        }
        // formatVisible: function(value){
        // 	return !value
        // }
    };
});
