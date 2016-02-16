var Joi = require('joi');
var Auth = require('./auth');

exports.register = function (server, options, next) {
  server.route([
    { // INDEX. Get all doughnuts
      method: 'GET',
      path: '/api/doughnuts',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('doughnuts').find().toArray(function (err, results) {
          if (err) { return reply(err); }
          reply(results);
        });
      }
    },
    {
      method: 'GET',
      path: '/api/{username}/doughnuts',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        var username = request.params.username;

        //search the username and exract the id of the user
        db.collection('users').findOne({username: username}, function (err,user) {
          if (err) { return reply(err).code(400); }
        // given the user_id, we will find all the doughnuts created by this user
          var user_id = user._id;
          db.collection('doughnuts').find({user_id: user_id}).toArray(function (err, results) {
            if (err) { return reply(err).code(400);}
            reply(results).code(200);
          });
        });
      }
    },
    { // Creating a new doughnut
      method: 'POST',
      path: '/api/doughnuts',
      handler: function (request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            //create a post
            var db = request.server.plugins['hapi-mongodb'].db;
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            var session = request.yar.get('hapi_doughnuts_session');

            var doughnut = {
              user_id: ObjectID(session.user_id),
              style: request.payload.style,
              flavor: request.payload.flavor
            };
            db.collection('doughnuts').insert(doughnut, function (err, doc) {
              if (err) { return reply(err); }
              reply(doc.ops[0]);
            });
          } else {
            // can't create post if you are not logged in
            reply(result).code(400);
          }
        });
      }
    },
    { // Delete a doughnut only if it is yours to begin with.
      method: 'DELETE',
      path: '/api/doughnuts/{id}',
      handler: function (request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            var db       = request.server.plugins['hapi-mongodb'].db;
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            var session = request.yar.get('hapi_doughnuts_session');
            var user_id = ObjectID(session.user_id)
            var id = ObjectID(request.params.id)
            // find the doughnut first
            db.collection('doughnuts').findOne({'_id': id}, function (err,doughnut){
              if (err) {return reply(err).code(400); }
            // check if doughnut exists
              if (doughnut === null) {
                return reply({message:'This doughnut does not exist'}).code(404);
              }
            //if doughnut's user_id is the same as session user, delete doughnut
              if (doughnut.user_id.toString() === user_id.toString()) {
                db.collection('doughnuts').remove({"_id": id}, function (err, doc) {
                  if (err) { return reply(err); }
                  reply(doc).code(200);
                });
              } else {
                reply({message: 'This is not your doughnut!'}).code(400);
              }
            });
          } else {
            reply(result).code(400);
          }
        });
      }
    },
    { // Update doughnut details only if it is yours to begin with
      method: 'PUT',
      path: '/api/doughnuts/{id}',
      handler: function (request, reply) {
        Auth.authenticated(request, function (result) {
          if (result.authenticated) {
            var db       = request.server.plugins['hapi-mongodb'].db;
            var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
            var session = request.yar.get('hapi_doughnuts_session');
            var id = ObjectID(request.params.id);
            var user_id = ObjectID(session.user_id);
            var updateDoughnut = {
              style: request.payload.style,
              flavor: request.payload.flavor
            };
            // find the doughnut first
            db.collection('doughnuts').findOne({'_id': id}, function (err,doughnut){
              if (err) {return reply(err).code(400); }
            // check if doughnut exists
              if (doughnut === null) {
                return reply({message:'This doughnut does not exist!'}).code(404);
              }
            //if doughnut's user_id is the same as session user, delete doughnut
              if (doughnut.user_id.toString() === user_id.toString()) {
                db.collection('doughnuts').update({"_id": id}, {$set: updateDoughnut}, function (err, doughnut) {
                  if (err) { return reply(err).code(400); }
                  reply(doughnut).code(200);
                });
              } else {
                reply({message: 'This is not your doughnut!'}).code(400);
              }
            });
          } else {
            reply(result).code(400);
          }
        });
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'doughnuts-api',
  version: '0.0.1'
};