const os = require('os')
const path = require('path')
const fs = require('fs')

const http = require('http')
const https = require('https')

const redirectHTTPS = require('./lib/redirect-https')
const hostname = require('@small-tech/cross-platform-hostname')
const nodecert = require('@ind.ie/nodecert')

// File system challenge (used by the HTTP-01 authentication method).
const letsEncryptFileSystemChallenge = require('./lib/le-challenge-fs')

const DAY = 24 * 60 * 60 * 1000;
const ACME = require('./lib/acme-v2-compat').ACME;

var PromiseA;
try {
  PromiseA = require('bluebird');
} catch(e) {
  PromiseA = global.Promise;
}
var util = require('util');
function promisifyAllSelf(obj) {
  if (obj.__promisified) { return obj; }
  Object.keys(obj).forEach(function (key) {
    if ('function' === typeof obj[key]) {
      obj[key + 'Async'] = util.promisify(obj[key]);
    }
  });
  obj.__promisified = true;
  return obj;
}

var Greenlock = module.exports;
Greenlock.Greenlock = Greenlock;
Greenlock.LE = Greenlock;
// in-process cache, shared between all instances
var ipc = {};

function _log(debug) {
  if (debug) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    args.unshift("[gl/index.js]");
    console.log.apply(console, args);
  }
}

Greenlock.defaults = {
  productionServerUrl: 'https://acme-v02.api.letsencrypt.org/directory'
, stagingServerUrl: 'https://acme-staging-v02.api.letsencrypt.org/directory'

, rsaKeySize: ACME.rsaKeySize || 2048
, challengeType: ACME.challengeType || 'http-01'
, challengeTypes: ACME.challengeTypes || [ 'http-01' ]

, acmeChallengePrefix: ACME.acmeChallengePrefix
};

// backwards compat
Object.keys(Greenlock.defaults).forEach(function (key) {
  Greenlock[key] = Greenlock.defaults[key];
});

// show all possible options
var u; // undefined
Greenlock._undefined = {
  acme: u
, store: u
, challenge: u
, challenges: u
, sni: u
, tlsOptions: u

, register: u
, check: u

, renewWithin: u // le-auto-sni and core
//, renewBy: u // le-auto-sni
, acmeChallengePrefix: u
, rsaKeySize: u
, challengeType: u
, server: u
, version: u
, agreeToTerms: u
, _ipc: u
, duplicate: u
, _acmeUrls: u
};
Greenlock._undefine = function (gl) {
  Object.keys(Greenlock._undefined).forEach(function (key) {
    if (!(key in gl)) {
      gl[key] = u;
    }
  });

  return gl;
};


// Creates an https server with auto Let’s Encrypt certificate management.
// (isomorphic with Node’s built in https.createServer() method).
Greenlock.createServer = function(options, requestListener) {
    // The first parameter is optional. If omitted, requestListener should
    // be passed as the first argument.
    if (typeof options === 'function') {
      requestListener = options
      options = {}
    }

    //
    // Check the type of server requested. The options are:
    //
    // 1. development (at localhost)
    // 2. production (at hostname with Let’s Encrypt certificates)
    // 3. staging (at hostname using Let’s Encrypt staging server and debug=true; for troubleshooting)
    //
    // The default is development.
    //
    if (options.domain == null) options.domain = 'localhost'          // default
    if (options.domains != null || options.domain !== 'localhost') {
      //
      // Create server to respond to requested hostnames with globally-trusted certificates.
      //
      console.log(' 🔒 [@small-tech/https] Creating server with globally-trusted Let’s Encrypt certificates.')

      // If a certificate directory is provided, use that.
      if (options.certificateDirectory != null) {
        // Since we are using local certificates, we will store them in
        // <directory-person-asked-for>/global
        options.glConfigDir = path.join(certificateDirectory, 'global')
      }

      // Add TLS options from the ACME TLS Certificate to any existing options that
      // might have been passed in above. (Currently, this is the SNICallback function.)
      const greenlock = Greenlock.create(options)
      Object.assign(options, greenlock.tlsOptions)
    } else {
      //
      // Default: create server at localhost with locally-trusted certificates.
      //
      console.log(' 🔒 [@small-tech/https] Creating server at localhost with locally-trusted certificates.')

      // If a certificateDirectory is requested, use that. Otherwise, use default (~/.nodecert).
      if (options.certificateDirectory != null) {
        // Since we are using local certificates, we will store them in
        // <directory-person-asked-for>/local
        options.certificateDirectory = path.join(options.certificateDirectory, 'local')
      }
      const nodecertDirectory = options.certificateDirectory || path.join(os.homedir(), '.small-tech.org', 'https', 'local')

      // Ensure that locally-trusted certificates exist.
      nodecert(nodecertDirectory)

      const defaultOptions = {
        key: fs.readFileSync(path.join(nodecertDirectory, 'localhost-key.pem')),
        cert: fs.readFileSync(path.join(nodecertDirectory, 'localhost.pem'))
      }

      Object.assign(options, defaultOptions)
    }

    const server = https.createServer(options, requestListener)

    console.log(' 🔒 [@small-tech/https] Created server.')

    return server
  }


Greenlock.create = function (gl) {
  gl.store = require('./lib/le-store-certbot').create({
    debug: gl.debug
  , configDir: gl.configDir || path.join(os.homedir(), '.small-tech.org', 'https', 'global')
  , logsDir: gl.logsDir
  , webrootPath: gl.webrootPath
  });
  gl.core = require('./lib/lib/core');
  var log = gl.log || _log;

  // The only challenge type we support is HTTP-01. TODO: Refactor this to simplify.
  gl.challenges = {
    'http-01': letsEncryptFileSystemChallenge.create({
      debug: gl.debug,
      webrootPath: gl.webrootPath
    })
  }

  gl = Greenlock._undefine(gl);
  gl.acmeChallengePrefix = Greenlock.acmeChallengePrefix;
  gl.rsaKeySize = gl.rsaKeySize || Greenlock.rsaKeySize;
  gl.challengeType = gl.challengeType || Greenlock.challengeType;
  gl._ipc = ipc;

  // Telemetry-related BS. Setting to app name for now until we can safely remove.
  gl._communityPackage = '@small-tech/https';
  gl._communityPackageVersion = '@small-tech/https-v1'

  // Yes, we freakin’ agree to the Terms and Conditions. Or don’t use.
  gl.agreeTos = true;
  gl.agreeToTerms = true;
  gl.telemetry = false;
  gl.communityMember = false;

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
  gl.email = hostname

  // In @small-tech/https, approvedDomains is only used internally.
  // Use the domain and domains properties to specify the domains.
  gl.approvedDomains = []

  if (gl.domain != null) {
    // Special case: 'hostname' is replaced with the hostname of the computer. It should
    // be a fully-qualified hostname for this to work.
    if (gl.domain === 'hostname') {
      gl.domain = hostname
    }
    gl.approvedDomains.push(gl.domain)
  }

  // If a domains array is provided, it is the only source of truth that is used and it
  // overrides domain if it is provided.
  if (gl.domains != null) {
    gl.approvedDomains = gl.domains
  }

  // Add support for www subdomain if requested.
  if (gl.wwwSubdomain === true) { gl.approvedDomains.push(`www.${hostname}`) }

  if (!gl.renewWithin) { gl.renewWithin = 14 * DAY; }
  // renewBy has a default in le-sni-auto

  gl.version = 'draft-11';

  if (gl.staging !== true) {
    gl.server = Greenlock.defaults.productionServerUrl
    console.log(' 🔒 [@small-tech/https] Using Let’s Encrypt production server.')
  } else {
    console.log(' 🔒 [@small-tech/https] Using Let’s Encrypt staging server.')
    gl.server = Greenlock.defaults.stagingServerUrl
    gl.debug = true
  }

  gl.acme = gl.acme || ACME.create({ debug: gl.debug });
  if (gl.acme.create) {
    gl.acme = gl.acme.create(gl);
  }
  gl.acme = promisifyAllSelf(gl.acme);
  gl._acmeOpts = gl.acme.getOptions();
  Object.keys(gl._acmeOpts).forEach(function (key) {
    if (!(key in gl)) {
      gl[key] = gl._acmeOpts[key];
    }
  });

  if (gl.store.create) {
    gl.store = gl.store.create(gl);
  }
  gl.store = promisifyAllSelf(gl.store);
  gl.store.accounts = promisifyAllSelf(gl.store.accounts);
  gl.store.certificates = promisifyAllSelf(gl.store.certificates);
  gl._storeOpts = gl.store.getOptions();
  Object.keys(gl._storeOpts).forEach(function (key) {
    if (!(key in gl)) {
      gl[key] = gl._storeOpts[key];
    }
  });


  // TODO: Simplify this as we now have only one challenge type.
  Greenlock.challengeTypes.forEach(function (challengeType) {
    var challenger = gl.challenges[challengeType];

    if (!challenger) {
      return;
    }

    if (challenger.create) {
      challenger = gl.challenges[challengeType] = challenger.create(gl);
    }
    if (!challenger.getOptionsAsync) {
      challenger = gl.challenges[challengeType] = promisifyAllSelf(challenger);
    }
    gl['_challengeOpts_' + challengeType] = challenger.getOptions();
    Object.keys(gl['_challengeOpts_' + challengeType]).forEach(function (key) {
      if (!(key in gl)) {
        gl[key] = gl['_challengeOpts_' + challengeType][key];
      }
    });

    // TODO wrap these here and now with tplCopy?
    if (!challenger.set || 5 !== challenger.set.length) {
      throw new Error("gl.challenges[" + challengeType + "].set receives the wrong number of arguments."
        + " You must define setChallenge as function (opts, domain, token, keyAuthorization, cb) { }");
    }
    if (challenger.get && 4 !== challenger.get.length) {
      throw new Error("gl.challenges[" + challengeType + "].get receives the wrong number of arguments."
        + " You must define getChallenge as function (opts, domain, token, cb) { }");
    }
    if (!challenger.remove || 4 !== challenger.remove.length) {
      throw new Error("gl.challenges[" + challengeType + "].remove receives the wrong number of arguments."
        + " You must define removeChallenge as function (opts, domain, token, cb) { }");
    }
  });

  gl.sni = gl.sni || null;
  gl.tlsOptions = gl.tlsOptions || gl.httpsOptions || {};

  // Workaround for https://github.com/nodejs/node/issues/22389
  gl._updateServernames = function (cert) {
    if (!gl._certnames) { gl._certnames = {}; }

    // Note: Any given domain could exist on multiple certs
    // (especially during renewal where some may be added)
    // hence we use a separate object for each domain and list each domain on it
    // to get the minimal full set associated with each cert and domain
    var allDomains = [cert.subject].concat(cert.altnames.slice(0));
    allDomains.forEach(function (name) {
      name = name.toLowerCase();
      if (!gl._certnames[name]) {
        gl._certnames[name] = {};
      }
      allDomains.forEach(function (name2) {
        name2 = name2.toLowerCase();
        gl._certnames[name][name2] = true;
      });
    });
  };
  gl._checkServername = function (safeHost, servername) {
    // odd, but acceptable
    if (!safeHost || !servername) { return true; }
    if (safeHost === servername) { return true; }
    // connection established with servername and session is re-used for allowed name
    if (gl._certnames[servername] && gl._certnames[servername][safeHost]) {
      return true;
    }
    return false;
  };

  if (!gl.tlsOptions.SNICallback) {
    if (!gl.getCertificatesAsync && !gl.getCertificates) {
      if (Array.isArray(gl.approveDomains)) {
        gl.approvedDomains = gl.approveDomains;
        gl.approveDomains = null;
      }
      if (!gl.approveDomains) {
        gl.approveDomains = function (lexOpts, certs, cb) {
          var err;
          var emsg;

          if (!gl.email) {
            // Make email optional (because it is in Let’s Encrypt).
            gl.email = ''
          }
          if (!gl.agreeTos) {
            throw new Error("le-sni-auto is not properly configured. Missing agreeTos");
          }
          if (!/[a-z]/i.test(lexOpts.domain)) {
            cb(new Error("le-sni-auto does not allow IP addresses in SNI"));
            return;
          }

          if (!Array.isArray(gl.approvedDomains)) {
            // The acme-v2 package uses pre-flight test challenges to
            // verify that each requested domain is hosted by the server
            // these checks are sufficient for most use cases
            return cb(null, { options: lexOpts, certs: certs });
          }

          if (lexOpts.domains.every(function (domain) {
            return -1 !== gl.approvedDomains.indexOf(domain);
          })) {
            // commented this out because people expect to be able to edit the list of domains
            // lexOpts.domains = gl.approvedDomains.slice(0);
            lexOpts.email = gl.email;
            lexOpts.agreeTos = gl.agreeTos;
            lexOpts.communityMember = gl.communityMember;
            lexOpts.telemetry = gl.telemetry;
            return cb(null, { options: lexOpts, certs: certs });
          }

          emsg = "tls SNI for '" + lexOpts.domains.join(',') + "' rejected: not in list '" + gl.approvedDomains + "'";
          log(gl.debug, emsg, lexOpts.domains, gl.approvedDomains);
          err = new Error(emsg);
          err.code = 'E_REJECT_SNI';
          cb(err);
        };
      }

      gl.getCertificates = function (domain, certs, cb) {
        // certs come from current in-memory cache, not lookup
        log(gl.debug, 'gl.getCertificates called for', domain, 'with certs for', certs && certs.altnames || 'NONE');
        var opts = { domain: domain, domains: certs && certs.altnames || [ domain ] };

        try {
          gl.approveDomains(opts, certs, function (_err, results) {
            if (_err) {
              if (false !== gl.logRejectedDomains) {
                console.error("[Error] approveDomains rejected tls sni '" + domain + "'");
                console.error("[Error] (see https://git.coolaj86.com/coolaj86/greenlock.js/issues/11)");
                if ('E_REJECT_SNI' !== _err.code) {
                  console.error("[Error] This is the rejection message:");
                  console.error(_err.message);
                }
                console.error("");
              }
              cb(_err);
              return;
            }

            log(gl.debug, 'gl.approveDomains called with certs for', results.certs && results.certs.altnames || 'NONE', 'and options:');
            log(gl.debug, results.options);

            if (results.certs) {
              log(gl.debug, 'gl renewing');
              return gl.core.certificates.renewAsync(results.options, results.certs).then(
                function (certs) {
                  // Workaround for https://github.com/nodejs/node/issues/22389
                  gl._updateServernames(certs);
                  cb(null, certs);
                }
              , function (e) {
                  console.debug("Error renewing certificate for '" + domain + "':");
                  console.debug(e);
                  console.error("");
                  cb(e);
                }
              );
            }
            else {
              log(gl.debug, 'gl getting from disk or registering new');
              return gl.core.certificates.getAsync(results.options).then(
                function (certs) {
                  // Workaround for https://github.com/nodejs/node/issues/22389
                  gl._updateServernames(certs);
                  cb(null, certs);
                }
              , function (e) {
                  console.debug("Error loading/registering certificate for '" + domain + "':");
                  console.debug(e);
                  console.error("");
                  cb(e);
                }
              );
            }
          });
        } catch(e) {
          console.error("[ERROR] Something went wrong in approveDomains:");
          console.error(e);
          console.error("BUT WAIT! Good news: It's probably your fault, so you can probably fix it.");
        }
      };
    }
    gl.sni = gl.sni || require('./lib/le-sni-auto');
    if (gl.sni.create) {
      gl.sni = gl.sni.create(gl);
    }
    gl.tlsOptions.SNICallback = function (_domain, cb) {
      // format and (lightly) sanitize sni so that users can be naive
      // and not have to worry about SQL injection or fs discovery
      var domain = (_domain||'').toLowerCase();
      // hostname labels allow a-z, 0-9, -, and are separated by dots
      // _ is sometimes allowed
      // REGEX // https://www.codeproject.com/Questions/1063023/alphanumeric-validation-javascript-without-regex
      if (!gl.__sni_allow_dangerous_names && (!/^[a-z0-9_\.\-]+$/i.test(domain) || -1 !== domain.indexOf('..'))) {
        log(gl.debug, "invalid sni '" + domain + "'");
        cb(new Error("invalid SNI"));
        return;
      }

      try {
        gl.sni.sniCallback(gl.__sni_preserve_case && _domain || domain, cb);
      } catch(e) {
        console.error("[ERROR] Something went wrong in the SNICallback:");
        console.error(e);
        cb(e);
      }
    };
  }

  // We want to move to using tlsOptions instead of httpsOptions, but we also need to make
  // sure anything that uses this object will still work if looking for httpsOptions.
  gl.httpsOptions = gl.tlsOptions;

  if (gl.core.create) {
    gl.core = gl.core.create(gl);
  }

  gl.renew = function (args, certs) {
    return gl.core.certificates.renewAsync(args, certs);
  };

  gl.register = function (args) {
    return gl.core.certificates.getAsync(args);
  };

  gl.check = function (args) {
    // TODO must return email, domains, tos, pems
    return gl.core.certificates.checkAsync(args);
  };

  gl.middleware = require('./lib/lib/middleware').create(gl);

  //
  // Automatically create https middleware with HTTP server and redirect-to-https.
  //

  // HTTP server to handle redirects for Let’s Encrypt ACME HTTP-01 challenge method.
  const httpsRedirectionMiddleware = redirectHTTPS()

  const httpServer = http.createServer(gl.middleware(httpsRedirectionMiddleware))
  httpServer.listen(80, () => {
    console.log(' 🔒 [@small-tech/https] HTTP → HTTPS redirection active.')
  })

  //var SERVERNAME_RE = /^[a-z0-9\.\-_]+$/;
  var SERVERNAME_G = /[^a-z0-9\.\-_]/;
  gl.middleware.sanitizeHost = function (app) {
    return function (req, res, next) {
      function realNext() {
        if ('function' === typeof app) {
          app(req, res);
        } else if ('function' === typeof next) {
          next();
        } else {
          res.statusCode = 500;
          res.end("Error: no middleware assigned");
        }
      }
      // Get the host:port combo, if it exists
      var host = (req.headers.host||'').split(':');

      // if not, move along
      if (!host[0]) { realNext(); return; }

      // if so, remove non-allowed characters
      var safehost = host[0].toLowerCase().replace(SERVERNAME_G, '');

      // if there were unallowed characters, complain
      if (!gl.__sni_allow_dangerous_names && safehost.length !== host[0].length) {
        res.statusCode = 400;
        res.end("Malformed HTTP Header: 'Host: " + host[0] + "'");
        return;
      }

      // make lowercase
      if (!gl.__sni_preserve_case) {
        host[0] = safehost;
        req.headers.host = host.join(':');
      }

      // Note: This sanitize function is also called on plain sockets, which don't need Domain Fronting checks
      if (req.socket.encrypted && !gl.__sni_allow_domain_fronting) {
        if (req.socket && 'string' === typeof req.socket.servername) {
          // Workaround for https://github.com/nodejs/node/issues/22389
          if (!gl._checkServername(safehost, req.socket.servername.toLowerCase())) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.end(
                "<h1>Domain Fronting Error</h1>"
              + "<p>This connection was secured using TLS/SSL for '" + req.socket.servername.toLowerCase() + "'</p>"
              + "<p>The HTTP request specified 'Host: " + safehost + "', which is (obviously) different.</p>"
              + "<p>Because this looks like a domain fronting attack, the connection has been terminated.</p>"
            );
            return;
          }
        } else if (safehost && !gl.middleware.sanitizeHost._skip_fronting_check) {
          // TODO how to handle wrapped sockets, as with telebit?
          console.warn("\n\n\n[ACME TLS] WARN: no string for req.socket.servername,"
            + " skipping fronting check for '" + safehost + "'\n\n\n");
          gl.middleware.sanitizeHost._skip_fronting_check = true;
        }
      }

      // carry on
      realNext();
    };
  };
  gl.middleware.sanitizeHost._skip_fronting_check = false;

  return gl;
};
