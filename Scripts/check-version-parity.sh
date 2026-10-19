#!/bin/sh

# The Safari app, the Safari web-extension manifest and both portable manifests
# all advertise a version, so they are checked against the single value kept in
# project.yml.  Pass a version (without the leading v) to also check a tag.

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

node - "$PROJECT_ROOT" "${1-}" <<'NODE'
const fs = require('fs');
const path = require('path');

const projectRoot = process.argv[2];
const expected = process.argv[3];
const read = (file) => fs.readFileSync(path.join(projectRoot, file), 'utf8');

const declared = /^\s*MARKETING_VERSION:\s*"([^"]+)"/m.exec(read('SafariPTTheme/project.yml'));
if (!declared) {
  throw new Error('MARKETING_VERSION is missing from SafariPTTheme/project.yml.');
}
const version = declared[1].trim();

const manifests = {
  'Safari web extension': 'SafariPTTheme/Extension/Resources/manifest.json',
  'Chrome package': 'BrowserPTTheme/chrome/manifest.json',
  'Firefox package': 'BrowserPTTheme/firefox/manifest.json'
};

for (const [label, file] of Object.entries(manifests)) {
  const manifestVersion = JSON.parse(read(file)).version;
  if (manifestVersion !== version) {
    throw new Error(`${label} declares ${manifestVersion}, project.yml declares ${version}.`);
  }
}

if (expected && expected !== version) {
  throw new Error(`the release tag carries ${expected}, the project declares ${version}.`);
}

console.log(`Version ${version} is consistent across Safari, Chrome and Firefox.`);
NODE
