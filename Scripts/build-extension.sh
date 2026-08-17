#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
XCODE_ROOT="$PROJECT_ROOT/SafariPTTheme"
DERIVED_DATA="$PROJECT_ROOT/build/DerivedData"

cd "$XCODE_ROOT"
xcodegen generate --spec project.yml
xcodebuild -quiet \
	-project SafariPTTheme.xcodeproj \
	-scheme SafariPTTheme \
	-configuration Debug \
	-destination 'platform=macOS,arch=arm64' \
	-derivedDataPath "$DERIVED_DATA" \
	CODE_SIGNING_ALLOWED=YES \
	CODE_SIGNING_REQUIRED=NO \
	CODE_SIGN_IDENTITY=- \
	build

printf '%s\n' "macOS Safari extension build completed: $DERIVED_DATA/Build/Products/Debug"
