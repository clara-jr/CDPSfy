var models = require('../models/models.js');

// MW que permite acciones solamente si la lista objeto pertenece al usuario logeado o si es cuenta admin
exports.ownershipRequired = function(req, res, next){
    var objTrackOwner = req.list.UserId;
    var logUser = req.session.user.id;
    var isAdmin = req.session.user.isAdmin;

    if (isAdmin || objTrackOwner === logUser) {
        next();
    } else {
        res.redirect('/');
    }
};

// Autoload :id
exports.load = function(req, res, next, listId) {
  models.List.find({
            where: {
                id: Number(listId)
            }
        }).then(function(list) {
      if (list) {
        req.list = list;
        next();
      } else{next(new Error('No existe listId=' + listId))}
    }
  ).catch(function(error){next(error)});
};

// Devuelve una lista de las canciones disponibles y sus metadatos
// GET /users/:userId/tracks
exports.list = function (req, res, next) {
  var options = {};
  options.where = {UserId: req.user.id}
  models.List.findAll(options).then(function(lists) {
    res.render('lists/index', {lists: lists});
  }).catch(function(error) { next(error);})
};

exports.create = function (req, res, next) {
  var list = models.List.build(
    {
      listname: req.body.list,
      UserId: req.session.user.id
    }
  );
  console.log(list)
  list
  .validate()
  .then(
    function(err){
      if (err) {
        next(new Error ('Error procesando la petición'));
      } else {
        list // save: guarda en DB campos listname y UserId de list
        .save()
        .then(res.redirect(req.get('referer'))) 
      }
    }
  ).catch(function(error){next(error)});
};

exports.update = function (req, res, next) {
  var options = {};
  options.where = {listname:req.body.list, UserId: req.session.user.id} // and UserId = res.session.user.id
  models.List.find(options).then(
    function(encontrado) {
      if (encontrado) {
        listid = encontrado.id;
        console.log("Encontrado: "+encontrado.id+encontrado.listname)
        req.track.ListId  = listid;
        req.track
        .validate()
        .then(
          function(err){
            if (err) {
              next(new Error ('Error procesando la petición'));
            } else {
              req.track     // save: guarda campo ListId en DB
              .save( {fields: ["ListId"]}) // ESTO ESTO ESTO ESTO
              .then(res.redirect(req.get('referer'))) //function(){ res.redirect(req.session.redir.toString());});
            }     // Redirección HTTP a path anterior
          }
        ).catch(function(error){next(error)});
      }
    }
  )
};

exports.destroy = function (req, res, next) {
  req.track.ListId  = null;
  req.track
  .validate()
  .then(
    function(err){
      if (err) {
        next(new Error ('Error procesando la petición'));
      } else {
        req.track     // save: guarda campo ListId en DB
        .save( {fields: ["ListId"]}) // ESTO ESTO ESTO ESTO
        .then(res.redirect(req.get('referer'))) //function(){ res.redirect(req.session.redir.toString());});
      }     // Redirección HTTP a path anterior
    }
  ).catch(function(error){next(error)});
};