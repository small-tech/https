# ACME TLS

Forked from [Greenlock](https://git.coolaj86.com/coolaj86/greenlock.js), a [Root](https://therootcompany.com/) [v2.6.8](https://git.coolaj86.com/coolaj86/greenlock.js/src/tag/v2.6.8). Greenlock [is a trademark](https://greenlock.domains/legal/#trademark) of [AJ ONeal](https://coolaj86.com/).

## How it differs:

  * Email address is not required.
  * No telemetry or tracking. (TODO)
  * ACME v2 only. (TODO)

## Why the fork?

Greenlock introduced a privacy-violating requirement for obtaining a [Let’s Encrypt](https://letsencrypt.org) TLS certificate that goes above and beyond what is mandated by Let’s Encrypt. When you register for a Let’s Encrypt TLS certificate, you do not need to provide your email address. This is A Good Thing™. Greenlock makes the email address required. This fork removes this artificial requirement.

## Usage

If you want a simple-to-use [Small Tech](https://ar.al/2019/03/04/small-technology/) personal web server that automatically provisions both locally-trusted TLS certificates using [nodecert]() and globally-trusted ones using this module, see [HTTPS Server](https://source.ind.ie/hypha/tools/https-server/)

See [the relevant method](https://source.ind.ie/hypha/tools/https-server/blob/master/index.js) in HTTPS Server for an example of real-world usage.

## Example

Here is an example based on HTTPS Server that sets up an Express server. The first time you hit it, TLS certificates will be automatically provisioned for you.

### Prerequisites:

```sh
mkdir example && cd example
npm init --yes
npm i express redirect-https @ind.ie/acme-tls
touch index.js && $EDITOR index.js
```

If you’re on Linux, you will need to also run this (or the equivalent for your distribution if you don’t have the _apt_ package manager) to bind to port 443 for TLS as we’re still engaged in mainframe-era privileged port security theatre on that platform:

```sh
sudo apt install libcap2-bin
setcap 'cap_net_bind_service=+ep' $(which node)
```

### Code:

```js
const os = require('os')
const Express = require('express')
const AcmeTLS = require('@ind.ie/acme-tls')
const redirectHTTPS = require('redirect-https')

// Obtain TLS certificates for the current host.
// Note: if you want this to work on Windows 10 also, use
// ===== https://source.ind.ie/site.js/lib/cross-platform-hostname
const hostname = os.hostname()

const acmeTLS = AcmeTLS.create({
  // Note: while testing, you might want to use the staging server at:
  // ===== https://acme-staging-v02.api.letsencrypt.org/directory
  server: 'https://acme-v02.api.letsencrypt.org/directory',

  version: 'draft-11',
  configDir: `~/.nodecert/${hostname}/`,
  approvedDomains: [hostname, `www.${hostname}`],
  agreeTos: true,
  telemetry: false,           // This will be removed shortly.
  communityMember: false      // This will be removed shortly.
})

// Create an HTTP server to handle redirects for the Let’s Encrypt
// ACME HTTP-01 challenge method.
const httpsRedirectionMiddleware = redirectHTTPS()

const httpServer = http.createServer(acmeTLS.middleware(httpsRedirectionMiddleware))
httpServer.listen(80, () => {
  console.log(' 👉 HTTP → HTTPS redirection active.')
})

// You can pass additional options to the server.
// (We don’t in this example.)
const options = {}

// Add the TLS options from ACME TLS Certificate to any existing
// options that might have been passed in.
Object.assign(options, acmeTLS.tlsOptions)

// Create an Express app.
const app = Express()

// Create a very simple index route.
app.get('/', (request, response) => {
  response.writeHeader(200, {'Content-Type': 'text/html'})
  response.end('<!doctype html><html lang=\'en\'><head><meta charset=\'utf-8\'/><title>Hello, world!</title><style>body{background-color: white; font-family: sans-serif;}</style></head><body><h1>Hello, world!</h1></body></html>')
})

// Create and return the HTTPS server.
const server = https.createServer(options, app)

// Serve the site on port 443.
server.listen(443, () => {
  console.log(' 🎉 Server running on port 443.')
})
```

## License

All commits later than and including [fccf48b](https://source.ind.ie/hypha/tools/acme-tls/commit/fccf48bb43c77499d79a55d70233384323fdd988) are licensed under AGPLv3 or later. All commits before and including [ff000c4](https://source.ind.ie/hypha/tools/acme-tls/commit/ff000c40f115192407f6927590fb5229a6754680) licensed under MPL 2.0.
