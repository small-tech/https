const http = require('http')
const https = require('https')
const redirectHTTPS = require('./lib/redirect-https')
const Express = require('express')
const AcmeTLS = require('./lib/acme-tls')

const hostname = require('@small-tech/cross-platform-hostname')

const acmeTLS = AcmeTLS.create({
  // Note: while testing, you might want to use the staging server at:
  // ===== https://acme-staging-v02.api.letsencrypt.org/directory
  server: 'https://acme-v02.api.letsencrypt.org/directory',

  version: 'draft-11',
  configDir: `./config/${hostname}`,
  approvedDomains: [hostname],
  agreeTos: true,

  // Instead of an email address, we pass the hostname. ACME TLS is based on
  // Greenlock.js and those folks decided to make email addresses a requirement
  // instead of an optional element as is the case with Let’s Encrypt. This has deep
  // architectural knock-ons including to the way certificates are stored in
  // the le-store-certbot storage strategy, etc. Instead of forking and gutting
  // multiple modules (I’ve already had to fork a number to remove the telemetry),
  // we are using the hostname in place of the email address as a local identifier.
  // Our fork of acme-v02 is aware of this and will simply disregard any email
  // addresses passed that match the hostname before making the call to the ACME
  // servers. (That module, as it reflects the ACME spec, does _not_ have the email
  // address as a required property.)
  email: hostname,

  telemetry: false,
  communityMember: false
})

// HTTP server to handle redirects for Let’s Encrypt ACME HTTP-01 challenge method.
const httpsRedirectionMiddleware = redirectHTTPS()

const httpServer = http.createServer(acmeTLS.middleware(httpsRedirectionMiddleware))
httpServer.listen(80, () => {
  console.log('👉 HTTP → HTTPS redirection active.')
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
