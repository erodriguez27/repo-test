const config = require("../../config");
const conn = require("../db");
let dbName= "aba_elements_properties";

exports.DBfindAll = function() {

    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};

exports.DBadd = function(element) {

    return conn.db.one("INSERT INTO public.$1:name (code, "+
                      "name) "+
                      "VALUES ($2, $3) RETURNING id ",
    [dbName, element.code, element.name]);
};

exports.DBfindById = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBfindByCode = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE code = $2",[dbName, element]);
};

exports.DBfindByName = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE name = $2",[dbName, element]);
};

exports.DBupdate = function(element) {

    return conn.db.one("UPDATE public.$1:name SET code = $2, name = $3 " +
        "WHERE id = $4 RETURNING id", [dbName, element.code, element.name, element.id]);
};

exports.DBdelete = function(element) {

    return conn.db.none("DELETE FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};
