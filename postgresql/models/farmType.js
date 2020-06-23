const config = require("../../config");
const conn = require("../db");

exports.DBfindAllFarmType = function() {
    return conn.db.any("SELECT * FROM public.mdfarmtype order by name ASC");
};



exports.DbKnowFarmType = function(register) {
    let string = "SELECT name,farm_type_id FROM public.mdfarmtype WHERE name = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].farm_type_id +  "'" ;
        }else{
            string = string +" or " + "name = "+ "'" + register[index].farm_type_id + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};

exports.DbKnowFarmType2 = function(register) {
    let string = "SELECT name,farm_type_id FROM public.mdfarmtype WHERE name = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].typeOfFarm +  "'" ;
        }else{
            string = string +" or " + "name = "+ "'" + register[index].typeOfFarm + "'";
        }  
        index++;
    }
    console.log(string);
    return conn.db.any(string);
};


exports.DbKnowFarmTypeShed = function(register) {
    let string = "SELECT name,farm_type_id FROM public.mdfarmtype WHERE name = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].type_id +  "'" ;
        }else{
            string = string +" or " + "name = "+ "'" + register[index].type_id + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};

exports.DbKnowFarmTypeShed2 = function(register) {
    let string = "SELECT name,farm_type_id FROM public.mdfarmtype WHERE name = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].type +  "'" ;
        }else{
            string = string +" or " + "name = "+ "'" + register[index].type + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};