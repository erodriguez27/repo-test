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

exports.DBaddBrooderReport = records => {
    return conn.db.none("INSERT INTO public.txbrooder (brooder_day, brooder_month, "+
                      "eggs_farm, eggs_minimum, eggs_maximum, eggs_brooder, "+
                      "old_chicks) VALUES $1",
    Inserts("${brooder_day}, ${brooder_month}, ${eggs_farm}, "+
                      " ${eggs_minimum}, ${eggs_maximum}, ${eggs_brooder}, ${old_chicks}",records));

};
