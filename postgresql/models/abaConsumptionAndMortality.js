const config = require("../../config");
const conn = require("../db");
let dbName= "aba_consumption_and_mortality";
let dbName2= "aba_consumption_and_mortality_detail";

exports.DBfindAll = function() {

    return conn.db.any("SELECT * FROM public.$1:name",[dbName]);
};

exports.DBfindAllWithTimes = function() {
    return conn.db.any("SELECT a.id, a.code, a.name, a.id_breed, " +
        "a.id_stage, a.id_aba_time_unit, b.singular_name, " +
        "b.plural_name FROM public.$1:name a " +
        "LEFT JOIN public.$2:name b on a.id_aba_time_unit = b.id ",[dbName, "aba_time_unit"]);
};

exports.DBadd = function(element) {

    return conn.db.one("INSERT INTO public.$1:name (code, "+
                      "name) "+
                      "VALUES ($2, $3) RETURNING id ",
    [dbName, element.code, element.name, element.order]);
};

exports.DBaddConsAndMort = function(element) {

    //primero inserto en formulation y luego en elementsAndConcentrations
    conn.db.tx(function (t) {
        return t.one("INSERT INTO public.$1:name (code, " +
            "name, id_breed, id_stage, id_aba_time_unit) " +
            "VALUES ($2, $3, $4, $5, $6) RETURNING id ",
        [dbName, element.code, element.name,
            element.id_breed, element.id_type,
            element.id_time_unit])
            .then(function (data) {
                //el id de aba cons and mort viene de la insercion
                const cs = columnSetForCreate(data);
                const values = element.values;
                const query = conn.pgp.helpers.insert(values, cs);
                return Promise.all([t.none(query)])
                    .then(data => {
                        //todo implementar manejo de errores
                        return Promise.resolve(data.id);
                    });
            });
    })
        .then(function (data) {
            console.log(data);
        }, function (reason) {
            console.log(reason);
        });
};

exports.DBfindById = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE id = $2",[dbName, parseInt(element)]);
};

exports.DBfindByCode = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE code = $2",[dbName, element]);
};

exports.DBfindByName = function(element) {

    return conn.db.any("SELECT * FROM  public.$1:name WHERE name = $2",[dbName, element]);
};

exports.DBupdate = function(element) {

    return conn.db.one("UPDATE public.$1:name SET code = $2, name = $3 " +
        "WHERE id = $4 RETURNING id", [dbName, element.code, element.name, element.id]);
};

exports.DBupdateConsAndMort = function(element) {
    conn.db.any("SELECT id FROM public.$1:name WHERE id_aba_consumption_and_mortality = $2", [dbName2, element.id]).then(preExistingIds => {
        conn.db.tx(function (t) {
            return t.one("UPDATE public.$1:name SET code = $2, name = $3, " +
                "id_breed = $4, id_stage = $5, id_aba_time_unit = $6 " +
                "WHERE id = $7 RETURNING id ",
            [dbName, element.code, element.name, element.id_breed,
                element.id_type, element.id_time_unit, element.id])
                .then(function (data) {
                    //array de queries a ser ejecutados, se ingresa dependiendo de si existiran insert, update y delete
                    let arrayOfQueries = new Array();
                    //el id de aba formulation viene de la actualizacion
                    //este es para el update
                    const cs = columnSetForUpdate(data);
                    const values = element.values;
                    //si hay valores a ser actualizados
                    if (values.length > 0) {
                        const query = conn.pgp.helpers.update(values, cs) + " WHERE v.id = t.id " + "RETURNING t.id";
                        //se agrega al array a ejecutar
                        arrayOfQueries.push(t.manyOrNone(query));
                    }
                    //el filter retornara solo los que no se van a actualizar
                    //es decir los que se van a insertar
                    const result = values.filter(value =>
                        value.id == null
                    );
                    //aqui deberia de tener aquellos elementos que no se
                    // actualizaron y deberia de insertarlos
                    console.log(result);
                    //insertar a cada uno de ellos con query igual al de create pero con otros values
                    const cs2 = columnSetForCreate(data);
                    //si hay valores a ser insertados
                    if (result.length > 0) {
                        const query2 = conn.pgp.helpers.insert(result, cs2) + " RETURNING id";
                        //se agrega al array a ejecutar
                        arrayOfQueries.push(t.manyOrNone(query2));
                    }
                    //hago copia en casa de querer cambiarlo luego
                    let values2 = element.values;
                    //busco los elementos que deben eliminarse
                    let toDelete = preExistingIds.filter(value =>
                        value.id != null &&
                        checkIsNan(value, values2)
                    );
                    //elementos a eliminar
                    console.log(toDelete);
                    //si hay elementos a borrar armo el query manualmente porque no hay helper para ello
                    if (toDelete.length > 0) {
                        let eliminationQuery = "DELETE FROM public.aba_consumption_and_mortality_detail where id in (";
                        eliminationQuery = eliminationQuery + toDelete[0].id;
                        for (i = 1; i < toDelete.length; i++) {
                            eliminationQuery = eliminationQuery + ", " + toDelete[i].id;
                        }
                        eliminationQuery = eliminationQuery + ");";
                        //se agrega al array a ejecutar
                        arrayOfQueries.push(t.manyOrNone(eliminationQuery));
                    }
                    //aqui ejecuto todos los queries que deben de ser ejecutados
                    Promise.all(arrayOfQueries)
                        .then(data => {
                            //todo implementar manejo de respuestas
                            console.log(data);
                            return Promise.resolve(data.id);
                        }).catch(
                            errorAndStuff => {
                                console.log(errorAndStuff);
                            }
                        );
                });
        });
    })

        .then(function (data) {
            // Success, do something with data...
            // return res.status(200).json(data);
            console.log(data);
        }, function (reason) {
            // Error
            // return res.json(reason);
            console.log(reason);
        });



};

exports.DBdelete = function(element) {

    return conn.db.none("DELETE FROM public.$1:name WHERE id = $2",[dbName, parseInt(element.id)]);
};

function columnSetForCreate(data) {
    return new conn.pgp.helpers.ColumnSet([
        {
            name: "id_aba_consumption_and_mortality",
            init: col => {
                return parseInt(data.id);
            }
        },
        {
            name: "time_unit_number",
            init: col => {
                if (col.value != null && !isNaN(col.value) && col.value != "")
                    return parseInt(col.value);
                else
                    return null;
            }
        },
        {
            name: "consumption",
            init: col => {
                if (col.value != null && !isNaN(col.value) && col.value != "")
                    return parseFloat(col.value);
                else
                    return null;
            }
        },
        {
            name: "mortality",
            init: col => {
                if (col.value != null && !isNaN(col.value) && col.value != "")
                    return parseFloat(col.value);
                else
                    return null;
            }
        }], {table: dbName2});
}

function columnSetForUpdate(data) {
    return new conn.pgp.helpers.ColumnSet([
        {
            name: "id",
            cast: "int",
            init: col => {
                if (col.value != null && !isNaN(col.value))
                    return parseInt(col.value);
                else
                    return null;
            }
        },
        {
            name: "id_aba_consumption_and_mortality",
            cast: "int",
            init: col => {
                return parseInt(data.id);
            }
        },
        {
            name: "time_unit_number",
            cast: "int",
            init: col => {
                if (col.value != null && !isNaN(col.value) && col.value != "")
                    return parseInt(col.value);
                else
                    return null;
            }
        },
        {
            name: "consumption",
            cast: "float",
            init: col => {
                if (col.value != null && !isNaN(col.value) && col.value != "")
                    return parseFloat(col.value);
                else
                    return null;
            }
        },
        {
            name: "mortality",
            cast: "float",
            init: col => {
                if (col.value != null && !isNaN(col.value) && col.value != "")
                    return parseFloat(col.value);
                else
                    return null;
            }
        }], {table: dbName2});
}

function checkIsNan(value, values2) {
    let result = values2.find(function (stuff) {
        return stuff.id == value.id;
    });

    if (result == undefined) {
        return true;
    } else {
        false;
    }
}