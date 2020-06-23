const config = require("../../config");
const conn = require("../db");

exports.DBfindUserApps = function(user_id) {
    return conn.db.any("SELECT b.application_name, b.tile_number, b.application_id FROM public.user_application a, public.application b WHERE b.application_id = a.application_id",[user_id]);
};

exports.DBaddUserApp = function(user_app_id,user_id, App_id) {
    return conn.db.one("INSERT INTO public.mduser_application (user_app_id,user_id,application_id) VALUES ($1, $2, $3)", [user_app_id,user_id, App_id]);
};

exports.DBdeleteUserApp = function(user_id) {
    return conn.db.none("DELETE FROM public.mduser_application WHERE user_id = $1",[user_id]);
};