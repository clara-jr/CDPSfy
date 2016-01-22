var fs = require('fs');
var models = require('../models/models.js');

// MW que permite acciones solamente si el track objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objTrackOwner = req.track.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objTrackOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload - factoriza el código si ruta incluye :trackId
exports.load = function(req, res, next, trackId) {
  models.Tracks.find(trackId).then(
    function(track) {
      if (track) {
        req.track = track;
        next();
      } else { next(new Error('No existe trackId=' + trackId)); }
    }
  ).catch(function(error) { next(error);});
};

// Devuelve una lista de las canciones disponibles y sus metadatos
exports.list = function (req, res) {
	models.Tracks.findAll().then(function(tracks) {
		res.render('tracks/index', {tracks: tracks});
	}).catch(function(error) { next(error);})
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción.
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	res.render('tracks/show', {track: req.track});
};

// Escribe una nueva canción en el registro de canciones.
// TODO:
// - Escribir en tracks.cdpsfy.es el fichero de audio contenido en req.files.track.buffer
// - Escribir en el registro la verdadera url generada al añadir el fichero en el servidor tracks.cdpsfy.es
exports.create = function (req, res) {
	var track = req.files[0];
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.filename.split('.')[0];
	var name = track.originalname.split('.')[0];

	// Aquí debe implementarse la escritura del fichero de audio (track.buffer) en tracks.cdpsfy.es
	// Copiamos el archivo a la carpeta definitiva de audios
    fs.createReadStream('./uploads/'+id).pipe(fs.createWriteStream('./public/media/'+track.originalname)); // Cambiar ./public/media/ por /mnt/nas/
    // Borramos el archivo temporal creado
    fs.unlink('./uploads/'+id);
	// Esta url debe ser la correspondiente al nuevo fichero en tracks.cdpsfy.es
	var url = '/media/'+track.originalname; // Cambiar /media/ por /mnt/nas/
	if(req.files[1]){
	    var image = req.files[1];
	    console.log('Nuevo fichero de audio. Datos: ', image);
	    var id = image.filename.split('.')[0];
	    var urlimage = '/images/'+image.originalname;
	    fs.createReadStream('./uploads/'+id).pipe(fs.createWriteStream('./public'+urlimage));
	    fs.unlink('./uploads/'+id);
	}
	else {
		urlimage = '/images/quaver3.png'
	}

	// Escribe los metadatos de la nueva canción en el registro.
	var track = models.Tracks.build(
		{ name: name,
          url: url,
          image: urlimage,
          UserId: req.session.user.id
        }
    );
	// guarda en DB los campos name y url de track
	track.save().then(function(){
	    res.redirect('/tracks');  
	})
};

// Borra una canción (trackId) del registro de canciones 
// TODO:
// - Eliminar en tracks.cdpsfy.es el fichero de audio correspondiente a trackId
exports.destroy = function (req, res) {
	// Aquí debe implementarse el borrado del fichero de audio indetificado por trackId en tracks.cdpsfy.es
	fs.unlink('./public/media/'+req.track.name+'.mp3'); // Cambiar ./public/media/ por /mnt/nas/
	if (req.track.image != '/images/quaver3.png') {
		fs.unlink('./public'+req.track.image);
	}
	// Borra la entrada del registro de datos
	req.track.destroy().then( function() {
	    res.redirect('/tracks');
	}).catch(function(error){next(error)});
};