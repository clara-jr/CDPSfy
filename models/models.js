var path = require('path');

// Postgres DATABASE_URL = postgress://user:password@host:port/database
// SQLite DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6] || null);
var user    = (url[2] || null);
var pwd     = (url[3] || null);
var protocol= (url[1] || null);
var dialect = (url[1] || null);
var port    = (url[5] || null);
var host    = (url[4] || null);
var storage = process.env.DATABASE_STORAGE;

// Cargar modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite o Postgress
var sequelize = new Sequelize(DB_name, user, pwd,
  { dialect: protocol,
    protocol: protocol,
    port: port,
    host: host,
    storage: storage,
    omitNull: true
    }
  );

//Importar la definicion de la tabla track en track.js
var track_path = path.join(__dirname,'track');
var Tracks = sequelize.import(track_path);

// Importar definicion de la tabla de usuarios
var user_path = path.join(__dirname,'user');
var User = sequelize.import(user_path);

// Importar definicion de la tabla de listas
var list_path = path.join(__dirname,'list');
var List = sequelize.import(list_path);

// los tracks pertenecen a un usuario registrado
Tracks.belongsTo(User); // En Tracks tendremos UserId
User.hasMany(Tracks);

// las lists pertenecen a un usuario registrado
List.belongsTo(User); // En List tendremos UserId
User.hasMany(List);

// los tracks pertenecen a una list y las lists tienen varios tracks
Tracks.belongsTo(List); // En Tracks tendremos ListId
List.hasMany(Tracks);

// exportar tablas
exports.Tracks = Tracks; //exportar definicion de la tabla Tracks
exports.User = User;
exports.List = List;

// sequelize.sync() inicializa tabla de preguntas en DB
sequelize.sync().then(function() {
  // then(..) ejecuta el manejador una vez creada la tabla
  User.count().then(function(count){
    if(count === 0) {   // la tabla se inicializa solo si está vacía
      User.bulkCreate( 
        [ {username: 'admin',   password: '1234', isAdmin: true},
          {username: 'pepe',   password: '5678'} // el valor por defecto de isAdmin es 'false'
        ]
      ).then(function(){
        console.log('Base de datos (tabla user) inicializada');
        Tracks.count().then(function(count){
          if(count === 0) { //la tabla se inicializa solo si esta vacia
              Tracks.bulkCreate( 
                  [ {
                      name: 'Cute',
                      urlMp3: '/media/Cute.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    },
                    {
                      name: 'Dubstep',
                      urlMp3: '/media/Dubstep.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    },
                    {
                      name: 'Epic',
                      urlMp3: '/media/Epic.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    },
                    {
                      name: 'Littleidea',
                      urlMp3: '/media/Littleidea.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    }
                  ]
              ).then(function(){console.log('Base de datos (tabla tracks) inicializada')});
          };
        });
      });
    };
  });
});