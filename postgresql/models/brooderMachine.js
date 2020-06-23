const config = require("../../config");
const conn = require("../db");

exports.DBfindMachineByPartnership = function(partnership_id) {

    return conn.db.any("SELECT a.partnership_id, a.farm_id, b.name as farm_name, c.name as partnership_name,  a.name as machine_name,  "+
                       "capacity, sunday, monday, tuesday, wednesday, thursday, friday, saturday "+
                       "FROM public.txbroodermachine a "+
                       "LEFT JOIN public.osfarm b on a.farm_id = b.farm_id "+
                       "LEFT JOIN public.ospartnership c on a.partnership_id = c.partnership_id "+
                       "WHERE a.partnership_id = $1 "+
                       "order by machine_name ASC", [partnership_id]);
};


exports.DBaddBrooderMachine = function(partnership_id, farm_id, machine_name,capacity, sunday,monday,tuesday,wednesday,thursday,friday,saturday) {
    // console.log(partnership_id, farm_id, machine_name,capacity, sunday,monday,tuesday,wednesday,thursday,friday,saturday);
    return conn.db.one("INSERT INTO public.txbroodermachine (partnership_id, farm_id, name, "+
                       "capacity, sunday,monday,tuesday,wednesday,thursday,friday,saturday) "+
                       "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) "+
                       "RETURNING brooder_machine_id_seq", [partnership_id, farm_id, machine_name,capacity,
        sunday,monday,tuesday,wednesday,thursday,friday,saturday]);
};
