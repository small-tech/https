# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

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
