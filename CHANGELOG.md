# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.3] - 2021-03-24

A hybrid approach to local certificates.

### Changed

Upgrade Auto Encrypt Localhost to version 7.0.7.

This vresion implements a hybrid approach to mkcert installation and certificate authority and certificate creation that combines the best parts of the methods used in 6.x and 7.x.

Specifically:

  - __mkcert is now installed at post-install__ (which removes the requirement for the graphical sudo prompt, which was using pkexec, which behaves differently to sudo and was creating the certificate material files with the wrong permissions on Linux).

  - __root certificate authority and TLS certificates are created as necessary at runtime__ (while this requires the person to enter their sudo password, the prompt is shown in the command-line as expected unlike [the npm bug that was causing the prompt to be hidden when run in a lifecycle script](https://github.com/npm/cli/issues/2887)).


## [3.0.2] - 2021-03-23

Cross platform once again.

### Changed

  - Upgrade Auto Encrypt Localhost to version 7.0.5.

    This fixes installation on macOS (which was failing because of differences in how the graphical sudo prompt affects file permissions between Linux and macOS) and re-implements Windows support (tested/supported only on Windows 10, under Windows Terminal, with PowerShell).

  - Upgrade Auto Encrypt to version 3.0.1.

    This fixes a regression introduced on Windows in the 3.x branch due to the way in which `__dirname` was being defined.

  - Reduce package size (unpacked) from 51.2KB to 18.3KB by linking to AGPL license body instead of including the entire text of it.

## [3.0.1] - 2021-03-17

### Fixed

  - Hang during npm install due to npm bug in Auto Encrypt Localhost (AEL). Upgraded AEL to version 7.0.4 which includes a graphical sudo prompt workaround.

## [3.0.0] - 2021-03-09

__Breaking change:__ ESM version. Includes Auto Encrypt 3.0.0 and Auto Encrypt Localhost 7.0.2.

### Changed

  - Uses ECMAScript Modules (ESM; es6 modules).
  - Upgraded Auto Encrypt to version 3.0.0 (ESM + includes the latest Let’s Encrypt staging certificate authority root certificate for testing).
  - Upgraded Auto Encrypt Localhost to version 7.0.2 (the mkcert binaries are no longer bundled).
  - Testing and coverage: migrate from using nyc, tap-spec, and tap-nyc to c8 and tap-monkey.
  - Reduce npm package size by specifying files whitelist.

## [2.1.1] - 2021-02-16

### Changed

   - Upgrade Auto Encrypt to version 2.0.6. Fixes assignment to constant that would result in a crash when a Retry-After header was received from Let’s Encrypt.

## [2.1.0] - 2020-11-04

### Changed

  - Upgrade Auto Encrypt Localhost to version 6.1.0. (This upgrades mkcert to 1.4.2 and includes the new separate mkcert arm64 binary.)

## [2.0.0] - 2020-11-03

### Changed

  - __Breaking change:__ Update to Auto Encrypt Localhost version 6.0.0.

    Running multiple local servers at different HTTPS ports no longer results in an error due to port 80 being unavailable for the HTTP Server. However, know that only the first server will get the HTTP Server at port 80 that redirects HTTP calls to HTTPS and also serves your local root certificate authority public key.

## [1.6.1] - 2020-10-29

### Improved

  - Update dependencies to remove npm vulnerability warnings.

## [1.6.0] - 2020-07-11

### Added

  - Update Auto Encrypt Localhost to 5.4.0 to add arm64 support on Linux.

## [1.5.1] - 2020-07-10

### Fixed

  - Update Auto Encrypt to 2.0.4 to fix HTTP → HTTPS redirects on global servers. They now work (the HTTP server was not being started previously due to a typo in the monkey-patched method name).

## [1.5.0] - 2020-07-07

### Changed

  - Update Auto Encrypt Localhost to version 5.3.0 (now serves the local root certificate authority’s public key at route /.ca).

## [1.4.0] - 2020-07-06

### Changed

  - Update Auto Encrypt Localhost to version 5.2.2 (you can now access local servers from any device on your local network via its IPv4 address).

## [1.3.1] - 2020-07-03

### Changed

  - Update to Auto Encrypt version 2.0.1 (HTTP to HTTPS forwarding is now logged).

## [1.3.0] - 2020-07-03

### Changed

  - Update to Auto Encrypt version 2.0.0 with automatic HTTP to HTTPS forwarding for servers at hostname.

## [1.2.5] - 2020-06-20

### Changed

  - Update to Auto Encrypt version 1.0.3 with fix for carriage returns in CSRs causing some certificate provisioning attempts to fail.

## [1.2.4] - 2020-06-16

### Changed

  - Updated Auto Encrypt to version 1.0.2 and Auto Encrypt localhost to version 5.1.2 (fixes and cosmetic improvements).

## [1.2.3] - 2020-06-16

### Changed

  - Updated Auto Encrypt to version 1.0.1 and Auto Encrypt localhost to version 5.1.1.
  - Log output now conforms to format used by Site.js.

## [1.2.2] - 2020-04-16

### Added

  - Minor: clean up old (pre-version-1.2.0) certificate folders at startup.

## [1.2.1] - 2020-04-15

### Added

  - Minor: add repository link to package file.

## [1.2.0] - 2020-04-15

### Changed

  - Let’s Encrypt certificates are now managed by [Auto Encrypt](https://source.ind.ie/site.js/lib/Auto Encrypt).
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

  - Update to latest Nodecert (version 3.1.4) which fixes regression so Node.js once again recognises local certificates as valid.

## [1.0.5] - 2019-11-26

### Fixed

  - Update to latest Nodecert (version 3.1.3) which fixes crash when multiple directories are missing in the requested Nodecert configuration directory.

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
