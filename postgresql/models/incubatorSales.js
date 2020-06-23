const config = require("../../config");
const conn = require("../db");

exports.DBaddNewSales = function(records) {

    cs = conn.pgp.helpers.ColumnSet(["date_sale", "quantity", "gender", "incubator_plant_id", "breed_id"],
        {table: "txincubator_sales", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(records, cs));

};
exports.DBaddSale = function(date_sale, quantity, gender,breed_id, incubator_plant_id) {

    return conn.db.one(`INSERT INTO txincubator_sales (date_sale, quantity, gender, incubator_plant_id,breed_id
    ) VALUES ($1, $2, $3, $4, $5) RETURNING incubator_sales_id`, [date_sale, quantity, gender, incubator_plant_id,breed_id]);

};

exports.DBfindIncubatorSales = function(beginning, ending, incubator_plant_id, breed_id) {

    return conn.db.any(`
        SELECT a.incubator_sales_id, TO_CHAR(a.date_sale, 'DD/MM/YYYY') as date_sale, a.quantity, a.gender, a.incubator_plant_id, a.breed_id, a.programmed_disable, b.name as breed
        FROM txincubator_sales a
            LEFT JOIN mdbreed b on a.breed_id = b.breed_id
        WHERE a.date_sale BETWEEN $1 AND $2 AND a.incubator_plant_id = $3  and a.breed_id = $4 and a.programmed_disable is not true`,
    [beginning, ending, incubator_plant_id, breed_id]);

};
exports.DBfindSaleById = function(incubator_sales_id) {

    return conn.db.any(`SELECT a.incubator_sales_id, TO_CHAR(a.date_sale, 'DD/MM/YYYY') as date_sale, a.quantity, a.gender, a.incubator_plant_id, a.breed_id, a.programmed_disable, b.name as breed
                         FROM txincubator_sales a 
                            LEFT JOIN mdbreed b on a.breed_id = b.breed_id
                         WHERE a.incubator_sales_id= $1`,
    [incubator_sales_id]);

};
exports.DBgetSalesByweek = function(beginning, ending) {

    return conn.db.any(`
    SELECT DISTINCT to_char(br.date_sale, 'IW') as week_number, (date_trunc('week', br.date_sale::timestamp)::date) as init_date,  TO_CHAR((date_trunc('week', br.date_sale::timestamp)::date), 'DD/MM/YYYY')  as week,
                        (date_trunc('week', br.date_sale::timestamp)+ '6 days'::interval)::date as end_date,br.gender, (SELECT -1*SUM(f.quantity) FROM txincubator_sales f WHERE to_char(f.date_sale, 'IW') = to_char(br.date_sale, 'IW') and f.gender = br.gender and f.programmed_disable is not true) as quantity           
                    FROM txincubator_sales br         
                              WHERE br.date_sale  BETWEEN $1 and $2 and br.programmed_disable is not true 
                            group by week_number,br.date_sale,br.quantity,br.gender order by week_number asc`,
    [beginning, ending]);

};

exports.DBupdateDeletedIncubatorSales = function(records){
    cs = conn.pgp.helpers.ColumnSet(["?incubator_sales_id","programmed_disable"],
        {table: "txincubator_sales", schema: "public"});
    return conn.db.none(conn.pgp.helpers.update(records, cs)+ ' WHERE v.incubator_sales_id = t.incubator_sales_id');
};
