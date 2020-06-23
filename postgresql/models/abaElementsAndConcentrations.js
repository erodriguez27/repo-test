const config = require("../../config");
const conn = require("../db");
let dbName= "aba_elements_and_concentrations";

exports.DBfindAll = function() {

    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};

exports.DBadd = function(element) {

    return conn.db.one("INSERT INTO public.$1:name (id_aba_element, id_aba_formulation, "+
                      "proportion, id_element_equivalent, id_aba_element_property, " +
                      "equivalent_quantity) "+
                      "VALUES ($2, $3, $4, $5, $6, $7) RETURNING id ",
    [dbName, element.id_aba_element, element.id_aba_formulation,
        element.proportion, element.id_element_equivalent,
        element.id_aba_element_property, element.equivalent_quantity]);
};

exports.DBfindById = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBfindByFormulationId = function(element) {
    return conn.db.any("SELECT * FROM  public.$1:name WHERE id_aba_formulation = $2",[dbName, element.id]);
};

exports.DBupdate = function(element) {

    return conn.db.one("UPDATE public.$1:name SET id_aba_element = $2, id_aba_formulation = $3, proportion = $4, " +
        "id_element_equivalent = $5, id_aba_element_property=$6, equivalent_quantity=$7 WHERE id = $8 RETURNING id",
    [dbName, element.id_aba_element, element.id_aba_formulation,
        element.proportion, element.id_element_equivalent,
        element.id_aba_element_property, element.equivalent_quantity, element.id]);
};

exports.DBdelete = function(element) {

    return conn.db.none("DELETE FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};
