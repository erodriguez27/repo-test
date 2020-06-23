sap.ui.define([], function() {
    "use strict";

    return {
        onkg:function(valorunid, abbreviation) {
	     var result=0;
	     if(abbreviation ==="UN"){
	     	result="";
	     }else{
	     	result=valorunid;
	     }	
	     return result;	


        },
        onkg2:function(valorunid, abbreviation) {
            // console.log(valorunid);
            // console.log(abbreviation);
	     	var result=0;
	     	if(abbreviation ==="UN"){
                result=" ";
            }else{
                result="Kg";
            }	
            return result;	
        },
        enabledCreate: function(ok1, ok2){
            return (ok1 && ok2);
        },
        enabledCreate2: function(ok1, ok2, ok3, ok4){
            console.log(ok4);
            return (ok1 && ok2 && ok3 && ok4);
        },
        recordsCount: function(records) {
            return records.length;
        },
        onCapMinShed: function(capmin, width, lenght) {

            var result = 0;
            result = parseInt(capmin * (width*lenght));

            return result;
        },
        onCapMaxShed: function(capmax, width, lenght) {

            var result = 0;
            result = parseInt(capmax * (width*lenght));

            return result;
        },

    };
});
