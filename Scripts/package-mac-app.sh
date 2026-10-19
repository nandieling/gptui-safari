#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
XCODE_ROOT="$PROJECT_ROOT/SafariPTTheme"
DERIVED_DATA="$PROJECT_ROOT/build/ReleaseDerivedData"
PACKAGE_ROOT="$PROJECT_ROOT/build/Packages"
VERSION=$(sed -n 's/^[[:space:]]*MARKETING_VERSION:[[:space:]]*"\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' "$XCODE_ROOT/project.yml" | head -1)
if [ -z "$VERSION" ]; then
	printf '%s\n' 'Packaging failed: MARKETING_VERSION is missing from SafariPTTheme/project.yml' >&2
	exit 1
fi
APP_NAME="gpt-ui"
APP_PATH="$DERIVED_DATA/Build/Products/Release/$APP_NAME.app"
ZIP_PATH="$PACKAGE_ROOT/${APP_NAME}-${VERSION}-macOS-arm64.zip"
DMG_PATH="$PACKAGE_ROOT/${APP_NAME}-${VERSION}-macOS-arm64.dmg"

mkdir -p "$PACKAGE_ROOT"

"$SCRIPT_DIR/validate-extension.sh"

cd "$XCODE_ROOT"
xcodegen generate --spec project.yml
"$SCRIPT_DIR/normalize-project-format.sh" "$XCODE_ROOT/SafariPTTheme.xcodeproj/project.pbxproj"
# Ad-hoc signing with explicit settings keeps the build working on clean CI
# machines that have no developer account or provisioning profile installed.
xcodebuild -quiet \
	-project SafariPTTheme.xcodeproj \
	-scheme SafariPTTheme \
	-configuration Release \
	-destination 'platform=macOS,arch=arm64' \
	-derivedDataPath "$DERIVED_DATA" \
	CODE_SIGNING_ALLOWED=YES \
	CODE_SIGNING_REQUIRED=NO \
	CODE_SIGN_IDENTITY=- \
	CODE_SIGN_STYLE=Manual \
	PROVISIONING_PROFILE_SPECIFIER= \
	DEVELOPMENT_TEAM= \
	build

[ -d "$APP_PATH" ] || {
	printf '%s\n' "Packaging failed: missing $APP_PATH" >&2
	exit 1
}

rm -f "$ZIP_PATH" "$DMG_PATH"
ditto -c -k --sequesterRsrc --keepParent "$APP_PATH" "$ZIP_PATH"

DMG_STAGING=$(mktemp -d "$PROJECT_ROOT/build/gpt-ui-dmg.XXXXXX")
cleanup() {
	rm -rf "$DMG_STAGING"
}
trap cleanup EXIT INT TERM

ditto "$APP_PATH" "$DMG_STAGING/$APP_NAME.app"
ln -s /Applications "$DMG_STAGING/Applications"
hdiutil create \
	-volname "$APP_NAME" \
	-srcfolder "$DMG_STAGING" \
	-ov \
	-format UDZO \
	"$DMG_PATH" >/dev/null

printf '%s\n' "macOS app: $APP_PATH"
printf '%s\n' "ZIP package: $ZIP_PATH"
printf '%s\n' "DMG package: $DMG_PATH"
