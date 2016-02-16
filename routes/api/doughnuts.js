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
    { // Creating a new doughnut record.
      method: 'POST',
      path: '/api/doughnuts',
      handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        var style = request.payload.style;
        var flavor = request.payload.flavor;

        db.collection('doughnuts').insert({style: style, flavor: flavor}, function (err, doc) {
          if (err) { return reply(err); }
          reply(doc.ops[0]);
        });
      }
    },
    {
      method: 'DELETE',
      path: '/api/doughnuts/{id}',
      handler: function (request, reply) {
        var db       = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        var id = ObjectID(request.params.id);

        db.collection('doughnuts').remove({"_id": id}, function (err, doc) {
          if (err) { return reply(err); }
          reply(doc);
        });
      }
    },
    {
      method: 'PUT',
      path: '/api/doughnuts/{id}',
      handler: function (request, reply) {
        var db       = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;
        var id = ObjectID(request.params.id);
        var style = request.payload.style;
        var flavor = request.payload.flavor;

        db.collection('doughnuts').findOneAndUpdate(
          {"_id": id},
          {style: style, flavor: flavor},
          function (err, doc) {
            if (err) { return reply(err); }
            reply(doc.value);
          }
        );
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'doughnuts-api',
  version: '0.0.1'
};