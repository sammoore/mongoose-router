'use strict';

const { create, defineProperty, keys } = Object;

const Controller = require('mongoose-controller');
const express = require('express');
const middleware = require('./lib/middleware');

module.exports = function createRouter(Model) {
  const controller = new Controller(Model);
  const router = express.Router();

  getter(router, 'controller', create(controller));
  getter(router, 'middleware', create(middleware));
  
  router.use((req, res, next) => {
    req.controller = router.controller;
    next();
  });
  
  router.route('/')
    .get(middleware.find)
    .post(middleware.create);

  router.route('/:_id')
    .all((req, res, next) => {
      req.query = query(req.query, req.params);
      next();
    })
    .get(middleware.findOne)
    .patch(middleware.update)
    .delete(middleware.destroy);

  return router;
};

function getter(obj, name, it) {
  defineProperty(obj, name, {
    get: () => it
  });
}

function query(qsObject, params) {
  if (keys(params).length < 1) {
    return qsObject;
  }

  qsObject.where = qsObject.where || {};

  for (var key in params) {
    qsObject.where[key] = params[key];
  }

  return qsObject;
}
