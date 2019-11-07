// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
'use strict';
/* global Promise */

var ACME2 = require('./acme-v2-node').ACME;

function resolveFn(cb) {
  return function (val) {
    // nextTick to get out of Promise chain
    process.nextTick(function () { cb(null, val); });
  };
}
function rejectFn(cb) {
  return function (err) {
    console.error('[acme-v2] handled(?) rejection as errback:');
    console.error(err.stack);

    // nextTick to get out of Promise chain
    process.nextTick(function () { cb(err); });

    // do not resolve promise further
    return new Promise(function () {});
  };
}

function create(deps) {
  deps.LeCore = {};
  var acme2 = ACME2.create(deps);
  acme2.registerNewAccount = function (options, cb) {
    acme2.accounts.create(options).then(resolveFn(cb), rejectFn(cb));
  };
  acme2.getCertificate = function (options, cb) {
    options.agreeToTerms = options.agreeToTerms || function (tos) {
      return Promise.resolve(tos);
    };
    acme2.certificates.create(options).then(function (certs) {
      var privkeyPem = acme2.RSA.exportPrivatePem(options.domainKeypair);
      certs.privkey = privkeyPem;
      resolveFn(cb)(certs);
    }, rejectFn(cb));
  };
  acme2.getAcmeUrls = function (options, cb) {
    acme2.init(options).then(resolveFn(cb), rejectFn(cb));
  };
  acme2.getOptions = function () {
    var defs = {};

    Object.keys(module.exports.defaults).forEach(function (key) {
      defs[key] = defs[deps] || module.exports.defaults[key];
    });

    return defs;
  };
  acme2.stagingServerUrl = module.exports.defaults.stagingServerUrl;
  acme2.productionServerUrl = module.exports.defaults.productionServerUrl;
  acme2.acmeChallengePrefix = module.exports.defaults.acmeChallengePrefix;
  return acme2;
}

module.exports.ACME = { };
module.exports.defaults = {
  productionServerUrl:    'https://acme-v02.api.letsencrypt.org/directory'
, stagingServerUrl:       'https://acme-staging-v02.api.letsencrypt.org/directory'
, knownEndpoints:         [ 'keyChange', 'meta', 'newAccount', 'newNonce', 'newOrder', 'revokeCert' ]
, challengeTypes:         [ 'http-01', 'dns-01' ]
, challengeType:          'http-01'
//, keyType:                'rsa' // ecdsa
//, keySize:                2048 // 256
, rsaKeySize:             2048 // 256
, acmeChallengePrefix:    '/.well-known/acme-challenge/'
};
Object.keys(module.exports.defaults).forEach(function (key) {
  module.exports.ACME[key] = module.exports.defaults[key];
});
Object.keys(ACME2).forEach(function (key) {
  module.exports.ACME[key] = ACME2[key];
});
module.exports.ACME.create = create;
