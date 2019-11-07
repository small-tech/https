const https = require('https')
const Express = require('express')
const AcmeTLS = require('./lib/acme-tls')

const hostname = require('@small-tech/cross-platform-hostname')

//
// The API I’m eventually aiming for is:
//
// const https = require('@small-tech/https')
// const Express = require('express')
//
// const app = new Express()
// const server = https.createServer(app)
//
// So, basically, to be isomorphic with the built-in https module.
//
// (And you can optionally supply an options object as the first argument, which would include the types of options
// you can see below.)

const acmeTLS = AcmeTLS.create({
  server: 'staging',
  configDir: `./config/${hostname}`,
  approvedDomains: [hostname],
  debug: true
})

// Additional options for the server (none yet).
const options = {}

// Add TLS options from the ACME TLS Certificate to any existing options that
// might have been passed in above. (Currently, this is the SNICallback function.)
Object.assign(options, acmeTLS.tlsOptions)

// Create an Express app.
const app = Express()

app.get('/', (request, response) => {
  response.writeHeader(200, {'Content-Type': 'text/html'})
  response.end('<!doctype html><html lang=\'en\'><head><meta charset=\'utf-8\'/><title>Hello, world!</title><style>body{background-color: white; font-family: sans-serif;}</style></head><body><h1>Hello, world!</h1></body></html>')
})

const server = https.createServer(options, app)

server.listen(443, () => {
  console.log(' 🎉 Server running on port 443.')
})
