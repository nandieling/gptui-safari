#!/bin/sh

# Checks both ported packages against the sources they were assembled from, so a
# shared-theme edit that breaks a manifest reference fails here rather than in
# the browser.

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SHARED_ROOT="$PROJECT_ROOT/SafariPTTheme/Extension/Resources"
DIST_ROOT="$SCRIPT_DIR/dist"

fail() {
	printf '%s\n' "Validation failed: $*" >&2
	exit 1
}

require_file() {
	[ -f "$1" ] || fail "Missing file: $1"
}

for file in domain-utils.js target-domains.js themes.js content.js options.js options.html options.css; do
	require_file "$SHARED_ROOT/$file"
done
for file in theme.css agsv-theme.css safari-compat.css site-colors.css; do
	require_file "$PROJECT_ROOT/$file"
done
require_file "$SCRIPT_DIR/shared/background.js"
require_file "$SCRIPT_DIR/chrome/manifest.json"
require_file "$SCRIPT_DIR/firefox/manifest.json"

for file in "$SCRIPT_DIR/shared/background.js" "$SHARED_ROOT/domain-utils.js" \
	"$SHARED_ROOT/target-domains.js" "$SHARED_ROOT/themes.js" \
	"$SHARED_ROOT/content.js" "$SHARED_ROOT/options.js"; do
	node --check "$file"
done

for css_file in "$PROJECT_ROOT/theme.css" "$PROJECT_ROOT/agsv-theme.css" \
	"$PROJECT_ROOT/safari-compat.css" "$PROJECT_ROOT/site-colors.css" \
	"$SHARED_ROOT/options.css"; do
	brace_count=$(awk 'BEGIN { open_count = 0; close_count = 0 } { for (i = 1; i <= length($0); i++) { ch = substr($0, i, 1); if (ch == "{") open_count++; if (ch == "}") close_count++; } } END { print open_count, close_count }' "$css_file")
	set -- $brace_count
	[ "$1" -eq "$2" ] || fail "Unbalanced CSS braces: $css_file"
done

for target in chrome firefox; do
	[ -d "$DIST_ROOT/$target" ] || fail "Package is not assembled: run ./BrowserPTTheme/build.sh"
done

node - "$PROJECT_ROOT" "$SCRIPT_DIR" "$DIST_ROOT" <<'NODE'
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const projectRoot = process.argv[2];
const browserRoot = process.argv[3];
const distRoot = process.argv[4];
const sharedRoot = path.join(projectRoot, 'SafariPTTheme/Extension/Resources');

const fail = (message) => {
  throw new Error(message);
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const themeRegistry = {};
vm.runInNewContext(fs.readFileSync(path.join(sharedRoot, 'themes.js'), 'utf8'), themeRegistry);
const themeFiles = (themeRegistry.GPTUIThemes?.themes || []).map((theme) => theme.file);
if (!themeFiles.length) {
  fail('themes.js does not register any theme.');
}

const safariManifest = readJson(path.join(sharedRoot, 'manifest.json'));
const stylesRoot = projectRoot;

for (const target of ['chrome', 'firefox']) {
  const label = `${target} manifest`;
  const manifest = readJson(path.join(browserRoot, target, 'manifest.json'));
  const packageDir = path.join(distRoot, target);
  const requirePackageFile = (file, origin) => {
    if (!fs.existsSync(path.join(packageDir, file))) {
      fail(`${label}: ${origin} references ${file}, which is not in ${packageDir}`);
    }
  };

  if (manifest.manifest_version !== 3) {
    fail(`${label}: the port targets manifest version 3.`);
  }
  /* Chrome rejects a package whose metadata is over the store limits, so catch
   * it here instead of at upload time. */
  if (!manifest.name || manifest.name.length > 45) {
    fail(`${label}: name must be 45 characters or fewer.`);
  }
  if (!manifest.description || manifest.description.length > 132) {
    fail(`${label}: description must be 132 characters or fewer.`);
  }
  if (!/^\d+(?:\.\d+){1,3}$/.test(manifest.version || '')) {
    fail(`${label}: version is not a dotted version string.`);
  }
  for (const legacyKey of ['browser_action', 'page_action', 'options_page']) {
    if (manifest[legacyKey]) {
      fail(`${label}: ${legacyKey} is a manifest v2 key.`);
    }
  }
  if (manifest.background?.scripts) {
    fail(`${label}: manifest v3 uses a service worker, not background.scripts.`);
  }
  if (!manifest.permissions?.includes('storage')) {
    fail(`${label}: the storage permission is required.`);
  }
  if (!manifest.action || manifest.action.default_popup) {
    fail(`${label}: the toolbar button must stay popup-less so background.js can open the settings tab.`);
  }
  if (!manifest.background?.service_worker) {
    fail(`${label}: a background service worker is required.`);
  }
  if (!manifest.options_ui?.page || manifest.options_ui.open_in_tab !== true) {
    fail(`${label}: options_ui must open the settings panel in a tab.`);
  }
  const contentScript = manifest.content_scripts?.[0];
  if (!contentScript?.matches?.includes('<all_urls>')) {
    fail(`${label}: runtime translation domains require an <all_urls> content-script match.`);
  }
  if (contentScript.run_at !== 'document_start' || contentScript.all_frames !== true) {
    fail(`${label}: the theme has to run at document_start in every frame.`);
  }
  for (const file of contentScript.js) {
    requirePackageFile(file, 'content_scripts');
    const source = [sharedRoot, stylesRoot].find((root) => fs.existsSync(path.join(root, file)));
    if (!source) {
      fail(`${label}: ${file} is not assembled from any known source directory.`);
    } else if (!fs.readFileSync(path.join(source, file)).equals(fs.readFileSync(path.join(packageDir, file)))) {
      fail(`${label}: ${file} is stale, rebuild the package.`);
    }
  }

  const accessible = (manifest.web_accessible_resources || []).flatMap((entry) => entry.resources || []);
  const requiredStyles = [...new Set([...themeFiles, 'safari-compat.css', 'site-colors.css'])];
  for (const style of requiredStyles) {
    if (!accessible.includes(style)) {
      fail(`${label}: ${style} must stay listed in web_accessible_resources.`);
    }
    requirePackageFile(style, 'web_accessible_resources');
    if (!fs.readFileSync(path.join(stylesRoot, style)).equals(fs.readFileSync(path.join(packageDir, style)))) {
      fail(`${label}: ${style} is stale, rebuild the package.`);
    }
  }
  for (const entry of manifest.web_accessible_resources || []) {
    if (!entry.matches?.length) {
      fail(`${label}: every web accessible resource group needs a matches list.`);
    }
  }

  requirePackageFile(manifest.options_ui.page, 'options_ui');
  requirePackageFile(manifest.background.service_worker, 'background');
  for (const file of Object.values(manifest.icons || {})) {
    requirePackageFile(file, 'icons');
  }
  for (const file of Object.values(manifest.action.default_icon || {})) {
    requirePackageFile(file, 'action.default_icon');
  }

  const options = fs.readFileSync(path.join(packageDir, manifest.options_ui.page), 'utf8');
  if (options.includes('macOS Safari extension')) {
    fail(`${label}: the options panel still announces the Safari build.`);
  }

  if (manifest.version !== safariManifest.version) {
    fail(`${label}: version ${manifest.version} differs from the Safari build ${safariManifest.version}.`);
  }

  if (target === 'chrome' && !manifest.minimum_chrome_version) {
    fail(`${label}: pin minimum_chrome_version, the styles need :has() support.`);
  }
  if (target === 'firefox') {
    const gecko = manifest.browser_specific_settings?.gecko;
    if (!gecko?.id || !gecko.strict_min_version) {
      fail(`${label}: Firefox needs browser_specific_settings.gecko id and strict_min_version.`);
    }
  }
}

if (readJson(path.join(browserRoot, 'chrome/manifest.json')).version !==
    readJson(path.join(browserRoot, 'firefox/manifest.json')).version) {
  fail('The Chrome and Firefox manifests must ship the same version.');
}
NODE

printf '%s\n' 'Chrome and Firefox packages validated.'
