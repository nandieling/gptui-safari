#!/bin/sh

# Lists the files that must not live in the repository: build output, editor and
# Xcode user state, and macOS metadata.  Fails when any of them is still tracked,
# so a stray file cannot slip back in through a commit.

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)

cd "$PROJECT_ROOT"

if [ ! -d .git ]; then
	printf '%s\n' 'Hygiene check skipped: not a git working copy.' >&2
	exit 0
fi

tracked=$(git ls-files)
offenders=$(printf '%s\n' "$tracked" | grep -E '(^|/)\.DS_Store$|(^|/)xcuserdata/|\.xcuserstate$|^build/|^BrowserPTTheme/dist/' || true)
ignored_tracked=$(git ls-files -i -c --exclude-standard || true)

if [ -n "$offenders" ] || [ -n "$ignored_tracked" ]; then
	list=$(printf '%s\n' "$offenders" "$ignored_tracked" | sed '/^$/d' | sort -u)
	printf '%s\n' 'These tracked files should not be in the repository:' >&2
	printf '%s\n' "$list" | sed 's/^/  /' >&2
	printf '\n%s\n' 'Untrack them (the files stay on disk):' >&2
	printf '%s\n' "$list" | tr '\n' ' ' | sed 's/^/  git rm --cached -- /; s/$/\n/' >&2
	exit 1
fi

printf '%s\n' 'Repository hygiene check passed.'
