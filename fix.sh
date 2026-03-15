#!/usr/bin/env sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Making it pretty (format)..."
pnpm run format
echo "Lint --fix (cleaning up)..."
pnpm run lint:fix
echo "Done. Run ./check.sh to double-check, or npx lint-staged if you've got staged files."
