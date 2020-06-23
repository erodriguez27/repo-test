const config = require('../../config');
const conn = require('../db');
let dbName= 'aba_aliments_and_stages';

exports.DBfindAll = function() {
    return conn.db.any('SELECT * FROM public.$1:name',[dbName]);
};

exports.DBadd = function(element) {
  return conn.db.one('INSERT INTO public.$1:name (id_aba_breeds_and_stages, '+
                      'code, name, aliments_and_stages_order) '+
                      'VALUES ($2, $3, $4, $5) RETURNING id ',
                      [dbName, element.id_aba_breeds_and_stages,
                          element.code, element.name, element.aliments_and_stages_order]);
};

exports.DBfindById = function(element) {
    return conn.db.any("SELECT * FROM public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBfindByCode = function(element) {
    return conn.db.any("SELECT * FROM public.$1:name WHERE code = $2",[dbName, element]);
};

exports.DBfindByName = function(element) {
    return conn.db.any("SELECT * FROM public.$1:name WHERE name = $2",[dbName, element]);
};

exports.DBupdate = function(element) {
    return conn.db.one('UPDATE public.$1:name SET id_aba_breeds_and_stages = $2, '+
    'code = $3, name = $4, aliments_and_stages_order = $5 ' +
        'WHERE id = $6 RETURNING id', [dbName, element.id_aba_breeds_and_stages,
        element.code, element.name, element.aliments_and_stages_order, element.id]);
};

exports.DBdelete = function(element) {
    return conn.db.none('DELETE FROM public.$1:name WHERE id = $2',[dbName, parseInt(element)]);
};