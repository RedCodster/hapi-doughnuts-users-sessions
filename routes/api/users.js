
var Joi = require('joi'); // Object schem validation
var Bcrypt = require('bcrypt'); //Encryption/hashing function



exports.register = function(server, options, next) {
  // include routes
  server.route([
    {
      // Retrieve all users
      method: 'GET',
      path: '/api/users',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('users').find().toArray(function(err, users) {
          if (err) { return reply('Internal MongoDB error', err); }
          reply(users);
        });
      }
    },
    {
      // Create a new user
      method: 'POST',
      path: '/api/users',
      config: {
        handler: function(request, reply) {
          var db = request.server.plugins['hapi-mongodb'].db;
          // Get user input parameters (username, email, password)
          var user = request.payload;

          var uniqUserQuery = { $or: [{username: user.username}, {email: user.email}] };

          db.collection('users').findOne(uniqUserQuery, function(err, userExist){
            if (userExist) {
              return reply('Error: Username/Email already exists', err);
            }
            Bcrypt.genSalt(10, function(err, salt) {
              Bcrypt.hash(user.password, salt, function(err, hash) {
                user.password = hash;

                // Store hash in your password DB.
                db.collection('users').insert(user, function(err, doc) {
                  if (err) { return reply('Internal MongoDB error', err); }

                  reply(doc);
                });
              });
            });
          });
        },
        validate: {
          payload: {
          // Required, Limited to 20 chars
          username: Joi.string().max(20).required(),
          email:    Joi.string().email().max(50).required(),
          password: Joi.string().min(5).max(20).required(),
          name:     Joi.string().max(20).required()
        }
      }
      }
    },
    {
    // Retrieve one user
    method: 'GET',
    path: '/api/users/{username}',
    handler: function(request, reply) {
      // What is encodeURIComponent()? Visit http://stackoverflow.com/questions/75980/best-practice-escape-or-encodeuri-encodeuricomponent
      var username = encodeURIComponent(request.params.username);
      var db = request.server.plugins['hapi-mongodb'].db;

      db.collection('users').findOne({ "username": username }, function(err, user) {
        if (err) { return reply('Internal MongoDB error', err); }

        reply(user);
      });
    }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'users-route',
  version: '0.0.1'
};