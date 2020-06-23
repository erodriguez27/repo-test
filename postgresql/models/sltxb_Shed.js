const config = require("../../config");
const conn = require("../db");

exports.DBinsertBreedingShedProgrammed = function(breedingSheds) {

    console.log("llego al modelo insertBreedingShedProgrammed")
        
    cs = conn.pgp.helpers.ColumnSet(["slbreeding_id","center_id","shed_id"],
        {table: "sltxb_shed", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(breedingSheds, cs));


};

exports.DBfindShedByIdBreeding = function(id) {
    return conn.db.any(`select b.shed_id, b.code, a.slbreeding_id
                        from sltxb_shed a
                        left join osshed b on a.shed_id = b.shed_id
                        where a.slbreeding_id = $1`, [id]);
};