const config = require("../../config");
const conn = require("../db");

exports.DBfindApp = function(app_id) {
    return conn.db.any("SELECT * FROM public.application WHERE application_id = $1",[app_id]);
};

exports.DBaddApp = function(App_id,App_name) {
    return conn.db.one("INSERT INTO public.application (application_id,application_name) VALUES ($1, $2)", [App_id, App_name]);
};

exports.DBupdateApp = function(App_id, App_name) {
    return conn.db.none("UPDATE public.application SET application_name= $1"+
                        "WHERE application_id = $2", [App_name, App_id]);
};

exports.DBdeleteApp = function(App_id) {
    return conn.db.none("DELETE FROM public.application WHERE application_id = $1",[App_id]);
};