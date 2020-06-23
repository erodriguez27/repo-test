var config = require('./config.js'),
    LocalStrategy = require('passport-local').Strategy,
    Model = require('./postgresql/models/userControl.js');
User = Model.User;
const crypto = require('crypto');
const iterations = 100000;
const keylen = 64;
const algorithm = 'sha512';


module.exports = function (passport) {

    // console.log('passport - Inicia');

    passport.use(new LocalStrategy(function (username, password, done) {
        // console.log('----------- passport --------------------');
        Model.User(username).then(function (data) {
            var user = data;

            if (user.length < 1) {
                // console.log('Usuario Invalido');
                return done(null, false);
            } else {
                user = JSON.stringify(data);
                try {
                    const first = data[0]
                    same(first["username"], password, first["password"])
                    .then(function(res){
                        if (res) {
                            // console.log('Se Encontro');
                            return done(null, first)

                        } else {
                            // console.log('contraseña incorrecta');
                            return done(null, false)
                        }
                    })
                } catch (error) {
                    console.log(error);
                }


            }
        })
    }))

    passport.serializeUser(function (user, done) {
        // console.log('-- serializeUser --');
        done(null, user.user_id);
    });

    passport.deserializeUser(function (id, done) {
        // console.log('-- deserializeUser --');
        Model.grabUserCredentials(id).then(function (data, err) {
            if (err) {
                done(err);
            }
            done(null, data);
        });
    });

}

function same(salt,password, hash) {
    var executor = function(resolve, reject) {
      var callback = function(error, keyB) {
        if (error) {
            return reject(error);
        }
        
        resolve(keyB.toString('hex')===hash);
      };
      crypto.pbkdf2(password, salt, iterations, keylen, algorithm, callback);
    };
  
    return new Promise(executor);
  };