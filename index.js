const os                   = require('os')
const path                 = require('path')
const https                = require('https')
const log                  = require('./lib/util/log')
const AutoEncrypt          = require('@small-tech/auto-encrypt')
const AutoEncryptLocalhost = require('@small-tech/auto-encrypt-localhost')

const AUTO_ENCRYPT_STAGING_SERVER_TYPE = 1

// Only modify this instance of the https module with our own createServer method.
const smallTechHttps = Object.assign({}, https)

smallTechHttps.createServer = function (options, listener) {
    // The first parameter is optional. If omitted, listener should be passed as the first argument.
    if (typeof options === 'function') {
      listener = options
      options = {}
    }

    const defaultSettingsPath = path.join(os.homedir(), '.small-tech.org', 'https')
    const serverScope = options.domains == undefined || options.domains.includes('localhost') ? 'local' : 'global'

    options.settingsPath = options.settingsPath ? path.join(path.resolve(options.settingsPath), serverScope) : path.join(defaultSettingsPath, serverScope)

    if (options.staging) { options.serverType = AUTO_ENCRYPT_STAGING_SERVER_TYPE }
    delete options.staging

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

    if (serverScope === 'global') {
      server.on('close', () => {
        // Allow AutoEncrypt to perform clean-up (e.g., remove interval timer for renewal check, etc.)
        AutoEncrypt.shutdown()
      })
    }

    log('   🔒    ❨@small-tech/https❩ Created HTTPS server.')
    return server
}

module.exports = smallTechHttps
