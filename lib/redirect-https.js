// MIT License

// Copyright (c) 2016 Daplie, Inc

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

'use strict';

module.exports = function (opts) {
  var escapeHtml = require('escape-html');

  if (!opts) {
    opts = {};
  }
  if (!isFinite(opts.port)) {
    opts.port = 443;
  }
  if (!opts.browsers) {
    opts.browsers = 301;
  }
  if (!opts.apis) {
    opts.apis = 'meta';
  }
  if (!Array.isArray(opts.paths)) {
    opts.paths = [ { match: '/' } ];
  }
  if (!('body' in opts)) {
    opts.body = "<!-- Hello Developer Person! We don't serve insecure resources around here."
      + "\n    Please use HTTPS instead. -->";
  }
  opts.body = opts.body.replace(/{{\s+PORT\s+}}/ig, opts.port);

  return function (req, res, next) {
    if (req.connection.encrypted
      || 'https' === req.protocol
      || (opts.trustProxy && 'https' === req.headers['x-forwarded-proto'])
    ) {
      next();
      return;
    }

    var url = (req.originalUrl || req.url);
    // We don't want chrome showing the "Not Secure" badge during the redirect.
    var probablyBrowser = (0 === (req.headers['user-agent']||'').indexOf('Mozilla/'));
    // But we don't want devs, APIs, or Bots to accidentally browse insecure.
    var redirect = probablyBrowser ? opts.browsers : opts.apis;
    var host = req.headers.host || '';
		if (!/:\d+/.test(host) && 443 !== opts.port) {
			// we are using standard port 80, but we aren't using standard port 443
			host += ':80';
		}
    var newLocation = 'https://'
      + host.replace(/:\d+/, ':' + opts.port) + url
      ;

    //var encodedLocation = encodeURI(newLocation);
    var escapedLocation = escapeHtml(newLocation);
    var decodedLocation;
    try {
      decodedLocation = decodeURIComponent(newLocation);
    } catch(e) {
      decodedLocation = newLocation; // "#/error/?error_message=" + e.toString();
    }

    var body = opts.body
          .replace(/{{\s*HTML_URL\s*}}/ig, escapeHtml(decodedLocation))
          .replace(/{{\s*URL\s*}}/ig, escapedLocation)
          .replace(/{{\s*UNSAFE_URL\s*}}/ig, newLocation)
          ;

    var metaRedirect = ''
      + '<html>\n'
      + '<head>\n'
      //+ '  <style>* { background-color: white; color: white; text-decoration: none; }</style>\n'
      + '  <META http-equiv="refresh" content="0;URL=\'' + escapedLocation + '\'">\n'
      + '</head>\n'
      + '<body>\n' + body + '\n</body>\n'
      + '</html>\n'
      ;
    var pathMatch;

    opts.paths.some(function (p) {
      if (!p.match) {
        // ignore
      } else if ('string' === typeof p.match) {
        pathMatch = (url === p.match) && (p.redirect || 301);
      } else {
        pathMatch = p.match.test && p.match.test(url) && (p.redirect || 301);
      }
      if (pathMatch) {
        redirect = pathMatch;
      }
      return pathMatch;
    });
    // If it's not a non-0 number (because null is 0) then 'meta' is assumed.
    if (redirect && isFinite(redirect)) {
      res.statusCode = redirect;
      res.setHeader('Location', newLocation);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(metaRedirect);
  };
};
