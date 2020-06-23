const config = require("../../config");
const conn = require("../db");

exports.DBfindAllWarehouse = function() {
    return conn.db.any("SELECT * FROM public.oswarehouse order by name ASC");
};

exports.DBbulkAddWarehouse = function(warehouses){
    cs = conn.pgp.helpers.ColumnSet(["partnership_id", "farm_id", "name", "code"], {table: "oswarehouse", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(warehouses, cs));
};

exports.DBaddWarehouse = function(partnership_id, farm_id, name, code) {
    return conn.db.one("INSERT INTO public.oswarehouse (partnership_id, farm_id, name, code) VALUES ($1, $2, $3, $4) RETURNING warehouse_id", [partnership_id,
        farm_id, name, code]);
};

exports.DBfindWarehouseByFarm = function(farm_id) {
    return conn.db.any("SELECT warehouse_id,partnership_id, farm_id, name, code, false as associated " +
                       "FROM public.oswarehouse WHERE farm_id=$1 order by name ASC", [farm_id]);
};

exports.DBupdateWarehouse = function(partnership_id, farm_id, warehouse_id, name, code) {
    console.log("lo del modelo");
    console.log(partnership_id);
    console.log(farm_id);
    console.log(warehouse_id);
    console.log(name);
    console.log(code);
    //   console.log(partnership_id+' '+farm_id+' '+name+' '+client_id+' '+code+ 'warehouse_id: '+warehouse_id);
    return conn.db.none("UPDATE public.oswarehouse SET name = $1, code = $2 "+
                        "WHERE partnership_id = $3 and farm_id = $4 and warehouse_id = $5 ", 
    [name, code, partnership_id, farm_id, warehouse_id]);
};

exports.DBdeleteWarehouse = function(warehouse_id) {
    return conn.db.none("DELETE FROM public.oswarehouse WHERE warehouse_id = $1",[warehouse_id]);
};

exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1"+
        "FROM public.oswarehouse ");
};