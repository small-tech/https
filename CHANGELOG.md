# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2021-02-16

## Changed

   - Upgrade auto-encrypt to version 2.0.6. Fixes assignment to constant that would result in a crash when a Retry-After header was received from Let’s Encrypt.

## [2.1.0] - 2020-11-04

### Changed

  - Upgrade auto-encrypt-localhost to version 6.1.0. (This upgrades mkcert to 1.4.2 and includes the new separate mkcert arm64 binary.)

## [2.0.0] - 2020-11-03

### Changed

  - __Breaking change:__ Update to auto-encrypt-localhost version 6.0.0.

    Running multiple local servers at different HTTPS ports no longer results in an error due to port 80 being unavailable for the HTTP Server. However, know that only the first server will get the HTTP Server at port 80 that redirects HTTP calls to HTTPS and also serves your local root certificate authority public key.

## [1.6.1] - 2020-10-29

### Improved

  - Update dependencies to remove npm vulnerability warnings.

## [1.6.0] - 2020-07-11

### Added

  - Update auto-encrypt-localhost to 5.4.0 to add arm64 support on Linux.

## [1.5.1] - 2020-07-10

### Fixed

  - Update auto-encrypt to 2.0.4 to fix HTTP → HTTPS redirects on global servers. They now work (the HTTP server was not being started previously due to a typo in the monkey-patched method name).

## [1.5.0] - 2020-07-07

### Changed

  - Update auto-encrypt-localhost to version 5.3.0 (now serves the local root certificate authority’s public key at route /.ca).

## [1.4.0] - 2020-07-06

### Changed

  - Update auto-encrypt-localhost to version 5.2.2 (you can now access local servers from any device on your local network via its IPv4 address).

## [1.3.1] - 2020-07-03

### Changed

  - Update to auto-encrypt version 2.0.1 (HTTP to HTTPS forwarding is now logged).

## [1.3.0] - 2020-07-03

### Changed

  - Update to auto-encrypt version 2.0.0 with automatic HTTP to HTTPS forwarding for servers at hostname.

## [1.2.5] - 2020-06-20

### Changed

  - Update to auto-encrypt version 1.0.3 with fix for carriage returns in CSRs causing some certificate provisioning attempts to fail.

## [1.2.4] - 2020-06-16

### Changed

  - Updated auto-encrypt to version 1.0.2 and auto-encrypt localhost to version 5.1.2 (fixes and cosmetic improvements).

## [1.2.3] - 2020-06-16

### Changed

  - Updated auto-encrypt to version 1.0.1 and auto-encrypt localhost to version 5.1.1.
  - Log output now conforms to format used by Site.js.

## [1.2.2] - 2020-04-16

### Added

  - Minor: clean up old (pre-version-1.2.0) certificate folders at startup.

## [1.2.1] - 2020-04-15

### Added

  - Minor: add repository link to package file.

## [1.2.0] - 2020-04-15

### Changed

  - Let’s Encrypt certificates are now managed by [Auto Encrypt](https://source.ind.ie/site.js/lib/auto-encrypt).
  - Entire library is now licensed under AGPL version 3.0 or later.

## [1.1.0] - 2020-02-15

### Added

  - Support for QUIET=true environment variable for what was previously console.log() output.

## [1.0.9] - 2020-02-09

### Changed

  - Upgrade to version 3.1.7 of Nodecert (with fix to output formatting updates).

## [1.0.8] - 2020-02-09

### Changed

  - Upgrade to version 3.1.5 of Nodecert (with output formatting updates).

## [1.0.7] - 2020-02-09

### Changed

  - Update console output format to match the one used in Site.js (cosmetic).

## [1.0.6] - 2019-11-26

### Fixed

  - Update to latest nodecert (version 3.1.4) which fixes regression so Node.js once again recognises local certificates as valid.

## [1.0.5] - 2019-11-26

### Fixed

  - Update to latest nodecert (version 3.1.3) which fixes crash when multiple directories are missing in the requested nodecert configuration directory.

## [1.0.4] - 2019-11-26

### Fixed

  - Setting a custom certificate directory no longer causes a crash.

## [1.0.3] - 2019-11-26

### Fixed

  - Found and removed two other functions where Greenlock was phoning home. Seriously, what’s wrong with you, AJ? FFS!

### Added

  - Now emits `server.SMALL_TECH_ORG_ERROR_HTTP_SERVER` event on HTTP (HTTP-01 and redirection) server error.

## [1.0.2] - 2019-11-25

  - `certificateDirectory` option for overriding the default certificate directory. Local certificates will be created in a `local` subdirectory of this directory and global certificates will be created in a `global` subdirectory of this directory.

## [1.0.1] - 2019-11-09

### Fixed

  - Missing files in `lib/` folder due to existence of second `package.json` file.

## [1.0.0] - 2019-11-08

### Added

  - Initial release.
