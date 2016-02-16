module.exports = {};

module.exports.authenticated = function(request, callback) {
  var session = request.yar.get('hapi_doughnuts_session');
  var db = request.server.plugins['hapi-mongodb'].db;

  if (!session) {
    return callback({ "authenticated": false, "message": "Unauthorized" });
  }

  db.collection('sessions').findOne({ "session_id": session.session_id }, function(err, result) {
    if (result === null) {
      return callback({
        "authenticated": false,
        "message": "Unauthorized"
      });
    } else {
      return callback({
        "authenticated": true,
        "message": "Authorized"
      });
    }
  });
};