#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
EXTENSION_ROOT="$PROJECT_ROOT/SafariPTTheme"
RESOURCES_ROOT="$EXTENSION_ROOT/Extension/Resources"
APP_ENTITLEMENTS="$EXTENSION_ROOT/SafariPTTheme.entitlements"
EXTENSION_ENTITLEMENTS="$EXTENSION_ROOT/SafariPTThemeExtension.entitlements"
PLIST_BUDDY=/usr/libexec/PlistBuddy

fail() {
	printf '%s\n' "Validation failed: $*" >&2
	exit 1
}

require_file() {
	[ -f "$1" ] || fail "Missing file: $1"
}

# plutil -p prints a textual dump whose quoting changed between macOS releases,
# so read single keys with PlistBuddy instead of matching on that output.
entitlement_is_true() {
	value=$(LC_ALL=C "$PLIST_BUDDY" -c "Print :$2" "$1" 2>/dev/null | tr '[:upper:]' '[:lower:]' || true)
	[ "$value" = "true" ] || [ "$value" = "yes" ]
}

command -v plutil >/dev/null 2>&1 || fail "plutil is required to read Info.plist"
[ -x "$PLIST_BUDDY" ] || fail "PlistBuddy is required to read entitlements"

require_file "$PROJECT_ROOT/theme.css"
require_file "$PROJECT_ROOT/agsv-theme.css"
require_file "$PROJECT_ROOT/safari-compat.css"
require_file "$PROJECT_ROOT/1.png"
require_file "$EXTENSION_ROOT/project.yml"
require_file "$EXTENSION_ROOT/SafariPTTheme.xcodeproj/project.pbxproj"
require_file "$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/Contents.json"
for icon_file in \
	"$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/icon_16.png" \
	"$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/icon_32.png" \
	"$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/icon_128.png" \
	"$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/icon_256.png" \
	"$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/icon_512.png" \
	"$EXTENSION_ROOT/Assets.xcassets/AppIcon.appiconset/icon_1024.png"; do
	require_file "$icon_file"
done
require_file "$RESOURCES_ROOT/manifest.json"
require_file "$RESOURCES_ROOT/domain-utils.js"
require_file "$RESOURCES_ROOT/target-domains.js"
require_file "$RESOURCES_ROOT/themes.js"
require_file "$RESOURCES_ROOT/content.js"
require_file "$RESOURCES_ROOT/options.html"
require_file "$RESOURCES_ROOT/options.js"
require_file "$RESOURCES_ROOT/options.css"
require_file "$EXTENSION_ROOT/Extension/Info.plist"
require_file "$APP_ENTITLEMENTS"
require_file "$EXTENSION_ENTITLEMENTS"

node --check "$RESOURCES_ROOT/domain-utils.js"
node --check "$RESOURCES_ROOT/target-domains.js"
node --check "$RESOURCES_ROOT/themes.js"
node --check "$RESOURCES_ROOT/content.js"
node --check "$RESOURCES_ROOT/options.js"
plutil -lint "$EXTENSION_ROOT/Extension/Info.plist" >/dev/null
plutil -lint "$APP_ENTITLEMENTS" >/dev/null
plutil -lint "$EXTENSION_ENTITLEMENTS" >/dev/null

# A project format newer than the runner's Xcode cannot be opened at all, so the
# generated project is kept on a format that every supported Xcode can read.
project_format=$(sed -n 's/^[[:space:]]*objectVersion = \([0-9][0-9]*\);$/\1/p' "$EXTENSION_ROOT/SafariPTTheme.xcodeproj/project.pbxproj" | head -1)
case "$project_format" in
	'' | [1-9] | [1-5][0-9] | 60) ;;
	*) fail "project.pbxproj uses project format ${project_format:-unknown}, which older Xcode cannot read. Run Scripts/normalize-project-format.sh." ;;
esac

for entitlements_file in "$APP_ENTITLEMENTS" "$EXTENSION_ENTITLEMENTS"; do
	if ! entitlement_is_true "$entitlements_file" com.apple.security.app-sandbox; then
		fail "App Sandbox is not enabled: $entitlements_file"
	fi
done

bundle_type=$(plutil -extract CFBundlePackageType raw -o - "$EXTENSION_ROOT/Extension/Info.plist")
[ "$bundle_type" = "XPC!" ] || fail "Safari extension CFBundlePackageType must be XPC!, got: $bundle_type"

extension_point=$(plutil -extract NSExtension.NSExtensionPointIdentifier raw -o - "$EXTENSION_ROOT/Extension/Info.plist")
[ "$extension_point" = "com.apple.Safari.web-extension" ] || fail "Unexpected Safari extension point: $extension_point"

if grep -q '<key>NSExtensionAttributes</key>' "$EXTENSION_ROOT/Extension/Info.plist"; then
	fail "Safari Web Extension Info.plist must not contain Safari App Extension attributes."
fi

for css_file in "$PROJECT_ROOT/theme.css" "$PROJECT_ROOT/agsv-theme.css" "$PROJECT_ROOT/safari-compat.css" "$RESOURCES_ROOT/options.css"; do
	brace_count=$(awk 'BEGIN { open_count = 0; close_count = 0 } { for (i = 1; i <= length($0); i++) { ch = substr($0, i, 1); if (ch == "{") open_count++; if (ch == "}") close_count++; } } END { print open_count, close_count }' "$css_file")
	set -- $brace_count
	[ "$1" -eq "$2" ] || fail "Unbalanced CSS braces: $css_file"
done

if grep -Eq '@import[[:space:]]+url' "$PROJECT_ROOT/theme.css"; then
	fail "theme.css still contains a remote @import"
fi

node - "$RESOURCES_ROOT" "$PROJECT_ROOT" <<'NODE'
const fs = require('fs');
const vm = require('vm');

const resourcesRoot = process.argv[2];
const projectRoot = process.argv[3];
const manifest = JSON.parse(fs.readFileSync(`${resourcesRoot}/manifest.json`, 'utf8'));
const targetContext = {};
vm.runInNewContext(fs.readFileSync(`${resourcesRoot}/target-domains.js`, 'utf8'), targetContext);
const targetDomains = targetContext.GPTUIThemeConfig?.domains || [];

const resourceFiles = [
  ...manifest.content_scripts.flatMap((script) => script.js || []),
  ...(manifest.background?.scripts || []),
  manifest.options_ui.page,
  manifest.browser_action.default_popup
];

for (const file of resourceFiles) {
  if (!fs.existsSync(`${resourcesRoot}/${file}`)) {
    throw new Error(`Manifest resource is missing: ${file}`);
  }
}

for (const file of Object.values(manifest.icons || {})) {
  if (!fs.existsSync(`${resourcesRoot}/${file}`)) {
    throw new Error(`Manifest icon is missing: ${file}`);
  }
}

for (const file of Object.values(manifest.browser_action?.default_icon || {})) {
  if (!fs.existsSync(`${resourcesRoot}/${file}`)) {
    throw new Error(`Browser action icon is missing: ${file}`);
  }
}

for (const file of manifest.web_accessible_resources || []) {
  if (!fs.existsSync(`${projectRoot}/${file}`)) {
    throw new Error(`Web accessible resource is missing: ${file}`);
  }
}

if (manifest.manifest_version !== 2) {
  throw new Error('Unexpected manifest version');
}

if (!manifest.content_scripts.some((script) => script.matches.includes('<all_urls>'))) {
  throw new Error('Runtime translation domains require an <all_urls> content-script match.');
}
NODE

printf '%s\n' 'Extension validation passed.'
