const config = require("../../config");
const conn = require("../db");

/*
Funcion que añade un dia feriado a un calendario
*/
exports.DBfindAllStage = function() {
    return conn.db.any("SELECT * FROM public.mdstage order by order_ ASC");
};

exports.DBaddStage = function(order, name) {
    return conn.db.one("INSERT INTO public.mdstage (order_, name ) VALUES ($1, $2) RETURNING stage_id", [order, name]);
};

exports.DBupdateStage = function(order_, name, stage_id) {
    return conn.db.none("UPDATE public.mdstage SET order_ = $1, name = $2 "+
                        "WHERE stage_id = $3", [order_, name, stage_id]);
};

exports.DBdeleteStage = function(stage_id) {
    return conn.db.none("DELETE FROM public.mdstage WHERE stage_id = $1",[stage_id]);
};
