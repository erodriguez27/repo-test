const config = require("../../config");
const conn = require("../db");


exports.DBfindDateRange = function(init_date, end_date, shed_id) {
//   console.log('aqui ', init_date, end_date, shed_id);
    return conn.db.any("SELECT count(*) FROM txavailabilitysheds "+
                       "WHERE (init_date, end_date) OVERLAPS ( $1 , $2 ) and shed_id = $3", [init_date, end_date, shed_id]);
};


function Inserts(template, data) {
    if (!(this instanceof Inserts)) {
        return new Inserts(template, data);
    }

    this._rawDBType = true;
    this.formatDBType = function() {
        return data.map(d => "(" + conn.pgp.as.format(template, d) + ")").join(",");
    };
}

exports.DBaddAvailabilityShed = function(group) {
// console.log('addAvailabilityShed', group );
    return conn.db.none("INSERT INTO public.txavailabilitysheds (shed_id,init_date, end_date, lot_code ) VALUES $1",
        Inserts("${shed_id}, ${initDate}, ${endDate}, ${lot_code} ",group));

};
