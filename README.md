# @small-tech/https

Drop in replacement for Node https module that automatically handles certificate provisioning and renewal both at localhost (via Nodecert/mkcert) and at hostname (via Let’s Encrypt).

Simply replace Node’s `https` module with `@small-tech/https` and get:

  - Automatically-provisioned TLS certificates at localhost with no browser warnings.
  - Automatically-provisioned TLS certificates at hostname via Let’s Encrypt.

That’s it.

This is basically a batteries-included version of the standard Node.js `https` module.

## Audience

This is [small technology](https://small-tech.org/about#small-technology).

If you’re evaluating this for a “startup” or an enterprise, let us save you some time: this is not the right tool for you. This is individual developers to build personal web sites and apps for themselves and for others.

## Platform support

Works on Linux, macOS, and Windows (WSL is not supported for certificates at localhost unless you’re running your browser under WSL also).

## Install

```sh
npm i @small-tech/https
```

## Example

Here’s how you’d create and run a basic Express app that uses this module.

1. ### Set up:

    ```sh
    mkdir example && cd example
    npm init --yes
    npm i @small-tech/https express
    $EDITOR index.js
    ```

2. ### Code (index.js):

    ```javascript
    const Express = require('express')
    const https = require('@small-tech/https')

    //
    // Create and configure a basic “Hello, world!” Express app.
    //
    const app = Express()

    app.get('/', (request, response) => {
      response.writeHeader(200, {'Content-Type': 'text/html'})
      response.end('<!doctype html><html lang=\'en\'><head><meta charset=\'utf-8\'/><title>Hello, world!</title><style>body{background-color: white; font-family: sans-serif;}</style></head><body><h1>Hello, world!</h1></body></html>')
    })

    //
    // Create an HTTPS serve
    //

    const options = {
      server: 'production',   // Hit Let’s Encrypt’s production URL (not staging). Default is staging.
      wwwSubdomain: true,     // Also response to www.<hostname>, alongside the default of just <hostname>.
      debug: true             // Show debugging info (default is false).
    }

    const server = https.createServer(options, app)

    server.listen(443, () => {
      console.log(' 🎉 Server running on port 443.')
    })
    ```

3. ### Run:

    ```sh
    node index
    ```

Note, you can find a version of this example in the `/example` folder. To download and run that version:

```sh
# Clone this repository
git clone <LEFT OFF HERE>
```

## History

This project was initially a spike aimed at creating a mono-repo of the following modules from the Greenlock project to make it easier to maintain our fork which removed telemetry, marketing, etc., from the original project and to focus it on a single use case of automatically provisioning Let’s Encrypt certificates using just the HTTP-01 challenge method.

  - acme-tls (fork of Greenlock v2)
  - acme-v2
  - acme
  - cert-info
  - le-challenge-fs
  - le-sni-auto
  - le-store-certbot
  - mkdirp
  - urequest

You can find the original licenses in [lib/licenses/](lib/licenses/) and the original documentation for the modules (some of which may be outdated now) in [lib/docs](lib/docs).

The project has since evolved and merged with parts of [Site.js](https://sitejs.org) to create an isomorphic replacement for the Node.js `https` module that automatically provisions certificates both at localhost (via Nodecert/mkcert) and at hostname (via Let’s Encrypt).

## Credits

Based on Greenlock by AJ ONeal (minus the telemetry, marketing, and artificial email address requirement that was added to Let’s Encrypt by the original module).

## Licenses

Portions:

  - AGPL version 3.0 or later
  - Mozilla Public License 2.0
  - MIT

See [lib/licenses/](lib/licenses/)
