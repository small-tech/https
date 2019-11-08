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

## A note on Linux and the security farce that is “privileged ports”

Linux has an outdated feature dating from the mainframe days that requires a process that wants to bind to ports < 1024 to have elevated privileges. While this was a security feature in the days of dumb terminals, today it is a security anti-feature. (macOS has dropped this requirement as of macOS Mojave.)

On Linux, ensure your Node process has the right to bind to so-called “privileged” ports by issuing the following command before use:

```sh
sudo setcap cap_net_bind_service=+ep $(which node)
```

If you are wrapping your Node app into an executable binary using a module like [Nexe](https://github.com/nexe/nexe), you will have to ensure that every build of your app has that capability set. For an example of how we do this in [Site.js](https://sitejs.org), [see this listing](https://source.ind.ie/site.js/app/blob/master/bin/lib/ensure.js#L124).

## Example

Here’s a basic Express “hello, world” app that shows you how this module can be used. Note that you don’t need express to use it.

1. ### Set up:

    ```sh
    # Create the project folder and switch to it.
    mkdir example && cd example

    # Create a new npm module for the example.
    npm init --yes

    # Install dependencies.
    npm i @small-tech/https express

    # Open up the main file in your default editor.
    $EDITOR index.js
    ```

2. ### Code (index.js):

    ```javascript
    const https = require('..')

    // Helpers
    function html(message) {
      return `<!doctype html><html lang='en'><head><meta charset='utf-8'/><title>Hello, world!</title><style>body{background-color: white; font-family: sans-serif;}</style></head><body><h1>${message}</h1></body></html>`
    }
    const contentTypeHTML = {'Content-Type': 'text/html'}

    let options = {}

    // For globally-trusted Let’s Encrypt certificates uncomment options.
    // To provision certificates, also remove “staging: true” property.

    // options = {
    //   domain: 'hostname',
    //   staging: true
    // }

    // Create HTTPS server at https://localhost
    // with locally-trusted certificates.
    const server = https.createServer(options, (request, response) => {
      if (request.method !== 'GET') {
        response.writeHead(404, contentTypeHTML)
        response.end(html('Not found.'))
        return
      }
      // Respond to all routes with the same page.
      response.writeHead(200, contentTypeHTML)
      response.end(html('Hello, world!'))
    })

    server.listen(443, () => {
      console.log(' 🎉 Server running on port 443.')
    })
    ```

3. ### Run:

    ```sh
    node index
    ```

Hit `https://localhost` and you should see your site with locally-trusted TLS certificates.

To provision globally-trusted Let’s Encrypt certificates instead, uncomment the `options` object and pass it as the first argument in the `createServer()` method.

You can find a version of this example in the `/example` folder. To download and run that version:

```sh
# Clone this repository.
git clone https://source.ind.ie/site.js/lib/https.git

# Switch to the directory.
cd https

# Install dependencies.
npm i

# Run the example.
npm run example
```

## History

This project was initially a spike aimed at creating a mono-repo of the following modules from the Greenlock project to make it easier to maintain our fork which removed telemetry, marketing, etc., from the original project and to focus it on a single use case of automatically provisioning Let’s Encrypt certificates using just the HTTP-01 challenge method:

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

The project has since evolved and merged with [nodecert](https://source.ind.ie/hypha/tools/nodecert) and parts of [Site.js](https://sitejs.org) to create an isomorphic replacement for the Node.js `https` module that automatically provisions both locally-trusted certificates for use at localhost and globally-trusted certificates at fully-qualified domain names.

## Credits

The Let’s Encrypt functionality is based on Greenlock by AJ ONeal (minus the telemetry, marketing, and artificial email address requirement that was added to Let’s Encrypt by the original module).

## Copyright & licenses

Portions copyright &copy; Aral Balkan, Small Technology Foundation. Portions copyright other authors as listed in the various license files.

Portions:

  - AGPL version 3.0 or later
  - Mozilla Public License 2.0
  - MIT

See [lib/licenses/](lib/licenses/)
