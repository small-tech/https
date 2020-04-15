const https = require('..')

// Helpers
function html(message) {
  return `<!doctype html><html lang='en'><head><meta charset='utf-8'/><title>Hello, world!</title><style>body{background-color: white; font-family: sans-serif;}</style></head><body><h1>${message}</h1></body></html>`
}
const headers = {'Content-Type': 'text/html'}

let options = {}

// For globally-trusted Let’s Encrypt certificates uncomment options.
// To provision certificates, also remove “staging: true” property.

const os = require('os')
options = {
  domains: [os.hostname()],
  // staging: true
}

// Create HTTPS server at https://localhost with locally-trusted certificates.
const server = https.createServer(options, (request, response) => {
  // Respond to all routes with the same page.
  response.writeHead(200, headers)
  response.end(html('Hello, world!'))
})

server.listen(443, () => {
  console.log('   🎉    Server running on port 443.')
})
