const config = require("../../config");
const conn = require("../db");
let dbName= "aba_stages_of_breeds_and_stages";

exports.DBfindAll = function() {

    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};

exports.DBadd = function(element) {

    return conn.db.one("INSERT INTO public.$1:name (id_aba_breeds_and_stages, "+
                      "id_formulation, name, duration) "+
                      "VALUES ($2, $3, $4, $5) RETURNING id ",
    [dbName, element.id_aba_breeds_and_stages,
        element.id_formulation, element.name, element.duration]);
};

exports.DBfindById = function(element) {

    return conn.db.any("SELECT * FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBfindByName = function(element) {

    return conn.db.any("SELECT * FROM public.$1:name WHERE name = $2",[dbName, element]);
};

exports.DBfindByIdBreedsAndStages = function(element) {

    return conn.db.any("SELECT * FROM public.$1:name WHERE id_aba_breeds_and_stages = $2",[dbName, element]);
};

exports.DBupdate = function(element) {

    return conn.db.one("UPDATE public.$1:name SET id_aba_breeds_and_stages = $2, "+
    "id_formulation = $3, name = $4, duration = $5 " +
        "WHERE id = $6 RETURNING id", [dbName, element.id_aba_breeds_and_stages,
        element.id_formulation, element.name, element.duration, element.id]);
};

exports.DBdelete = function(element) {

    return conn.db.none("DELETE FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};
