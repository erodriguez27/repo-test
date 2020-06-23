sap.ui.define([], function() {
	"use strict";

	return {
		formatMiles: function(number){
            return (number !== "" && !isNaN(number)) ? number.toLocaleString() : number;
        },
	};

});
