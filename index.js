var Path = require('path');
var Hapi = require('hapi');
var server = new Hapi.Server();

// configuring the server address
server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 8000,
  routes: {
    // cors: {
      // headers: ["Access-Control-Allow-Credentials"],
      // credentials: true
    // }
  }
});

// plugins that needs to be registered
var plugins = [
  { register: require('vision')},
  { register: require('inert')},
  { register: require('./routes/api/sessions.js')},
  { register: require('./routes/static_pages.js')},
  { register: require('./routes/api/doughnuts.js')},
  { register: require('./routes/api/users.js')},
  { register: require('hapi-mongodb'),
    options: {
      "url": process.env.MONGOLAB_URI || "mongodb://127.0.0.1:27017/hapi-doughnuts",
      "settings": {
        "db": {
          "native_parser": false
        }
      }
    }
  },
  {
    register: require('yar'),
    options: {
      cookieOptions: {
        password: process.env.COOKIE_PASSWORD || '12345678901234567890123456789012',
        isSecure: false
      }
    }
  }
];

server.register(plugins, function(err){
  // throw an error if plugins didn't register
  if (err) { throw err; }

  // configure views
  server.views({
    engines: {html: require('handlebars')},
    path: Path.join(__dirname, 'views/templates'),
    layout: true,
    layoutPath: Path.join(__dirname, 'views/layouts')
  });

  // start the server
  server.start(function () {
    console.log("listening on..." + server.info.uri);
  });
});