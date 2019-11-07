# [le-challenge-webroot](https://git.rootprojects.org/root/acme-http-01-webroot.js)

| [letsencrypt](https://git.rootprojects.org/root/greenlock.js) (library)
| [letsencrypt-cli](https://git.rootprojects.org/root/greenlock-cli.js)
| [letsencrypt-express](https://git.rootprojects.org/root/greenlock-express.js)
| [letsencrypt-cluster](https://git.rootprojects.org/root/greenlock-cluster.js)
| [letsencrypt-koa](https://git.rootprojects.org/root/greenlock-koa.js)
| [letsencrypt-hapi](https://git.rootprojects.org/root/greenlock-hapi.js)
|

An fs-based strategy for Greenlock for setting, retrieving,
and clearing ACME (Let's Encrypt) challenges issued by the ACME server

This places the acme challenge in an appropriate directory in the specified `webrootPath`
and removes it once the challenge has either completed or failed.

* Safe to use with node cluster
* Safe to use with ephemeral services (Heroku, Joyent, etc)

Install
-------

```bash
npm install --save le-challenge-fs@2.x
```

Usage
-----

```js
var http01Challenge = require('le-challenge-fs').create({
  webrootPath: '/srv/www/:hostname/.well-known/acme-challenge'   // defaults to os.tmpdir() + '/' + 'acme-challenge'
, debug: false
});

var Greenlock = require('greenlock');

Greenlock.create({
  ...
, challenges: {
    'http-01': http01Challenge
  }
});
```

NOTE: If you request a certificate with 6 domains listed,
it will require 6 individual challenges.

Exposed Methods
---------------

For ACME Challenge:

* `set(opts, domain, key, val, done)`
* `get(defaults, domain, key, done)`
* `remove(defaults, domain, key, done)`
