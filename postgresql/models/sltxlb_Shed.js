const config = require("../../config");
const conn = require("../db");

exports.DBinsertShedsByLiftBreeding = function(liftbreedingSheds) {

    //console.log("llego al modelo insertBreedingShedProgrammed")
        
    cs = conn.pgp.helpers.ColumnSet(["slliftbreeding_id","center_id","shed_id"],
        {table: "sltxlb_shed", schema: "public"});
    return conn.db.any(conn.pgp.helpers.insert(liftbreedingSheds, cs)+"RETURNING sllb_shed_id");


};

exports.DBfindShedsByLiftBreedingId = function(id) {
    return conn.db.any(`select b.shed_id, b.code, a.slliftbreeding_id
                        from sltxlb_shed a
                        left join osshed b on a.shed_id = b.shed_id
                        where a.slliftbreeding_id = $1`, [id]);
};