
exports.cleanObjects = function(array) {
    array.forEach(x => {
        for(let key in x) {
            if (x[key] === "") {
                x[key] = null;
            }
        }
    });
};

exports.wrap = fn => (...args) => fn(...args).catch(args[2]);

exports.formatErrorMessage = e => {
    let message = ''
    if (e.code === 'ENOTFOUND') {
        message = 'Error de comunicación.'
    }
    else {
        message = 'Error interno.'
    }
    
    return message

}