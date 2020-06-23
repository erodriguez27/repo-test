const config = require("../../config");
const conn = require("../db");

exports.DBfindUsers = function() {
    console.log("user");
    return conn.db.any("SELECT * FROM public.mduser");
};

exports.DBfindUsername = function(username) {
    return conn.db.any("SELECT  COUNT(user_id) FROM public.mduser WHERE username= $1",[username]);
};

//Cambiado por Alexander
exports.DBfindApps = function(type) {
    return conn.db.any("SELECT * " +
    " FROM public.mdapplication_rol a,public.mdrol b,public.mdapplication c" +
    " WHERE b.rol_name = $1 and c.application_id = a.application_id" +
    " and a.rol_id = b.rol_id", [type]);
};

exports.DBfindUserIds = function() {
    return conn.db.any("SELECT user_id FROM public.mduser");
};

exports.DBaddUser = function(user, hashedPassword, active, name, lastname, adminName, rolid) {
    return conn.db.one("INSERT INTO public.mduser (username, password, active, name, lastname, "+
    "admi_user_creator,rol_id,creation_date)" + 
    "VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING user_id"
    , [user, hashedPassword,active, name, lastname, adminName, rolid]);
};

// exports.DBaddUser_app = function(user_id, app_id) {
//     return conn.db.none('INSERT INTO public.mduser_application (user_id,application_id) VALUES ($1, $2)', [user_id, app_id]);
// };

exports.DBeditUserType = function(user_id,rol_id) {
    return conn.db.none("UPDATE public.mduser SET rol_id = $1 WHERE user_id = $2", [rol_id,user_id]);
};

exports.DBupdateUserPassword = function(user, password) {
    return conn.db.none("UPDATE public.mduser SET password=$1"+
                        "WHERE username = $2", [password, user]);
};

exports.DBdeleteUser = function(user) {
    return conn.db.none("DELETE FROM public.mduser WHERE username = $1",[user]);
};

// Buscar Roles
exports.DBfindRols = function() {
    return conn.db.any("SELECT a.rol_id,a.rol_name FROM public.mdrol a");
};

exports.DBfindApps = function() {
    console.log("Apps");
    return conn.db.any("SELECT * FROM public.mdapplication a");
};