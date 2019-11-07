# @ind.ie/acme-v2.js

Forked from acme-v2.js v1.5.2 by [AJ ONeal](https://coolaj86.com/) for use in [ACME TLS](https://source.ind.ie/hypha/tools/acme-tls).

## How it differs

Allows empty email addresses from upstream and treats them as if an email address was not provided. This is to work around an artifically-introduced privacy eroding requirement in Greenlock that is removed in ACME TLS.

This module is only for use in ACME TLS.

For all other purposes, [please see the original module](https://git.coolaj86.com/coolaj86/acme-v2.js).

## License

All commits later than and including [87753bd](https://source.ind.ie/hypha/forks/acme-v2.js/commit/87753bdb6d85c709a2c876b15dbb3355f2437e86) are licensed under AGPLv3 or later. All commits before and including [1af2fb2](https://source.ind.ie/hypha/forks/acme-v2.js/commit/1af2fb29589c1a3f41b27bec21111c676bffeaa0) licensed under MPL 2.0.
