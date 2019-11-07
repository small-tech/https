const Express = require('express')
const https = require('..')
const hostname = require('@small-tech/cross-platform-hostname')

//
// Create and configure a basic “Hello, world!” Express app.
//
const app = Express()

app.get('/', (request, response) => {
  response.writeHeader(200, {'Content-Type': 'text/html'})
  response.end('<!doctype html><html lang=\'en\'><head><meta charset=\'utf-8\'/><title>Hello, world!</title><style>body{background-color: white; font-family: sans-serif;}</style></head><body><h1>Hello, world!</h1></body></html>')
})

//
// Create an HTTPS server with
//

const options = {
  server: 'staging',
  configDir: `./example/config/${hostname}`,
  // approvedDomains: [hostname], // (default)
  debug: true
}

const server = https.createServer(options, app)

server.listen(443, () => {
  console.log(' 🎉 Server running on port 443.')
})
