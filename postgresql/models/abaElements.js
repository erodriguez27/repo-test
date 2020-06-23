const config = require('../../config');
const conn = require('../db');
let dbName= 'aba_elements';

exports.DBfindAll = function() {
    return conn.db.any('SELECT * FROM public.$1:name',[dbName]);
};

exports.DBadd = function(element) {
  return conn.db.one('INSERT INTO public.$1:name (code, '+
                      'name, id_aba_element_property, equivalent_quantity) '+
                      'VALUES ($2, $3, $4, $5) RETURNING id ',
                      [dbName, element.code, element.name, element.id_aba_element_property, element.equivalent_quantity]);
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
    return conn.db.one('UPDATE public.$1:name SET code = $2, name = $3, ' +
        'id_aba_element_property = $4, equivalent_quantity = $5 ' +
        'WHERE id = $6 RETURNING id', [dbName, element.code, element.name,
        element.id_aba_element_property, element.equivalent_quantity, element.id,]);
};

exports.DBdelete = function(element) {
    return conn.db.none('DELETE FROM public.$1:name WHERE id = $2',[dbName, parseInt(element.id)]);
};
