import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import test from 'tape'
import bent from 'bent'
import hostname from '@small-tech/cross-platform-hostname'
import https from '../index.js'

const getHttpsString = bent('GET', 'string')

const DEFAULT_SETTINGS_PATH = path.join(os.homedir(), '.small-tech.org', 'https')
const CUSTOM_SETTINGS_PATH  = path.join(DEFAULT_SETTINGS_PATH, 'test')

function setup () {
  fs.removeSync(path.join(DEFAULT_SETTINGS_PATH, 'global', 'staging'))
  fs.removeSync(CUSTOM_SETTINGS_PATH)
}

async function testLocalAndGlobalServer (t, customSettingsPath = false) {
  const localOptions = customSettingsPath ? {} : {settingsPath: CUSTOM_SETTINGS_PATH}

  const globalOptions = {
    staging: true,
    domains: [hostname]
  }
  if (customSettingsPath) { globalOptions.settingsPath = CUSTOM_SETTINGS_PATH }

  // Test local server
  const localServer = https.createServer(localOptions, (request, response) => {
    response.end('local server ok')
  })

  await new Promise((resolve, reject) => {
    localServer.listen(443, () => {
      resolve()
    })
  })

  const localServerResponse = await getHttpsString('https://localhost')

  t.strictEquals(localServerResponse, 'local server ok', 'local server response is as expected')

  localServer.close()

  await new Promise((resolve, reject) => {
    localServer.on('close', () => {
      resolve()
    })
  })

  // Test global server

  const globalServer = https.createServer(globalOptions, (request, response) => { response.end('global server ok') })

  await new Promise((resolve, reject) => {
    globalServer.listen(443, () => {
      resolve()
    })
  })

  const globalServerResponse = await getHttpsString(`https://${hostname}`)

  t.strictEquals(globalServerResponse, 'global server ok', 'global server response is as expected')

  globalServer.close()

  await new Promise((resolve, reject) => {
    globalServer.on('close', () => {
      resolve()
    })
  })
}


test('@small-tech/https', async t => {
  setup()

  //
  // Test using default settings path.
  //

  // Test initial run (provisioning).
  await testLocalAndGlobalServer(t)

  // Test subsequent run (certificate material provided from disk).
  await testLocalAndGlobalServer(t)

  //
  // Test using custom settings path.
  //

  // Test initial run (provisioning).
  await testLocalAndGlobalServer(t, /* customSettingsPath = */ true)

  // Test subsequent run (certificate material provided from disk).
  await testLocalAndGlobalServer(t, /* customSettingsPath = */ true)

  // Test alternative function signature (no options object).
  const localServer = https.createServer((request, response) => {
    response.end('local server listener set ok')
  })

  await new Promise((resolve, reject) => {
    localServer.listen(443, () => {
      resolve()
    })
  })

  const localServerResponse = await getHttpsString('https://localhost')

  t.strictEquals(localServerResponse, 'local server listener set ok', 'alternative function signature works as expected')

  localServer.close()

  await new Promise((resolve, reject) => {
    localServer.on('close', () => {
      resolve()
    })
  })

  t.end()
})
