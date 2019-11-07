'use strict';

var os = require('os');
var path = require('path');
var homeRe = new RegExp("^~(\\/|\\\\|\\" + path.sep + ")");
// very basic check. Allows *.example.com.
var re = /^(\*\.)?[a-zA-Z0-9\.\-]+$/;
var punycode = require('punycode');
var promisify = (require('util').promisify || require('bluebird').promisify);
var dnsResolveMxAsync = promisify(require('dns').resolveMx);

var crossPlatformHostname = require('@small-tech/cross-platform-hostname')

module.exports.attachCertInfo = function (results) {
  // XXX Note: Parsing the certificate info comes at a great cost (~500kb)
  var getCertInfo = require('../cert-info').info;
  var certInfo = getCertInfo(results.cert);

  // subject, altnames, issuedAt, expiresAt
  Object.keys(certInfo).forEach(function (key) {
    results[key] = certInfo[key];
  });

  return results;
};

module.exports.isValidDomain = function (domain) {
  if (re.test(domain)) {
    return domain;
  }

  domain = punycode.toASCII(domain);

  if (re.test(domain)) {
    return domain;
  }

  return '';
};

module.exports.merge = function (/*defaults, args*/) {
  var allDefaults = Array.prototype.slice.apply(arguments);
  var args = allDefaults.shift();
  var copy = {};

  allDefaults.forEach(function (defaults) {
    Object.keys(defaults).forEach(function (key) {
      copy[key] = defaults[key];
    });
  });

  Object.keys(args).forEach(function (key) {
    copy[key] = args[key];
  });

  return copy;
};

module.exports.tplCopy = function (copy) {
  var homedir = require('os').homedir();
  var tplKeys;

  copy.hostnameGet = function (copy) {
    return (copy.domains || [])[0] || copy.domain;
  };

  Object.keys(copy).forEach(function (key) {
    var newName;
    if (!/Get$/.test(key)) {
      return;
    }

    newName = key.replace(/Get$/, '');
    copy[newName] = copy[newName] || copy[key](copy);
  });

  tplKeys = Object.keys(copy);
  tplKeys.sort(function (a, b) {
    return b.length - a.length;
  });

  tplKeys.forEach(function (key) {
    if ('string' !== typeof copy[key]) {
      return;
    }

    copy[key] = copy[key].replace(homeRe, homedir + path.sep);
  });

  tplKeys.forEach(function (key) {
    if ('string' !== typeof copy[key]) {
      return;
    }

    tplKeys.forEach(function (tplname) {
      if (!copy[tplname]) {
        // what can't be templated now may be templatable later
        return;
      }
      copy[key] = copy[key].replace(':' + tplname, copy[tplname]);
    });
  });

  return copy;
};

module.exports.testEmail = function (email) {

  // Email addresses are not compulsory in Let’s Encrypt. However, Greenlock.js,
  // the library that ACME TLS was forked from, decided to make them required
  // (because surveillance capitalism). That decision also permeated into the
  // other modules (like storage) which use the email address as an identifier.
  // Instead of gutting the whole damn thing, what we’re doing is overloading the
  // email property to use as an identifier. If it’s an actual email address, things
  // work as before. If, however, it holds the hostname of the current machine, then
  // we use it as a local identifier so the modules in Greenlock think they have an
  // email address but when it comes time to make the ACME calls to Let’s Encrypt,
  // we have our fork of the acme-v2 module discard the email address.
  //
  // All this malarkey because… ok, screw it… I’m done bitching – just stop doing
  // crap like this folks. In the timeless words of Lily Allen, “You're not big,
  // you're not clever.”
  if (email === crossPlatformHostname) {
    return Promise.resolve('')
  }

  var parts = (email||'').split('@');
  var err;

  if (2 !== parts.length || !parts[0] || !parts[1]) {
    err = new Error("malformed email address '" + email + "'");
    err.code = 'E_EMAIL';
    return Promise.reject(err);
  }

  return dnsResolveMxAsync(parts[1]).then(function (records) {
    // records only returns when there is data
    if (!records.length) {
      throw new Error("sanity check fail: success, but no MX records returned");
    }
    return email;
  }, function (err) {
    if ('ENODATA' === err.code) {
      err = new Error("no MX records found for '" + parts[1] + "'");
      err.code = 'E_EMAIL';
      return Promise.reject(err);
    }
  });
};
