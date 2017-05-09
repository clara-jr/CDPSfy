var fs = require('fs'),
	models = require('../models/models.js'),
	ffmpeg = require('fluent-ffmpeg'),
	Promise = require('bluebird'),
	nodePath = require('path');

// MW que permite acciones solamente si el track objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function (req, res, next) {
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
exports.load = function (req, res, next, trackId) {
	models.Tracks.find(trackId).then(
		function (track) {
			if (track) {
				req.track = track;
				next();
			} else { next(new Error('No existe trackId=' + trackId)); }
		}
	).catch(function (error) { next(error); });
};

// Devuelve una lista de las canciones disponibles y sus metadatos
// GET /tracks
// GET /users/:userId/tracks req.user se crea en autoload de usuarios
// GET /lists/:listId/tracks req.list se crea en autoload de listas
exports.list = function (req, res, next) {
	var options = {};
	var lista = false;
	if (req.user) {
		options.where = { UserId: req.user.id }
	}
	if (req.list) {
		options.where = { ListId: req.list.id }
		lista = true;
	}
	models.Tracks.findAll(options).then(function (tracks) {
		res.render('tracks/index', { tracks: tracks, lista: lista });
	}).catch(function (error) { next(error); })
};

// Devuelve la vista del formulario para subir una nueva canción
exports.new = function (req, res) {
	res.render('tracks/new');
};

// Devuelve la vista de reproducción de una canción
// El campo track.url contiene la url donde se encuentra el fichero de audio
exports.show = function (req, res) {
	res.render('tracks/show', { track: req.track });
};

function convertToMp3(path, name) {
	return new Promise((resolve, reject) => {
		var newName = name.split('.')[0] + '.mp3';
		ffmpeg(nodePath.resolve(path + name)).output(nodePath.resolve(path + newName)).on('end', () => {
			return resolve(path + newName);
		}).on('error', (err) => {
			return reject(err);
		}).run();
	});
}

function convertToM4a(path, name) {
	return new Promise((resolve, reject) => {
		var newName = name.split('.')[0] + '.m4a';
		ffmpeg(nodePath.resolve(path + name)).output(nodePath.resolve(path + newName)).on('end', () => {
			return resolve(path + newName);
		}).on('error', (err) => {
			return reject(err);
		}).run();
	});
}

function convertToOgg(path, name) {
	return new Promise((resolve, reject) => {
		var newName = name.split('.')[0] + '.ogg';
		ffmpeg(nodePath.resolve(path + name)).output(nodePath.resolve(path + newName)).on('end', () => {
			return resolve(path + newName);
		}).on('error', (err) => {
			return reject(err);
		}).run();
	});
}

function convertToRemainingFileTypes(path, name) {
	var tasks = [];
	var format = name.split('.')[1];
	switch (format) {
		case "mp3": {
			tasks.push(convertToM4a(path, name));
			tasks.push(convertToOgg(path, name));
			break;
		}
		case "m4a": {
			tasks.push(convertToMp3(path, name));
			tasks.push(convertToOgg(path, name));
			break;
		}
		case "ogg": {
			tasks.push(convertToM4a(path, name));
			tasks.push(convertToMp3(path, name));
			break;
		}
		default: {
			tasks.push(convertToMp3(path, name));
			tasks.push(convertToOgg(path, name));
			tasks.push(convertToM4a(path, name));
			break;
		}
	}
	return Promise.all(tasks);
}

// Escribe una nueva canción en el registro de canciones
exports.create = function (req, res, next) {
	var track = req.files.track;
	console.log('Nuevo fichero de audio. Datos: ', track);
	var id = track.name.split('.')[0];
	var name = track.originalname.split('.')[0];
	var extension = track.originalname.split('.')[1];

	var urlMp3 = '/media/' + name + '.mp3';
	var urlOgg = '/media/' + name + '.ogg';
	var urlM4a = '/media/' + name + '.m4a';
	fs.writeFile("./public/media/" + track.originalname, track.buffer, function (err) {
		if (err) throw err;
		console.log("Track Saved!");
		var track = models.Tracks.build(
			{
				name: name,
				urlMp3: urlMp3,
				urlOgg: urlOgg,
				urlM4a: urlM4a,
				image: urlimage,
				UserId: req.session.user.id
			}
		);
		// guarda en DB los campos name y url de track
		track.save().then(function () {
			return convertToRemainingFileTypes('./public/media/', name + '.' + extension);
		}).then(() => {
			return res.redirect('/tracks');
		}).catch((err) => {
			return next(err);
		})
	});

	if (req.files.img) {
		var image = req.files.img;
		console.log('Nuevo fichero de audio. Datos: ', image);
		var urlimage = '/images/' + image.originalname;
		fs.writeFile("./public/images/" + image.originalname, image.buffer, function (err) {
			if (err) throw err;
			console.log("Img Saved!");
		});
	}
	else {
		urlimage = '/images/quaver3.png'
	}

};

// Borra una canción (trackId) del registro de canciones
exports.destroy = function (req, res, next) {
	// Borrado del fichero de audio identificado por trackId
	fs.unlink('./public' + req.track.urlMp3);
	fs.unlink('./public' + req.track.urlM4a);
	fs.unlink('./public' + req.track.urlOgg);
	if (req.track.image != '/images/quaver3.png') {
		fs.unlink('./public' + req.track.image);
	}
	// Borra la entrada del registro de datos
	req.track.destroy().then(function () {
		res.redirect('/tracks');
	}).catch(function (error) { next(error) });
};