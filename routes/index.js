var express = require('express');
var router = express.Router();
var multer  = require('multer');
// npm install sqlite3
// npm install mediaserver --save
// npm install foreman
// nf start
// mediaserver: libreria con métodos que implementan la especificación de HTML5 sobre cómo hacer la comunicación de audio entre un servidor y un navegador (streaming)
var path = require('path');
var mediaserver = require('mediaserver');

var tracks_dir = process.env.TRACKS_DIR || './media/';

var trackController = require('../controllers/track_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');
var listController = require('../controllers/lists_controller');

// Autoload de comandos con ids
router.param('trackId', trackController.load);  // autoload :trackId
router.param('userId', userController.load);  // autoload :userId
router.param('listId', listController.load);  // autoload :listId

// Definición de rutas de sesion
router.get('/login',  sessionController.new);     // formulario login
router.post('/login', sessionController.create);  // crear sesión
router.get('/logout', sessionController.destroy); // destruir sesión

// Definición de rutas de cuenta
router.get('/user',  userController.new);     // formulario sign un
router.post('/user',  userController.create);     // registrar usuario
router.get('/user/:userId(\\d+)/edit',  sessionController.loginRequired, userController.ownershipRequired, userController.edit);     // editar información de cuenta
router.put('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownershipRequired, userController.update);     // actualizar información de cuenta
router.delete('/user/:userId(\\d+)',  sessionController.loginRequired, userController.ownershipRequired, userController.destroy);     // borrar cuenta
router.get('/user/:userId(\\d+)/tracks',  sessionController.loginRequired, userController.ownershipRequired, trackController.list);     // ver las canciones de un usuario
router.get('/user/:userId(\\d+)/lists',  sessionController.loginRequired, userController.ownershipRequired, listController.list);     // ver las listas de un usuario

// Definición de rutas de /tracks
router.get('/', function(req, res) {
  res.render('index');
});
router.get('/media/:nombre', function(req, res) {
	var song = path.join(__dirname, '../public/media/'+req.params.nombre);
	mediaserver.pipe(req, res, song);
});
router.get('/tracks', trackController.list);
router.get('/tracks/new', sessionController.loginRequired, trackController.new);
router.get('/tracks/:trackId(\\d+)', trackController.show);
router.post('/tracks', multer({inMemory: true}), sessionController.loginRequired, trackController.create);
router.delete('/tracks/:trackId(\\d+)', sessionController.loginRequired, trackController.ownershipRequired, trackController.destroy);

// Definición de rutas de /lists
router.get('/lists/:listId(\\d+)/tracks', sessionController.loginRequired, listController.ownershipRequired, trackController.list);     // ver las canciones de una lista
router.post('/lists/new', sessionController.loginRequired, listController.create);     // Crear una lista
router.put('/lists/:trackId(\\d+)', sessionController.loginRequired, trackController.ownershipRequired, listController.update);     // añadir una cancion a una lista
router.put('/lists/:trackId(\\d+)/delete', sessionController.loginRequired, trackController.ownershipRequired, listController.destroy);     // eliminar una cancion de una lista

module.exports = router;