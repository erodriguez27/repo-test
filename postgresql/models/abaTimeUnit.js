const config = require("../../config");
const conn = require("../db");
let dbName= "aba_time_unit";

exports.DBfindAll = function() {
    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};
