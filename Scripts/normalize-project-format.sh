#!/bin/sh

# XcodeGen 2.4x always writes project format 77, which only the newest Xcode can
# read.  Lower the format so the generated project also opens and builds on older
# Xcode versions, including the one on the CI runner.  The generated project only
# uses classic build phases and file references, so format 54 is enough.

set -eu

pbxproj=${1:?'usage: normalize-project-format.sh path/to/project.pbxproj'}

if [ ! -f "$pbxproj" ]; then
	printf '%s\n' "Missing project file: $pbxproj" >&2
	exit 1
fi

sed -i '' 's/objectVersion = [0-9][0-9]*;/objectVersion = 54;/' "$pbxproj"
sed -i '' '/preferredProjectObjectVersion = [0-9][0-9]*;/d' "$pbxproj"
sed -i '' '/minimizedProjectReferenceProxies = 1;/d' "$pbxproj"

if ! grep -q 'objectVersion = 54;' "$pbxproj"; then
	printf '%s\n' "Could not lower the project format: $pbxproj" >&2
	exit 1
fi
