// Copyright 2018 AJ ONeal. All rights reserved
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// For the time being I'm still pulling in my acme-v2 module until I transition over
// I export as ".ACME" rather than bare so that this can be compatible with the browser version too
module.exports.ACME = require('acme-v2').ACME;
