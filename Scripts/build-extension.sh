#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
XCODE_ROOT="$PROJECT_ROOT/SafariPTTheme"
DERIVED_DATA="$PROJECT_ROOT/build/DerivedData"

cd "$XCODE_ROOT"
xcodegen generate --spec project.yml
"$SCRIPT_DIR/normalize-project-format.sh" "$XCODE_ROOT/SafariPTTheme.xcodeproj/project.pbxproj"
# Ad-hoc signing with explicit settings keeps the build working on clean CI
# machines that have no developer account or provisioning profile installed.
xcodebuild -quiet \
	-project SafariPTTheme.xcodeproj \
	-scheme SafariPTTheme \
	-configuration Debug \
	-destination 'platform=macOS,arch=arm64' \
	-derivedDataPath "$DERIVED_DATA" \
	CODE_SIGNING_ALLOWED=YES \
	CODE_SIGNING_REQUIRED=NO \
	CODE_SIGN_IDENTITY=- \
	CODE_SIGN_STYLE=Manual \
	PROVISIONING_PROFILE_SPECIFIER= \
	DEVELOPMENT_TEAM= \
	build

printf '%s\n' "macOS Safari extension build completed: $DERIVED_DATA/Build/Products/Debug"
