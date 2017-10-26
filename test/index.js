'use strict';

const assert = require('assert');
const bodyParser = require('body-parser');
const createRouter = require('../');
const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');

const ObjectId = mongoose.mongo.ObjectId;

function model(name, schema = new mongoose.Schema()) {
  return mongoose.model(name, schema);
}

function App() {
  const app = express();
  app.use(bodyParser.json());
  return app;
}

mongoose.connect('mongodb://localhost:27017/mongoose-router-test');

before(function (done) {
  model('__db').db.dropDatabase(done);
});

describe('module', function () {
  it('exports a function', function () {
    assert.equal(typeof createRouter, 'function');
  });

  it('creates a descendent of express.Router', function () {
    const router = createRouter(model('Module'));
    assert.ok(express.Router.isPrototypeOf(router));
  });
});

describe('Router', function () {
  var Wrapped, Model, router, app;

  before(function () {
    Wrapped = model('Wrapped');
    Model = model('Router', new mongoose.Schema({
      list: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Wrapped' }],
      foo: String
    }));
    router = createRouter(Model);
  });

  describe('POST /', function () {
    it('inserts and returns a document', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      request(app)
      .post('/')
      .send({})
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        Model.findById(res.body._id).exec()
        .then(doc => doc._id.toString())
        .then(id => assert.equal(id, res.body._id))
        .then(() => done())
        .catch(err => done(err));
      });
    }); 

    it('inserts and returns the specified document', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      request(app)
      .post('/')
      .send({ foo: 'bar' })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);

        Promise.resolve().then(() => {
          const { _id } = res.body;
          return Model.findOne({ _id }).exec();
        })
        .then((doc) => {
          assert.equal(doc.foo, res.body.foo);
          done();
        })
        .catch(err => done(err));
      });
    });

    it('passes errors to next middleware', function (done) {
      const schema = new mongoose.Schema();
      schema.pre('save', function (next) {
        next(new Error('dummy error'));
      });
      const router = createRouter(model('PostError', schema));

      const app = App(); 
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(418).end();
      });

      request(app)
      .post('/')
      .send({})
      .expect(418, done);
    });
  });

  describe('GET /', function (done) {
    it('responds with an array of documents', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      request(app)
      .get('/')
      .send({})
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        try {
          assert.ok(Array.isArray(res.body));
          assert.ok(res.body.every(doc => '_id' in doc));
          done();
        } catch (err) { done(err) }
      });
    });

    it('passes errors to the next middleware', function (done) {
      const schema = new mongoose.Schema();
      schema.pre('find', function (next) {
        next(new Error('dummy error'));
      });
      const router = createRouter(model('GetError', schema));
      
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(418).end();
      });

      request(app)
      .get('/')
      .send()
      .expect(418, done);
    });
  });

  describe('GET /:_id', function () {
    it('responds with 404 when no match is found', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      const id = new ObjectId().toString();
      request(app)
      .get(`/${id}`)
      .send()
      .expect(404, done);
    });

    it('responds with the correct document', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      new Model().save().then((doc) => {
        const id = doc._id.toString();

        request(app)
        .get(`/${id}`)
        .send()
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          try {
            assert.equal(res.body._id, id);
            done();
          } catch (err) { done(err) }
        });
      }).catch(err => done(err));
    });

    it('passes errors to the next middleware', function (done) {
      const schema = new mongoose.Schema();
      schema.pre('findOne', function (next) {
        next(new Error('dummy error'));
      });
      const router = createRouter(model('GetIdError', schema));

      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(418).end();
      });

      const id = new ObjectId().toString();
      request(app)
      .get(`/${id}`)
      .send()
      .expect(418, done);
    });
  });

  describe('PATCH /:_id', function () {
    it('responds with 404 if no match is found', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      const id = new ObjectId().toString();
      request(app)
      .patch(`/${id}`)
      .send({ foo: 'none' })
      .expect(404, done);
    });

    it('modifies an existing document', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      new Model().save().then((doc) => {
        const id = doc._id.toString();
        
        request(app)
        .patch(`/${id}`)
        .send({ foo: 'baz' })
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          try {
            assert.equal(res.body._id, id)
            assert.equal(res.body.foo, 'baz');
            done();
          } catch (err) { done(err) }
        });
      }).catch(err => done(err));
    });

    it('passes errors to next middleware', function (done) {
      const schema = new mongoose.Schema();
      schema.pre('save', function (next) {
        if (this.isNew) {
          next();
        } else {
          next(new Error('dummy error'));
        }
      });
      const Model = model('PatchIdError', schema);
      const router = createRouter(Model);

      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(418).end();
      });

      new Model().save().then((doc) => {
        const id = doc._id.toString();

        request(app)
        .patch(`/${id}`)
        .send({ foo: 'none' })
        .expect(418, done);
      }).catch(err => done(err));
    });
  });

  describe('DELETE /:_id', function () {
    it('responds with 404 if no match is found', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      const id = new ObjectId().toString();
      request(app)
      .delete(`/${id}`)
      .send()
      .expect(404, done);
    });

    it('deletes the provided document', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      Model.findOne({}).then((doc) => {
        const id = doc._id.toString();

        request(app)
        .delete(`/${id}`)
        .send()
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          Model.findOne({ id }).exec()
          .then(doc => assert.equal(doc, null))
          .then(() => done())
          .catch(err => done(err));
        });
      }).catch(err => done(err));
    });

    it('responds with the deleted document', function (done) {
      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(400).end();
      });

      Model.findOne({ foo: 'bar' }).then((doc) => {
        const id = doc._id.toString();

        request(app)
        .delete(`/${id}`)
        .send()
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          try {
            assert.equal(res.body._id, id);
            assert.equal(res.body.foo, 'bar');
            done();
          } catch (err) { done(err) }
        });
      }).catch(err => done(err));
    });

    it('passes errors to next middleware', function (done) {
      const schema = new mongoose.Schema();
      schema.pre('remove', function (next) {
        next(new Error('dummy error'));
      });
      const Model = model('DeleteIdError', schema);
      const router = createRouter(Model);

      const app = App();
      app.use(router);
      app.use((err, req, res, next) => {
        res.status(418).end();
      });

      new Model().save().then((doc) => {
        const id = doc._id.toString();
        console.log(id);

        request(app)
        .delete(`/${id}`)
        .send()
        .expect(418, done);
      }).catch(err => done(err));
    });
  });
});
