# redirect-https

__Originally from the redirect-https module. Pre ACME-TLS mono-repo.__

Secure-by-default redirects from HTTP to HTTPS.

* Browsers get a 301 + Location redirect
* Only developers, bots, and APIs see security warning (advising to use HTTPS)
* Always uses meta redirect as a fallback, for everyone
* '/' always gets a 301 (for `curl | bash` installers)
* minimally configurable, don't get fancy

See <https://coolaj86.com/articles/secure-your-redirects/>

## Installation and Usage

```bash
npm install --save redirect-https
```

```js
'use strict';

var express = require('express');
var app = express();

app.use('/', require('redirect-https')({
  body: '<!-- Hello Mr Developer! Please use HTTPS instead -->'
}));

module.exports = app;
```

## Options

```js
{ port: 443           // defaults to 443
, body: ''            // defaults to an html comment to use https
, trustProxy: true    // useful if you haven't set this option in express
, browsers: 301       // issue 301 redirect if the user-agent contains "Mozilla/"
, apis: 'meta'        // issue meta redirects to non-browsers
}
```

* This module will call `next()` if the connection is already tls / https.
* If `trustProxy` is true, and `X-Forward-Proto` is https, `next()` will be called.
* If you use `{{URL}}` in the body text it will be replaced with a URI encoded and HTML escaped url (it'll look just like it is)
* If you use `{{HTML_URL}}` in the body text it will be replaced with a URI decoded and HTML escaped url (it'll look just like it would in Chrome's URL bar)

## Advanced Options

For the sake of `curl | bash` installers and the like there is also the option to cause bots and apis (i.e. curl)
to get a certain redirect for an exact path match:

```js
{ paths: [
    { match: '/'
    , redirect: 301
    }
  , { match: /^\/$/
    , redirect: 301
    }
  ]
}
```

If you're using this, you're probably getting too fancy (but hey, I get too fancy sometimes too).

## Demo

```javascript
'use strict';

var http = require('http');
var server = http.createServer();
var securePort = process.argv[2] || 8443;
var insecurePort = process.argv[3] || 8080;

server.on('request', require('redirect-https')({
  port: securePort
, body: '<!-- Hello! Please use HTTPS instead -->'
, trustProxy: true // default is false
}));

server.listen(insecurePort, function () {
  console.log('Listening on http://localhost.pplwink.com:' + server.address().port);
});
```

# Meta redirect by default, but why?

When something is broken (i.e. insecure), you don't want it to kinda work, you want developers to notice.

Using a meta redirect will break requests from `curl` and api calls from a programming language, but still have all the SEO and speed benefits of a normal `301`.

```html
<html><head>
<meta http-equiv="refresh" content="0;URL='https://example.com/foo'" />
</head><body>
<!-- Hello Mr. Developer! Please use https instead. Thank you! -->
</html>
```

# Other strategies

If your application is properly separated between static assets and api, then it would probably be more beneficial to return a 200 OK with an error message inside

# Security

The incoming URL is already URI encoded by the browser but, just in case, I run an html escape on it
so that no malicious links of this sort will yield unexpected behavior:

  * `http://localhost.pplwink.com:8080/"><script>alert('hi')</script>`
  * `http://localhost.pplwink.com:8080/';URL=http://example.com`
  * `http://localhost.pplwink.com:8080/;URL=http://example.com`

# License

MIT License

Copyright (c) 2016 Daplie, Inc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
