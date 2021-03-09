import os from 'os'
import fs from 'fs-extra'
import path from 'path'
import https from 'https'
import AutoEncrypt from '@small-tech/auto-encrypt'
import AutoEncryptLocalhost from '@small-tech/auto-encrypt-localhost'
import log from './lib/util/log.js'

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

    const settingsPath = options.settingsPath ? path.join(path.resolve(options.settingsPath), serverScope) : path.join(defaultSettingsPath, serverScope)

    options.settingsPath = settingsPath

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

    log(`   🔒    ❨https❩ Creating server ${logMessage[serverScope]}.`)
    const server = autoEncryptScope[serverScope].https.createServer(options, listener)

    if (serverScope === 'global') {
      // Migration: 1.1.0 and earlier to 1.2.0+:
      // Remove the old Let’s Encrypt client’s certificate settings.
      // (And thus force upgrade to certificates managed by Auto Encrypt on first hit of server.)
      const oldLetsEncryptSettingsPathFor = directory => path.join(settingsPath, directory)
      fs.removeSync(oldLetsEncryptSettingsPathFor('accounts'))
      fs.removeSync(oldLetsEncryptSettingsPathFor('archive'))
      fs.removeSync(oldLetsEncryptSettingsPathFor('live'))
      fs.removeSync(oldLetsEncryptSettingsPathFor('renewal'))

      // Allow AutoEncrypt to perform clean-up (e.g., remove interval timer for renewal check, etc.)
      server.on('close', () => {
        AutoEncrypt.shutdown()
      })
    }

    log('   🔒    ❨https❩ Created HTTPS server.')
    return server
}

export default smallTechHttps
