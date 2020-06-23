const conn = require("../db");


// **** Inicio ConfTenica ****

/**
 * Busca en la tabla msmeasure todos los registros ordenado  por el nombre de forma ascendente
 *
 * @returns {Object} unidades de medida
 */
exports.DBfindAllPartnership = function() {
    return conn.db.any("SELECT * FROM public.ospartnership order by name ASC");
};

/**
 * @method DBaddPartnership
 * Funcion para agregar una empresa
 *
 * @param {String} name Nombre de la empresa 
 * @param {String} description Descripción de la empresa 
 * @param {String} address Dirección de la empresa 
 * @param {String} code Código de la empresa 
 * @param {(Boolean|null)} os_disable Indica si la empresa está activa
 * @returns {object}
 */
exports.DBaddPartnership = function(name, description, address, code, os_disable) {
    return conn.db.one("INSERT INTO public.ospartnership (name, description, address, code, os_disable) VALUES ($1, $2, $3, $4, $5) RETURNING partnership_id",
        [name, description, address, code, os_disable]);
};

/**
 * @method DBupdatePartnership
 * @description Funcion para agregar una empresa
 *
 * @param {String} name Nombre de la empresa 
 * @param {String} description Descripción de la empresa 
 * @param {String} address Dirección de la empresa 
 * @param {String} code Código de la empresa 
 * @param {(Boolean|null)} os_disable Indica si la empresa está activa
 * @returns {object}
 */
exports.DBupdatePartnership = function(name, description, address, partnership_id, code, os_disable) {
    return conn.db.none(`UPDATE public.ospartnership SET name = $1, description = $2, address = $3, code = $4, os_disable = $6 
                        WHERE partnership_id = $5`, [name, description, address, code, partnership_id, os_disable]);
};

/**
 * @method DBdeletePartnership
 * @description Función para eliminar un registro específico seleccionado por el usuario
 * 
 * @param {Number} partnership_id id del registro
 * @returns {object}
 */
exports.DBdeletePartnership = function(partnership_id) {
    return conn.db.none("DELETE FROM public.ospartnership WHERE partnership_id = $1",[partnership_id]);
};

/**
 * @method DBisBeingUsed
 * @description Consulta para determinar si la empresa esta siendo usa en otras tablas.
 *
 * @param {Number} partnership_id id del registro
 * @returns {object}
 */
exports.DBisBeingUsed = function(partnership_id) {
    return conn.db.one(`SELECT ((SELECT DISTINCT CASE WHEN b.housing_way_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.ospartnership a
                            LEFT JOIN txhousingway b on b.partnership_id = a.partnership_id
                            WHERE a.partnership_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broiler_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.ospartnership a
                            LEFT JOIN txbroiler b on b.partnership_id = a.partnership_id
                        WHERE a.partnership_id=$1)
                        OR (SELECT DISTINCT CASE WHEN b.broilereviction_id IS NOT NULL THEN TRUE ELSE FALSE END
                            FROM public.ospartnership a
                            LEFT JOIN txbroilereviction b on b.partnership_id = a.partnership_id
                        WHERE a.partnership_id=$1)) as used `,[partnership_id]);
};

// **** Fin ConfTenica ****

exports.DBfindPartnershipByFarmType = function(farm_type) {
    return conn.db.any(`SELECT DISTINCT a.partnership_id, a.name, a.address, a.description, a.code, a.os_disable 
                        FROM public.ospartnership a
                        LEFT JOIN osfarm b on a.partnership_id = b.partnership_id
                        
                        WHERE b.farm_type_id = $1 and a.os_disable is not true ORDER BY a.name ASC;`, [farm_type]);
};

exports.DBbulkAddPartnership = function(partnerships) {
    cs = conn.pgp.helpers.ColumnSet(["name", "address", "description", "code"], {table: "ospartnership", schema: "public"});
    return conn.db.none(conn.pgp.helpers.insert(partnerships, cs))
        .catch(e => {
            e.message = e.detail;
            throw e;
        });
};

exports.DBfindFarmByPartnership = function(partnership_id) {
    return conn.db.any("SELECT * FROM public.osfarm WHERE partnership_id = $1 order by name ASC", [partnership_id]);
};

exports.DBfindPartnershipByCode = function(partnership_code) {
    return conn.db.any("SELECT partnership_id FROM public.ospartnership WHERE code = $1 order by name ASC", [partnership_code]);
};


exports.DBfindSomething = function() {
    return conn.db.any("SELECT distinct 1 "+
        "FROM public.ospartnership");
};

exports.DbKnowPartnership_id2 = function(register) {
    let string = `  SELECT p.partnership_id,p.code, f.code as farm_code, i.code as incplant_code
                    FROM public.ospartnership p 
                    LEFT JOIN osfarm f ON f.partnership_id = p.partnership_id
                    LEFT JOIN osincubatorplant i ON i.partnership_id = p.partnership_id 
                    WHERE p.code = `;
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].partnershipCode +  "'" ;
        }else{
            string = string +" or " + "p.code = "+ "'" + register[index].partnershipCode + "'";
        }  
        index++;
    }
    console.log("el string");
    console.log(string);
    return conn.db.any(string);
};

exports.DbKnowPartnership_id = function(register) {
    let string = "SELECT partnership_id,code FROM public.ospartnership WHERE code = ";
    var index = 0;
    while(index < register.length){
        if (index == 0) {
            string = string +  "'"  +register[index].partnershipCode +  "'" ;
        }else{
            string = string +" or " + "code = "+ "'" + register[index].partnershipCode + "'";
        }  
        index++;
    }
    console.log("el string");
    console.log(string);
    return conn.db.any(string);
};