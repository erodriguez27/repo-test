const config = require("../../config");
const conn = require("../db");

exports.DBaddHousinhWayLot = function() {

    return conn.db.one(`INSERT INTO public.txhousigway_lot (production_id, housingway_id, quantity, stage_id) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING housigway_lot_id `,
    [production_id, housingway_id, quantity, stage_id]);

};