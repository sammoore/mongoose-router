# mongoose-express-router

> Create Express 4 router and middleware from Mongoose 4 model.

## Usage

```javascript
var express = require('express');
var mongoose = require('mongoose');
var router = require('mongoose-express-router');

var db = mongoose.createConnection('mongodb://localhost/test');
var schema = mongoose.Schema({ name: 'string' });
var User = mongoose.model('User', schema);

var app = express();
app.use('/users', router(User));

app.listen(3000);
```

The underlying [mongoose-controller][mongoose-controller] used by each middleware
is available, as well as the middleware functions themselves:

```javascript
router(User).middleware
router(User).controller
```

### Queries

The following query parameters are recognized:

- `skip` or `offset`
- `limit`
- `sort`
- `select`
- `populate`
- `where` \*

> \*: where depends on the availability of nested query string parameters.

In addition, any `req.params` will be assigned as where parameters. This is useful
if nested query parameters are not available, as multiple routes can point to one
instance of a router. For example:

```javascript
var app = express();
var r = router(Model);

app.use('/model/skip/:skip', r);
app.use('/model', r);
```

### Body parsing

You must provide your own body parsing middleware. A `req.body` object must be
available for the post/create middleware to work.

### Builtin middleware

_Incomplete_

[mongoose-controller]: https://github.com/samtheprogram/mongoose-controller
