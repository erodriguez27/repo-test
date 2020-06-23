sap.ui.define([], function() 
{
    "use strict";

    return {
        calculateResidue: function(projected_quantity, residue) 
        {
            return (projected_quantity-residue).toLocaleString('de-DE');
        },
        formatMiles: function(number){
            return (number !== "" && number !== undefined && number !== null && !isNaN(number)) ? parseInt(number).toLocaleString('de-DE') : number;

        },
    };
});
