const config = require("../../config");
const conn = require("../db");

exports.DBaddNewBroilerShed = function(records) {

    //console.log("llego al modelo insertBreedingShedProgrammed")
        
    cs = conn.pgp.helpers.ColumnSet(["slbroiler_detail_id","center_id","shed_id"],
        {table: "sltxbr_shed", schema: "public"});
    return conn.db.any(conn.pgp.helpers.insert(records, cs));


};

exports.DBfindShedsByLotProg = function(lot_prog) {
    return conn.db.any(`SELECT sh.slbr_shed_id, sh.center_id, sh.shed_id, sh.lot, s.code as shed FROM sltxbr_shed sh 
                        LEFT JOIN sltxbroiler_detail br on sh.slbroiler_detail_id = br.slbroiler_detail_id
                        LEFT JOIN osshed s on sh.shed_id = s.shed_id 
                        WHERE br.lot = $1`, [lot_prog]);
};

exports.DBfindMaxLotBroiler = function() {
    
    let promise = conn.db.one("SELECT MAX(CAST((substring(lot, 2, 10)) AS INTEGER)) FROM sltxbr_shed");
    return promise;
};