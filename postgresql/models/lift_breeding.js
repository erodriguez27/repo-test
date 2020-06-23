const config = require("../../config");
const conn = require("../db");

function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }
    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBfindLotByFarm = function(status, farm_id) {
    return conn.db.any("SELECT a.farm_id, a.shed_id, b.code as shed_name, lot_id, lot_code, "+
                       "TO_CHAR(proyected_date, 'DD-MM-YYYY') as proyected_date, proyected_quantity, "+
                       "(CASE WHEN sheduled_date is not null THEN TO_CHAR(sheduled_date, 'DD-MM-YYYY') ELSE '' END) as sheduled_date, "+
                       "sheduled_quantity, group_number, birds_group, "+
                       "(SELECT SUM(proyected_quantity) as quantity FROM txlot WHERE housing_way_id = a.housing_way_id) "+
                       "FROM public.txlot a "+
                       "LEFT JOIN public.osshed b ON a.shed_id = b.shed_id "+
                       "LEFT JOIN public.txhousingway c ON a.housing_way_id = c.housing_way_id "+
                       "WHERE status= $1 and a.farm_id = $2"+
                       " order by lot_id ASC", [status, farm_id]);
};


/*
exports.DBupdateLots = function(lot_id, sheduled_date, sheduled_quantity) {
  console.log(lot_id, sheduled_date, sheduled_quantity);
    return conn.db.none('UPDATE public.txlot SET sheduled_date = $1, sheduled_quantity = $2 '+
                        'WHERE lot_id = $3', [sheduled_date, sheduled_quantity, lot_id]);
};*/

exports.DBaddLiftBreedinglots = records => {

    return conn.db.none("INSERT INTO public.txlot (farm_id ,  lot_code , proyected_date , proyected_quantity, "+
                      "shed_id, sheduled_date, sheduled_quantity) VALUES $1",
    Inserts("${farm_id} , ${lot_code} , ${proyected_date} ,${proyected_quantity}, "+
                      "${shed_id}, ${sheduled_date}, ${sheduled_quantity} ",records));

};


