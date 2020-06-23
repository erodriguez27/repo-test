const config = require("../../config");
const conn = require("../db");
let dbName= "aba_consumption_and_mortality_detail";

exports.DBfindAll = function() {
    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};

exports.DBadd = function(element) {

    return conn.db.one("INSERT INTO public.$1:name (id_aba_consumption_and_mortality, "+
                      "time_unit_number, consumption, mortality) "+
                      "VALUES ($2, $3, $4, $5) RETURNING id ",
    [dbName, element.id_aba_consumption_and_mortality,
        element.time_unit_number, element.consumption,
        element.mortality]);
};

exports.DBfindById = function(element) {
    return conn.db.any("SELECT * FROM  public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBfindByConsumptionAndMortalityId = function(element) {
    return conn.db.any("SELECT * FROM  public.$1:name WHERE id_aba_consumption_and_mortality = $2",[dbName, parseInt(element.id)]);
};

exports.DBupdate = function(element) {

    return conn.db.one("UPDATE public.$1:name SET id_aba_consumption_and_mortality = $2, "+
        "time_unit_number = $3, consumption = $4, mortality = $5 " +
        "WHERE id = $6 RETURNING id", [dbName, element.id_aba_consumption_and_mortality,
        element.time_unit_number, element.consumption,
        element.mortality, element.id]);
};

exports.DBdelete = function(element) {

    return conn.db.none("DELETE FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};
