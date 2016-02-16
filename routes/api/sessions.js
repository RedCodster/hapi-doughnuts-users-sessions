var Joi = require('joi'); // Object schem validation
var Bcrypt = require('bcrypt'); //Encryption/hashing function
var Auth = require('./auth');

// routes/sessions.js

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'POST',
      path: '/api/sessions',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        // TODO: Add email authentication (optional)
        var user = request.payload;

        db.collection('users').findOne({ "username": user.username }, function(err, userMongo) {
            if (err) { return reply('Internal MongoDB error', err); }

            if (userMongo === null) {
              return reply({ "message": "User doesn't exist" });
            }

            Bcrypt.compare(user.password, userMongo.password, function(err, result) {
            // If password matches, please authenticate user and add to cookie
              if (result) {
                // if password matches, please authenticate user and add to cookie
                var randomKeyGenerator = function () {
                  return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
                }

                // Generate a random string
                var randomKey = randomKeyGenerator();

                var db = request.server.plugins['hapi-mongodb'].db;

                var newSession = {
                  "session_id": randomKey,
                  "user_id": userMongo._id
                };

                db.collection('sessions').insert(newSession, function(err, result) {
                  if (err) {
                    return reply('Internal MongoDB error', err);
                  }

                  // Store the Session information in the browser Cookie
                  request.yar.set('hapi_doughnuts_session', {
                    "session_id": randomKey,
                    "user_id": userMongo._id
                  });

                  return reply({ "message:": "Authenticated" });
                });

              } else {
                reply({ message: "Not authorized" });
            }
          });
        })
      }
    },
    {
      method: 'DELETE',
      path: '/api/sessions',
      handler: function(request, reply) {
        var session = request.yar.get('hapi_doughnuts_session');
        var db = request.server.plugins['hapi-mongodb'].db;

        if (!session) {
          return reply({ "message": "Already logged out" });
        }

        db.collection('sessions').remove({ "session_id": session.session_id }, function(err, writeResult) {
          if (err) { return reply('Internal MongoDB error', err); }

          reply(writeResult);
        });
      }
    },
    {
      method: 'GET',
      path: '/api/authenticated',
      handler: function(request, reply) {
        Auth.authenticated(request, function(result) {
          reply(result);
        });
      }
    }

  ]);

  next();
};

exports.register.attributes = {
  name: 'sessions-api',
  version: '0.0.1'
};
