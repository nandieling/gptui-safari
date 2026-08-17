#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
XCODE_ROOT="$PROJECT_ROOT/SafariPTTheme"
DERIVED_DATA="$PROJECT_ROOT/build/ReleaseDerivedData"
PACKAGE_ROOT="$PROJECT_ROOT/build/Packages"
VERSION="0.1.0"
APP_NAME="gpt-ui"
APP_PATH="$DERIVED_DATA/Build/Products/Release/$APP_NAME.app"
ZIP_PATH="$PACKAGE_ROOT/${APP_NAME}-${VERSION}-macOS-arm64.zip"
DMG_PATH="$PACKAGE_ROOT/${APP_NAME}-${VERSION}-macOS-arm64.dmg"

mkdir -p "$PACKAGE_ROOT"

"$SCRIPT_DIR/validate-extension.sh"

cd "$XCODE_ROOT"
xcodegen generate --spec project.yml
xcodebuild -quiet \
	-project SafariPTTheme.xcodeproj \
	-scheme SafariPTTheme \
	-configuration Release \
	-destination 'platform=macOS,arch=arm64' \
	-derivedDataPath "$DERIVED_DATA" \
	CODE_SIGNING_ALLOWED=YES \
	CODE_SIGNING_REQUIRED=NO \
	CODE_SIGN_IDENTITY=- \
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
