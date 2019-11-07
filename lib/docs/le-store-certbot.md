# Deprecated

`le-store-certbot` has been replaced with [`le-store-fs`](https://git.coolaj86.com/coolaj86/le-store-fs.js).

The new storage strategy **keeps file system compatibility**, but **drops support** for Python config files.

Unless you're running `certbot` and Greenlock side-by-side, or interchangeably, you switch to `le-store-fs`.

## Migrating to `le-store-fs`

It's **painless** and all of your existing certificates will be **preserved**
(assuming you use the same `configDir` as before).

```js
Greenlock.create({

  // Leave configDir as it, if you've been setting it yourself.
  // Otherwise you should explicitly set it to the previous default:
  configDir: '~/letsencrypt/etc'

  // le-store-fs takes the same options as le-store-certbot,
  // but ignores some of the ones that aren't important.
, store: require('le-store-fs').create({})

  ...
})
```

## Alternatives

  * Search npm for ["le-store-"](https://www.npmjs.com/search?q=le-store-) to find many alternatives.

# le-store-certbot

The "certbot" storage strategy for
[Greenlock.js](https://git.coolaj86.com/coolaj86/le-store-certbot.js).

This le storage strategy aims to maintain compatibility with the
configuration files and file structure of the official certbot client.

Note: You cannot use this strategy on ephemeral instances (heroku, aws elastic).

Usage
-----

```bash
npm install --save le-store-certbot@2.x
```

```bash
var leStore = require('le-store-certbot').create({
  configDir: require('homedir')() + '/acme/etc'          // or /etc/acme or wherever
, privkeyPath: ':configDir/live/:hostname/privkey.pem'          //
, fullchainPath: ':configDir/live/:hostname/fullchain.pem'      // Note: both that :configDir and :hostname
, certPath: ':configDir/live/:hostname/cert.pem'                //       will be templated as expected by
, chainPath: ':configDir/live/:hostname/chain.pem'              //       greenlock.js

, logsDir: require('homedir')() + '/tmp/acme/log'

, webrootPath: '~/acme/srv/www/:hostname/.well-known/acme-challenge'

, debug: false
});
```

The store module can be used globally with Greenlock like this:

```
var Greenlock = require('greenlock');

Greenlock.create({
  ...
, store: leStore
});
```

Example File Structure
----------------------

```
~/acme/
└── etc
    ├── accounts
    │   └── acme-staging.api.letsencrypt.org
    │       └── directory
    │           └── cd96ac4889ddfa47bfc66300ab223342
    │               ├── meta.json
    │               ├── private_key.json
    │               └── regr.json
    ├── archive
    │   └── example.com
    │       ├── cert0.pem
    │       ├── chain0.pem
    │       ├── fullchain0.pem
    │       └── privkey0.pem
    ├── live
    │   └── example.com
    │       ├── cert.pem
    │       ├── chain.pem
    │       ├── fullchain.pem
    │       ├── privkey.pem
    │       └── privkey.pem.bak
    └── renewal
        ├── example.com.conf
        └── example.com.conf.bak
```
