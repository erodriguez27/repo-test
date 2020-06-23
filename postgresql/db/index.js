const config = require("../../config");
const promise = require("bluebird");
const options = {
    promiseLib: promise,
};
const pgp = require("pg-promise")(options);
// Instancia de la base de datos:
const url = `${config.db}${config.database}`;
const db = pgp(url);

module.exports = {
    pgp, db
};
