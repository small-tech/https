const os = require('os')
const path = require('path')
const https = require('https')
const AutoEncrypt = require('@small-tech/auto-encrypt')
const AutoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')

function log(...args) {
  if (process.env.QUIET) {
    return
  }
  console.log(...args)
}

// Only modify this instance of the https module with our own createServer method.
const smallTechHttps = Object.assign({}, https)

// Enumeration. The server types expected by AutoEncrypt. Default is production.
AutoEncryptServerType = {
  PRODUCTION: 0,
  STAGING: 1,
  PEBBLE: 2,
}

smallTechHttps.createServer = function (options, listener) {
    // The first parameter is optional. If omitted, listener should be passed as the first argument.
    if (typeof options === 'function') {
      listener = options
      options = {}
    }

    const defaultSettingsPath = path.join(os.homedir(), '.small-tech.org', 'https')
    const serverScope = options.domains == undefined || options.domains.includes('localhost') ? 'local' : 'global'

    options.settingsPath = options.settingsPath ? path.join(path.resolve(options.settingsPath), serverScope) : path.join(defaultSettingsPath, serverScope)

    if (options.staging) { options.serverType = AutoEncryptServerType.STAGING }
    if (options.pebble)  { options.serverType = AutoEncryptServerType.PEBBLE  }
    delete options.staging
    delete options.pebble

    const logMessage = {
      local: 'at localhost with locally-trusted certificates',
      global: 'with globally-trusted Let’s Encrypt certificates'
    }

    const autoEncryptScope = {
      local: AutoEncryptLocalhost,
      global: AutoEncrypt
    }

    log(`   🔒    ❨@small-tech/https❩ Creating server ${logMessage[serverScope]}.`)
    const server = autoEncryptScope[serverScope].https.createServer(options, listener)

    log('   🔒    ❨@small-tech/https❩ Created HTTPS server.')
    return server
}

module.exports = smallTechHttps
