const config = require("../../config");
const conn = require("../db");

exports.DBfindAllSilo = function() {
    return conn.db.any("SELECT * FROM public.ossilo order by silo_number ASC");
};

exports.DBfindSiloByCenter = function(center_id) {
    return conn.db.any("SELECT * FROM public.ossilo WHERE center_id = $1", [center_id]);
};


exports.DBaddSilo = function(client_id, partnership_id, farm_id, center_id, silo_number, height, diameter, total_capacity_1, total_rings_quantity, rings_height, cone_degrees) {
    return conn.db.one("INSERT INTO public.ossilo (client_id, partnership_id, farm_id, "+
                       "center_id, silo_number, height, diameter, total_capacity_1, "+
                       "total_rings_quantity, rings_height, cone_degrees) "+
                       "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) "+
                       "RETURNING silo_id", [client_id, partnership_id, farm_id,
        center_id, silo_number, height, diameter, total_capacity_1,
        total_rings_quantity, rings_height, cone_degrees]);
};

exports.DBupdateSilo = function(silo_id, silo_number, height, diameter, total_capacity_1,total_rings_quantity,rings_height,cone_degrees) {
    return conn.db.none("UPDATE public.ossilo SET silo_number = $1, height = $2, diameter = $3,"+
                        "total_capacity_1 = $4, total_rings_quantity = $5, rings_height = $6, "+
                        "cone_degrees = $7 WHERE silo_id = $8", [silo_number,
        height, diameter, total_capacity_1,total_rings_quantity,rings_height,cone_degrees,silo_id]);
};

exports.DBdeleteSilo = function(silo_id) {
    return conn.db.none("DELETE FROM public.ossilo WHERE silo_id = $1",[silo_id]);
};

exports.DBfindShedBySilo = function(silo_id) {
    return conn.db.any("SELECT a.client_id, a.partnership_id, a.farm_id, a.center_id, a.silo_id, "+
                       "a.shed_id, deleted_mark, code, b.statusshed_id, type_id, building_date, c.name as status_name, "+
                       "stall_longitude, stall_width, stall_height "+
                       "FROM public.ossilo_osshed a "+
                       "LEFT JOIN public.osshed b ON a.shed_id = b.shed_id "+
                       "LEFT JOIN public.mdshedstatus c ON b.statusshed_id = c.shed_status_id "+
                       "WHERE silo_id = $1", [silo_id]);
};

exports.DBinsertAssociation = function(silo_id, shed_id, partnership_id, farm_id, client_id, center_id){

    return conn.db.none("INSERT INTO public.ossilo_osshed (client_id, partnership_id, farm_id, center_id, silo_id, shed_id, delete_mark) "+
                     " VALUES ($1, $2, $3, $4, $5, $6, $7) ",
    [client_id, partnership_id, farm_id, center_id, silo_id, shed_id,0]);
};

exports.DBdeleteAssociation = function(silo_id, shed_id, partnership_id, farm_id, client_id, center_id){
    return conn.db.none("DELETE FROM public.ossilo_osshed "+
                      "WHERE client_id = $1 and partnership_id = $2 and farm_id = $3 and silo_id = $4 and shed_id = $5 and center_id = $6 ",
    [client_id, partnership_id, farm_id, silo_id, shed_id, center_id]);
};
