var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({dest: './uploads/'});

var tracks_dir = process.env.TRACKS_DIR || './media/';

var trackController = require('../controllers/track_controller');
var sessionController = require('../controllers/session_controller');
var userController = require('../controllers/user_controller');

// Autoload de comandos con ids
router.param('trackId', trackController.load);  // autoload :trackId
router.param('userId', userController.load);  // autoload :userId

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
router.get('/user/:userId(\\d+)/tracks',  trackController.list);     // ver las canciones de un usuario

// Definición de rutas de /tracks
router.get('/', function(req, res) {
  res.render('index');
});
router.get('/tracks', trackController.list);
router.get('/tracks/new', sessionController.loginRequired, trackController.new);
router.get('/tracks/:trackId(\\d+)', trackController.show);
router.post('/tracks', upload.array('track', 2), sessionController.loginRequired, trackController.create);
router.delete('/tracks/:trackId(\\d+)', sessionController.loginRequired, trackController.ownershipRequired, trackController.destroy);


module.exports = router;