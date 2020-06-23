const config = require("../../config");
const conn = require("../db");
let dbName= "aba_results";

exports.DBfindAll = function() {

    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};

exports.DBadd = function(element) {

    return conn.db.one("INSERT INTO public.$1:name (id_aba_element, "+
                      "quantity) "+
                      "VALUES ($2, $3) RETURNING id ",
    [dbName, element.id_aba_element, element.quantity]);
};

exports.DBfindById = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBupdate = function(element) {

    return conn.db.one("UPDATE public.$1:name SET id_aba_element = $2, quantity = $3 " +
        "WHERE id = $4 RETURNING id", [dbName, element.id_aba_element, element.quantity, element.id]);
};

exports.DBdelete = function(element) {

    return conn.db.none("DELETE FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};
