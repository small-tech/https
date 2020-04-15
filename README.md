# @small-tech/https

A drop-in standard Node.js HTTPS module replacement with both automatic development-time (localhost) certificates via Auto Encrypt Localhost and automatic production certificates via Auto Encrypt.

Simply replace Node’s `https` module with `@small-tech/https` and get:

  - Automatically-provisioned TLS certificates at localhost with no browser warnings.
  - Automatically-provisioned TLS certificates at hostname via Let’s Encrypt.

That’s it.

This is basically a batteries-included version of the standard Node.js `https` module.

## Like this? Fund us!

[Small Technology Foundation](https://small-tech.org) is a tiny, independent not-for-profit.

We exist in part thanks to patronage by people like you. If you share [our vision](https://small-tech.org/about/#small-technology) and want to support our work, please [become a patron or donate to us](https://small-tech.org/fund-us) today and help us continue to exist.

## Audience

This is [small technology](https://small-tech.org/about/#small-technology).

If you’re evaluating this for a “startup” or an enterprise, let us save you some time: this is not the right tool for you. This tool is for individual developers to build personal web sites and apps for themselves and for others in a non-colonial manner that respects the human rights of the people who use them.

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

    // For globally-trusted Let’s Encrypt certificates uncomment the following section.
    // To provision certificates, also remove “staging: true” property.

    // const os = require('os')
    // options = {
    //   domains: [os.hostname()],
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
git clone https://source.small-tech.org/site.js/lib/https.git

# Switch to the directory.
cd https

# Install dependencies.
npm i

# Run the example.
npm run example
```

## Related projects

Lower-level:

### Auto Encrypt

  - Source: https://source.small-tech.org/site.js/lib/auto-encrypt
  - Package: [@small-tech/auto-encrypt](https://www.npmjs.com/package/@small-tech/auto-encrypt)

Adds automatic provisioning and renewal of [Let’s Encrypt](https://letsencrypt.org) TLS certificates with [OCSP Stapling](https://letsencrypt.org/docs/integration-guide/#implement-ocsp-stapling) to [Node.js](https://nodejs.org) [https](https://nodejs.org/dist/latest-v12.x/docs/api/https.html) servers (including [Express.js](https://expressjs.com/), etc.)

### Auto Encrypt Localhost

  - Source: https://source.small-tech.org/site.js/lib/auto-encrypt-localhost
  - Package: [@small-tech/auto-encrypt-localhost](https://www.npmjs.com/package/@small-tech/auto-encrypt-localhost)

Automatically provisions and installs locally-trusted TLS certificates for Node.js https servers (including Express.js, etc.) using [mkcert](https://github.com/FiloSottile/mkcert/).

Higher level:

### Site.js

  - Web site: https://sitejs.org
  - Source: https://source.small-tech.org/site.js/app

A complete [small technology](https://small-tech.org/about/#small-technology) tool for developing, testing, and deploying a secure static or dynamic personal web site or app with zero configuration.

## Copyright

&copy; 2020 [Aral Balkan](https://ar.al), [Small Technology Foundation](https://small-tech.org).

Let’s Encrypt is a trademark of the Internet Security Research Group (ISRG). All rights reserved. Node.js is a trademark of Joyent, Inc. and is used with its permission. We are not endorsed by or affiliated with Joyent or ISRG.

## License

[AGPL version 3.0 or later.](https://www.gnu.org/licenses/agpl-3.0.en.html)
