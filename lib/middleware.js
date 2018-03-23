'use strict';
module.exports = {
  create,
  find,
  findOne,
  update,
  destroy
};

function create(req, res, next) {
  req.controller.create(req.body)
  .then((model) => {
    if (!model) {
      res.status(500).end();
    } else {
      res.status(201).json(model).end();
    }
  })
  .catch(err => handleErrors(err, next));
}

function find(req, res, next) {
  req.controller.find(req.query, req.body)
  .then((models) => {
    if (!models) {
      res.status(500).end();
    } else {
      res.status(200).json(models).end();
    }
  })
  .catch(err => handleErrors(err, next));
}

function findOne(req, res, next) {
  req.controller.findOne(req.query, req.body)
  .then((model) => {
    if (!model) {
      res.status(404).end();
    } else {
      res.status(200).json(model).end();
    }
  })
  .catch(err => handleErrors(err, next));
}

function update(req, res, next) {
  req.controller.update(req.query, req.body)
  .then((model) => {
    if (!model) {
      res.status(404).end();
    } else {
      res.status(200).json(model).end();
    }
  })
  .catch(err => handleErrors(err, next));
}

function destroy(req, res, next) {
  req.controller.destroy(req.query, req.body)
  .then((model) => {
    if (!model) {
      res.status(404).end();
    } else {
      res.status(200).json(model).end()
    }
  })
  .catch(err => handleErrors(err, next));
}

function handleErrors(err, next){
  if (err.name == 'ValidationError'){
    var err_array = ['ValidationError'];
    Object.keys(err.errors).forEach(function (field) {
      err_array.push(err.errors[field].message);
    });
    next(err_array);
  }
  else
    next(err);
}