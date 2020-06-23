const config = require("../../config");
const conn = require("../db");


//  **** Inicio ConfTecnica ****
/**
 * @method DBfindAllFarm
 * @description consulta todos los registros de la tabla osfarm 
 *
 * @returns {object} Las granjas ordenadas por nombre de forma Ascendente
 */
exports.DBfindAllFarm = function() {
    return conn.db.any("SELECT * FROM public.osfarm order by name ASC");
};
/**
 * @method DBfindFarmByPartnetship
 * @description Consulta que encuentra las granjas relacionadas con la empresa que se ha seleccionado en la vista
 *
 * @param {Number} partnership_id id de la Granja
 * @returns {Object} granjas. 
 */
exports.DBfindFarmByPartnetship = function(partnership_id){
    return conn.db.any(`SELECT farm_id, partnership_id, code, a.name,
                        a.farm_type_id, b.name as farm_name, a._order, a.os_disable, 
                        false As availableOrder 
                        FROM public.osfarm a 
                        LEFT JOIN public.mdfarmtype b ON a.farm_type_id = b.farm_type_id 
                        WHERE partnership_id = $1 order by b.name DESC ,a._order ASC`,[partnership_id]);
};

/**
 * @method DBfindFarmByPartnetshipTypes
 * @description Busca los tipos de granjas por empresa. 
 *
 * @param {Number} partnership_id Id de la empresa
 * @returns {Object} tipo de Granja
 */
exports.DBfindFarmByPartnetshipTypes = function(partnership_id){
    return conn.db.any(`SELECT Distinct b.name as farmtype 
                        FROM public.osfarm a 
                        LEFT JOIN public.mdfarmtype b ON a.farm_type_id = b.farm_type_id 
                        WHERE partnership_id = $1`,[partnership_id]);
};

/**
 * @method DBaddFarm
 * @description Agrega un registro
 *
 * @param {Number} partnership_id ID de la empresa 
 * @param {String} code Código de la granja
 * @param {String} name Nombre de la granja 
 * @param {Number} farm_type_id ID del tipo de granja
 * @param {Number} order orden de alojamiento
 * @param {(Boolean|Null)} os_disable Indica si la granja está activa 
 * @returns {Object} id del registro
 */
exports.DBaddFarm = function(partnership_id, code, name, farm_type_id, order ,os_disable) {
    return conn.db.one("INSERT INTO public.osfarm (partnership_id,code, name, farm_type_id,os_disable, _order) VALUES ($1, $2 , $3, $4, $5, $6) RETURNING farm_id", [partnership_id, code, name, farm_type_id, os_disable, order]);
};

/**
 * @method DBupdateFarm
 * @description Actualiza un registro
 *
 * @param {Number} partnership_id ID de la empresa 
 * @param {String} code Código de la granja
 * @param {String} name Nombre de la granja 
 * @param {Number} farm_type_id ID del tipo de granja
 * @param {Number} order orden de alojamiento
 * @param {(Boolean|Null)} os_disable Indica si la granja está activa 
 * @returns {Object}
 */
exports.DBupdateFarm = function(farm_id, name, code, farm_type_id, os_disable, order) {

    return conn.db.none("UPDATE public.osfarm SET name = $1, code = $2 , farm_type_id= $3, os_disable = $5, _order = $6 WHERE farm_id = $4", [name, code, farm_type_id, farm_id, os_disable, order]);
};

/**
 * @method DBdeleteFarm
 * @description Elimina un registro 
 * 
 * @param {Number} farm_id id de la granja
 * @returns {object}
 */
exports.DBdeleteFarm = function(farm_id) {
    return conn.db.none("DELETE FROM public.osfarm WHERE farm_id = $1",[farm_id]);
};

/**
 * @method DBisBeingUsed
 * @description Consulta si esta granja esta siendo usada en otra entidad
 *
 * @param {Number} farm_id id de la granja
 * @returns {Object} used
 */
exports.DBisBeingUsed = function(farm_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.housingway_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.osfarm a
                            LEFT JOIN txhousingway_detail b on b.farm_id = a.farm_id or b.executionfarm_id = a.farm_id
                            WHERE a.farm_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broiler_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.osfarm a
                            LEFT JOIN txbroiler_detail b on b.farm_id = a.farm_id or b.executionfarm_id = a.farm_id
                        WHERE a.farm_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broilereviction_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.osfarm a
                            LEFT JOIN txbroilereviction_detail b on b.farm_id = a.farm_id 
                        WHERE a.farm_id=$1)) as used `,[farm_id]);
};

//  **** Fin ConfTecnica ****

exports.DBbulkAddCenter = function(farms) {
    cs = conn.pgp.helpers.ColumnSet(["partnership_id", "code", "name"
        ,"farm_type_id"], {table: "osfarm", schema: "public"});
    //console.log(farms);

    console.log(conn.pgp.helpers.insert(farms, cs));
    return conn.db.none(conn.pgp.helpers.insert(farms, cs));
};

exports.DBfindFarmByPartnetship2 = function(partnership_id){
    return conn.db.any(`SELECT farm_id, partnership_id, code, a.name,
                        a.farm_type_id, b.name as farm_name, a.order, a.os_disable, 
                        false As availableOrder 
                        FROM public.osfarm a 
                        LEFT JOIN public.mdfarmtype b ON a.farm_type_id = b.farm_type_id 
                        WHERE partnership_id = $1 and a.os_disable is not true order by b.name DESC ,a.order ASC`,[partnership_id]);
};

exports.DBfindShedByFarm = function(farm_id) {
    return conn.db.any("SELECT b.farm_id, b.name as farm_name, c.center_id, c.name as center_name, capacity_theoretical, rotation_days, "+
                       "a.shed_id, a.code as shed_name, a.stall_width, a.stall_height, 'None' as state, "+
                       "(a.stall_height * a.stall_width * capacity_min) as capmin, (a.stall_height * a.stall_width * capacity_max) as capmax "+
                       "FROM public.osshed a "+
                       "LEFT JOIN public.osfarm b ON a.farm_id = b.farm_id "+
                       "LEFT JOIN public.oscenter c ON a.center_id = c.center_id "+
                       "WHERE a.farm_id = $1", [farm_id]);
};

exports.DBfindFarmByPartAndStatus = function(partnership_id, status_id) {
//   console.log("* ", partnership_id, status_id);

    return conn.db.any(`SELECT a.farm_type_id, a.name as name, a.farm_id , a.order
                        FROM public.osfarm a
                        LEFT JOIN public.mdfarmtype b ON a.farm_type_id = b.farm_type_id 
                        WHERE a.partnership_id = $1  and a.farm_type_id = $2 order by a.order ASC`, [partnership_id, status_id]);
};
exports.DBfindFarmByPartAndStatus2 = function(partnership_id, status_id) {
//   console.log("* ", partnership_id, status_id);

    return conn.db.any(`SELECT a.farm_type_id, a.name as name, a.farm_id , a._order
                        FROM public.osfarm a
                        LEFT JOIN public.mdfarmtype b ON a.farm_type_id = b.farm_type_id 
                        WHERE a.partnership_id = $1  and a.farm_type_id = $2 and a.os_disable is not true order by a._order ASC`, [partnership_id, status_id]);
};

exports.DBfindIdByCode = function(farm_code) {
    return conn.db.any("SELECT a.farm_id "+
        "FROM public.osfarm a "+
        "WHERE a.code = $1", [farm_code]);
};

exports.DBfindPartnershipIdByCode = function(farm_code) {
    return conn.db.any("SELECT a.partnership_id "+
        "FROM public.osfarm a "+
        "WHERE a.code = $1", [farm_code]);
};

exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1"+
        "FROM public.osfarm ");
};

exports.DbKnowFarmId = function(register) {
    let string = "SELECT code,farm_id FROM public.osfarm WHERE code = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].farm_id +  "'" ;
        }else{
            string = string +" or " + "code = "+ "'" + register[index].farm_id + "'";
        }  
        index++;
    }
    return conn.db.any(string);
};

exports.DbKnowFarmId2 = function(register) {
    let string = `  SELECT f.code as farm_code, f.farm_id as farm_id, p.code as partnership_code, p.partnership_id as partnership_id, c.code as center_code
                    FROM public.osfarm f
                    JOIN ospartnership p ON f.partnership_id = p.partnership_id 
                    LEFT JOIN oscenter c ON f.farm_id = c.farm_id
                    WHERE `;
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string += `(f.code = '${register[index].farmCode}' and p.code = '${register[index].partnershipCode}') `;
        }else{
            string += `or (f.code = '${register[index].farmCode}' and p.code = '${register[index].partnershipCode}') `;//" or " + "code = "+ "'" + register[index].farm_id + "'";
        }
        index++;
    }
    return conn.db.any(string);
};


exports.DBupdateFarmOrder = function(records) {
    return conn.db.none(conn.pgp.helpers.update(records, ["?farm_id", {name: "order",cast: "integer"}], "osfarm") + " WHERE v.farm_id = t.farm_id");

    //cs = conn.pgp.helpers.ColumnSet(['?farm_id', 'order'], {table: 'osfarm', schema: 'public'});
    //return conn.db.none(conn.pgp.helpers.update(records, cs) + ' WHERE v.farm_id = t.farm_id');
};