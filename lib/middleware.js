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
    .catch((err) => next(err));
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
    .catch((err) => next(err));
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
    .catch((err) => next(err));
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
    .catch((err) => next(err));
}

function destroy(req, res, next) {
  req.controller.destroy(req.query, req.body)
    .then((model) => {
      if (!model) {
        res.status(404).end();
      } else {
        res.status(200).json(model).end();
      }
    })
    .catch((err) => next(err));
}
