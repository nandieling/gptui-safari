#!/bin/sh

# Assembles loadable Chrome and Firefox packages from the sources this project
# already ships.  The content script, the options panel and every stylesheet are
# shared with the Safari web extension, so a theme fix lands in one place and
# reaches all three browsers; only the manifests differ per browser.

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
SHARED_ROOT="$PROJECT_ROOT/SafariPTTheme/Extension/Resources"
STYLE_ROOT="$PROJECT_ROOT"
DIST_ROOT="$SCRIPT_DIR/dist"

RUNTIME_FILES="domain-utils.js target-domains.js themes.js content.js options.js options.html options.css"
STYLE_FILES="theme.css agsv-theme.css safari-compat.css site-colors.css"
ICON_FILES="icon-16.png icon-32.png icon-48.png icon-128.png"
PLATFORM_TOKEN='macOS Safari extension'

fail() {
	printf '%s\n' "Build failed: $*" >&2
	exit 1
}

platform_label() {
	case "$1" in
	chrome) printf '%s\n' 'Chrome / Edge 扩展' ;;
	firefox) printf '%s\n' 'Firefox 附加组件' ;;
	*) fail "Unknown target: $1" ;;
	esac
}

archive_extension() {
	case "$1" in
	chrome) printf '%s\n' 'zip' ;;
	firefox) printf '%s\n' 'xpi' ;;
	esac
}

manifest_version() {
	node -e 'process.stdout.write(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).version)' "$1"
}

require_file() {
	[ -f "$1" ] || fail "Missing file: $1"
}

targets=
write_archive=1
for argument in "$@"; do
	case "$argument" in
	chrome | firefox) targets="$targets $argument" ;;
	all) targets='chrome firefox' ;;
	--no-archive) write_archive=0 ;;
	*) printf '%s\n' "Usage: $0 [chrome|firefox|all] [--no-archive]" >&2
		exit 2 ;;
	esac
done
[ -n "$targets" ] || targets='chrome firefox'

for file in $RUNTIME_FILES $ICON_FILES; do
	require_file "$SHARED_ROOT/$file"
done
for file in $STYLE_FILES; do
	require_file "$STYLE_ROOT/$file"
done
require_file "$SCRIPT_DIR/shared/background.js"

for target in $targets; do
	require_file "$SCRIPT_DIR/$target/manifest.json"
done

for target in $targets; do
	out="$DIST_ROOT/$target"
	label=$(platform_label "$target")
	rm -rf "$out"
	mkdir -p "$out"
	cp "$SCRIPT_DIR/$target/manifest.json" "$out/manifest.json"
	cp "$SCRIPT_DIR/shared/background.js" "$out/background.js"
	for file in $RUNTIME_FILES $ICON_FILES; do
		cp "$SHARED_ROOT/$file" "$out/$file"
	done
	for file in $STYLE_FILES; do
		cp "$STYLE_ROOT/$file" "$out/$file"
	done

	if ! grep -q "$PLATFORM_TOKEN" "$out/options.html"; then
		fail "options.html no longer carries the \"$PLATFORM_TOKEN\" label"
	fi
	sed -e "s|>$PLATFORM_TOKEN<|>$label<|" "$out/options.html" > "$out/options.html.tmp"
	mv "$out/options.html.tmp" "$out/options.html"

	printf 'Assembled %s -> %s\n' "$target" "$out"
done

if [ "$write_archive" -eq 1 ]; then
	for target in $targets; do
		version=$(manifest_version "$SCRIPT_DIR/$target/manifest.json")
		name="gpt-ui-$target-$version.$(archive_extension "$target")"
		rm -f "$DIST_ROOT/$name"
		(
			cd "$DIST_ROOT/$target"
			zip -qrX "$DIST_ROOT/$name" .
		)
		printf 'Archived %s (%s bytes)\n' "$DIST_ROOT/$name" "$(wc -c < "$DIST_ROOT/$name" | tr -d ' ')"
	done
fi
