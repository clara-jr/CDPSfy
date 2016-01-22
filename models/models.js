var path = require('path');

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BBDD SQLite:
var sequelize = new Sequelize(null, null, null, 
                       {dialect: "sqlite", storage: "track.sqlite"}
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
                      url: '/media/Cute.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    },
                    {
                      name: 'Dubstep',
                      url: '/media/Dubstep.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    },
                    {
                      name: 'Epic',
                      url: '/media/Epic.mp3',
                      image: '/images/quaver3.png',
                      UserId: '1'
                    },
                    {
                      name: 'Littleidea',
                      url: '/media/Littleidea.mp3',
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