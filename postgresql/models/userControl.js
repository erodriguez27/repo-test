const config = require("../../config");
const conn = require("../db");

exports.DBfindUser = function(username) {
    return conn.db.any("SELECT user_id, username, type_user, name, lastname, active FROM public.mduser WHERE username = $1",[username]);
};

exports.DBlogin = function(user_id) {
    return conn.db.any("SELECT password FROM public.mduser WHERE user_id = $1",[user_id]);
};

exports.DBaddUser = function(user, password, type_user) {
    return conn.db.one("INSERT INTO public.mduser (username, password, type_user) VALUES ($1, $2, $3)", [user, password,type_user]);
};

exports.DBupdateUserPermissions = function(user, technicalConfiguration, scenarymainteinance, liftBreeding, breedingplanningm, anualposturecurve, incubatorplanningm, broilerplanningm, broilereviction) {
    return conn.db.none("UPDATE public.mduser SET technicalConfiguration=$1, scenarymainteinance=$2, liftBreeding=$3, breedingplanningm=$4, anualposturecurve=$5, incubatorplanningm=$6, broilerplanningm=$7, broilereviction=$8"+
                        "WHERE username = $9", [technicalConfiguration, scenarymainteinance, liftBreeding, breedingplanningm, anualposturecurve, incubatorplanningm, broilerplanningm, broilereviction, user]);
};

exports.DBupdateUserPassword = function(user_id, password) {
    return conn.db.none("UPDATE public.mduser SET password=$1 WHERE user_id = $2", [password, user_id]);
};

exports.DBeditUserAct = function(user_id, active) {
    return conn.db.none("UPDATE public.mduser SET active= $1 WHERE user_id = $2", [active, user_id]);
};

exports.DBdeleteUser = function(user) {
    return conn.db.none("DELETE FROM public.mduser WHERE username = $1",[user]);
};

exports.User = function(username) {
    return conn.db.any("SELECT * FROM  public.mduser WHERE username=$1 ", [username]);
};

exports.grabUserCredentials = function(user_id) {
    return conn.db.any("SELECT * FROM  public.mduser WHERE user_id=$1 ", [user_id]);
};