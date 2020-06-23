const conn = require("../db");

//  **** Inicio ConfTecnica 

/**
 * @method DBaddCenter
 * @description Inserta un registro a la BD
 *
 * @param {Number} partnership_id ID de la empresa 
 * @param {Number} farm_id ID de la granja 
 * @param {String} name Nombre del núcleo 
 * @param {String} code Código del núcleo 
 * @param {(Boolean|Null)} os_disable Indica si el núcleo está activo
 * @returns {Object} 
 */
exports.DBaddCenter = function(partnership_id, farm_id, name, code, os_disable) {
    return conn.db.one(`INSERT INTO public.oscenter (partnership_id, farm_id, name, code, os_disable ) 
                        VALUES ($1, $2, $3, $4, $5) RETURNING center_id`, [partnership_id, farm_id, name, code, os_disable]);
};

/**
 * @method DBfindCenterByFarm
 * @description Filtra los núcleos segun la granja seleccionada
 *
 * @param {Number} farm_id
 * @returns {Object}
 */
exports.DBfindCenterByFarm = function(farm_id) {
    return conn.db.any(`SELECT code,center_id,partnership_id,name,oscenter.order, os_disable, 
                        false As availableOrder  
                        FROM public.oscenter WHERE farm_id = $1 order by oscenter.order ASC`, [farm_id]);
};
/**
 * @method DBupdateCenter
 * @description Actualiza el registro.
 *
 * @param {Number} center_id Id del Núcleo 
 * @param {String} code Código del Núcleo
 * @param {String} name Nombre de núcleo
 * @param {(boolean|null)} os_disable Indica si el núcleo está activo
 * @returns {object}
 */
exports.DBupdateCenter = function(center_id, code, name, os_disable) {
    return conn.db.none(`UPDATE public.oscenter SET name = $1, code = $2, os_disable = $4 
                            WHERE center_id = $3`, [name, code, center_id, os_disable]);
};

/**
 * @method DBdeleteCenter
 * @description Elimina el núcleo seleccionado
 * 
 * @param {Number} center_id ID del núcleo
 * @returns {object}
 */
exports.DBdeleteCenter = function(center_id) {
    return conn.db.none("DELETE FROM public.oscenter WHERE center_id = $1",[center_id]);
};

/**
 * @method DBisBeingUsed
 * @description Consulta a la bd si este centro esta siendo usado. 
 *
 * @param {Number} center_id id del Centro
 * @returns {Object} used
 */
exports.DBisBeingUsed = function(center_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.housingway_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.oscenter a
                            LEFT JOIN txhousingway_detail b on b.center_id = a.center_id or b.executioncenter_id = a.center_id
                            WHERE a.center_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broiler_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.oscenter a
                            LEFT JOIN txbroiler_detail b on b.center_id = a.center_id or b.executioncenter_id = a.center_id
                        WHERE a.center_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broilereviction_detail_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.oscenter a
                            LEFT JOIN txbroilereviction_detail b on b.center_id = a.center_id 
                        WHERE a.center_id=$1)) as used `,[center_id]);
};


//  **** Fin ConfTecnica 

exports.DBfindAllCenter = function() {
    return conn.db.any("SELECT * FROM public.oscenter order by code ASC");
};

exports.DBfindCenterBycodes = function(shed, farm) {
    return conn.db.any(`select c.center_id as center 
                        from osshed a
                        left join osfarm b on a.farm_id = b.farm_id
                        left join oscenter c on a.center_id = c.center_id
                        where a.code = $1 and b.code = $2`, [shed, farm]);
};

exports.DBbulkAddCenter = function(centers) {
    cs = conn.pgp.helpers.ColumnSet(["partnership_id", "farm_id", "name", "code"], {table: "oscenter", schema: "public"});
    // console.log(conn.pgp.helpers.insert(centers, cs))
    return conn.db.none(conn.pgp.helpers.insert(centers, cs));
};

exports.DBfindCenterByFarm2 = function(farm_id) {
    return conn.db.any(`SELECT code,center_id,partnership_id,name,oscenter.order, os_disable, 
                        false As availableOrder  
                        FROM public.oscenter WHERE farm_id = $1 and os_disable is not true order by oscenter.order ASC`, [farm_id]);
};

exports.DBfindCenterAssociatedByWarehouse = function(center_id) {
    return conn.db.any("SELECT * FROM public.oscenter_oswarehouse a "+
                       "LEFT JOIN public.oswarehouse b on a.warehouse_id = b.warehouse_id "+
                       "WHERE center_id = $1 ", [center_id]);
};

exports.DBinsertAssociation = function(warehouse_id, partnership_id, farm_id, center_id){

    return conn.db.none("INSERT INTO public.oscenter_oswarehouse (partnership_id, farm_id, center_id, warehouse_id, delete_mark) "+
                     " VALUES ($1, $2, $3, $4, $5) ",
    [partnership_id, farm_id, center_id, warehouse_id,0]);
};

exports.DBdeleteAssociation = function(warehouse_id, partnership_id, farm_id, center_id){
    return conn.db.none("DELETE FROM public.oscenter_oswarehouse "+
                      "WHERE partnership_id = $1 and farm_id = $2 and warehouse_id = $3 and center_id = $4 ",
    [partnership_id, farm_id, warehouse_id, center_id]);
};

exports.DBfindIdByCode = function(center_code) {
    return conn.db.any("SELECT center_id FROM public.oscenter WHERE code = $1 order by code ASC", [center_code]);
};


exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1"+
        "FROM public.oscenter ");
};

exports.DbKnowCenterId = function(register) {
    let string = "SELECT code,center_id,partnership_id, farm_id FROM public.oscenter WHERE code = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].center_id +  "'" ;
        }else{
            string = string +" or " + "(code = "+ "'" + register[index].center_id + "' and farm_id = " +register[index].farm_id+")";
        }  
        index++;
    }
    console.log("el string de farm_id");
    console.log(string);
    return conn.db.any(string);
};


exports.DbKnowCenterId2 = function(register) {
    let string = `  SELECT c.code as center_code, c.center_id, f.farm_id, f.code as farm_code, p.code as partnership_code, p.partnership_id, s.code as shed_code
                    FROM oscenter c
                    JOIN osfarm f ON f.farm_id = c.farm_id
                    JOIN ospartnership p ON p.partnership_id = f.partnership_id
                    LEFT JOIN osshed s ON s.center_id = c.center_id
                    WHERE `;
    var index = 0;
    while(index < register.length){
        if (index === 0) {
            string += `(c.code = '${register[index].centerCode}' and f.code = '${register[index].farmCode}' and p.code = '${register[index].partnershipCode}')`;
        }else{
            string += `or (c.code = '${register[index].centerCode}' and f.code = '${register[index].farmCode}' and p.code = '${register[index].partnershipCode}')`;
        }  
        index++;
    }
    return conn.db.any(string);
};

exports.DBupdateCenterOrder = function(records) {
    return conn.db.none(conn.pgp.helpers.update(records, ["?center_id", {name: "order",cast: "integer"}], "oscenter") + " WHERE v.center_id = t.center_id");
};
