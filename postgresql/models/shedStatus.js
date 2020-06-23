const config = require("../../config");
const conn = require("../db");

exports.DBfindAllShedStatus = function() {
    // console.log("Llegue 2");
    return conn.db.any("SELECT * FROM public.mdshedstatus order by name ASC");
};

exports.DbKnowShedStatus = function(register) {
    let string = "SELECT name,shed_status_id FROM public.mdshedstatus WHERE name = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].statusshed_id +  "'" ;
        }else{
            string = string +" or " + "name = "+ "'" + register[index].statusshed_id + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};


exports.DbKnowShedStatus2 = function(register) {
    let string = "SELECT name,shed_status_id FROM public.mdshedstatus WHERE name = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].statusShed +  "'" ;
        }else{
            string = string +" or " + "name = "+ "'" + register[index].statusShed + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};
  