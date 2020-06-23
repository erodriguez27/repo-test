
var entitiesConf = require('../../local_entities.json');
exports.getAll = async function(req, res) {

    try {
        res.status(200).json({
            statusCode: 200,
            data: entitiesConf.entities
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            statusCode: 500,
            pgErrorCode: err
        });
    }
};