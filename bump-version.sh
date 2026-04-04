#!/usr/bin/env bash
set -euo pipefail

# Incremental versioning for Health Tracker (PWA)
# - Bumps SemVer based on Conventional Commits or a forced part
# - Updates version.json consumed by index.html
# - Touches sw.js so clients see a new service worker
# - Tags the repo (vX.Y.Z) and prints new_version for GitHub Actions output
#
# Usage:
#   ./bump-version.sh auto         # infer bump (default)
#   ./bump-version.sh patch|minor|major
#   PREFIX="" ./bump-version.sh    # remove 'v' prefix for tags
#
# Notes:
# - index.html fetches ./version.json with no-store and shows App/Build.  # (kept in sync here)
# - We don't rewrite internal SW cache keys; we change sw.js content so browsers update the SW. 
#   (Per MDN, a changed SW script triggers an update/install/activate cycle.)

PREFIX="${PREFIX:-v}"
PART="${1:-auto}"
NOW_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

has_cmd() { command -v "$1" >/dev/null 2>&1; }

git fetch --tags --force >/dev/null 2>&1 || true

# ---------- read version.json safely ----------
read_json_field() {
  local field="$1"
  if [[ -f version.json ]]; then
    if has_cmd jq; then
      jq -r --arg f "$field" '.[$f] // empty' version.json
    else
      # very small and robust fallback for flat JSON keys
      grep -Eo "\"$field\"\\s*:\\s*\"[^\"]*\"" version.json | sed -E "s/.*\"$field\"\\s*:\\s*\"([^\"]*)\".*/\\1/"
    fi
  fi
}

cur_version="$(read_json_field version || true)"
cur_build="$(read_json_field build || true)"

# Defaults if version.json doesn't exist yet
if [[ -z "${cur_version:-}" ]]; then cur_version="1.0.0"; fi
if [[ -z "${cur_build:-}" ]]; then cur_build="0"; fi

# ---------- semver helpers ----------
inc_semver() {
  local ver="$1" part="$2"
  local major minor patch
  IFS='.' read -r major minor patch <<<"$ver"
  major=${major:-0}; minor=${minor:-0}; patch=${patch:-0}
  case "$part" in
    major) major=$((major+1)); minor=0; patch=0 ;;
    minor) minor=$((minor+1)); patch=0 ;;
    patch) patch=$((patch+1)) ;;
    *) echo "Unknown bump part: $part" >&2; exit 2 ;;
  esac
  echo "${major}.${minor}.${patch}"
}

latest_tag=""
if latest_tag="$(git describe --tags --abbrev=0 2>/dev/null)"; then :; else latest_tag=""; fi

detect_bump() {
  local range
  if [[ -n "$latest_tag" ]]; then range="${latest_tag}..HEAD"; else
    # from repo root commit if no tags exist
    range="$(git rev-list --max-parents=0 HEAD | tail -n1)..HEAD"
  fi
  # major if BREAKING CHANGE or "type!:"
  if git log --format=%B "$range" | grep -Eiq 'BREAKING CHANGE|^.+!:'; then echo major; return; fi
  # minor if feat:
  if git log --format=%B "$range" | grep -Eiq '^feat(\(.+\))?:'; then echo minor; return; fi
  # else patch
  echo patch
}

bump_part="$PART"
if [[ "$PART" == "auto" ]]; then bump_part="$(detect_bump)"; fi

new_version="$(inc_semver "$cur_version" "$bump_part")"
new_build=$(( ${cur_build:-0} + 1 ))
short_sha="$(git rev-parse --short=7 HEAD)"

echo "Current version.json: version=$cur_version build=$cur_build"
echo "Bump part:           $bump_part"
echo "New version:         $new_version"
echo "New build:           $new_build"
echo "Commit:              $short_sha"
echo "Timestamp:           $NOW_UTC"

# ---------- write version.json ----------
cat > version.json <<JSON
{
  "version": "$new_version",
  "build": "$new_build",
  "commit": "$short_sha",
  "timestamp": "$NOW_UTC"
}
JSON

git add version.json

# ---------- prod-safe SW bump (without guessing variable names) ----------
if [[ -f sw.js ]]; then
  # Remove previous marker and prepend a new one with the version/build
  tmp_sw="$(mktemp)"
  {
    echo "// build-marker: v${new_version}+${new_build} (${NOW_UTC})"
    # Strip any earlier build-marker line to avoid growth
    sed '/^\/\/ build-marker:/d' sw.js
  } > "$tmp_sw"
  mv "$tmp_sw" sw.js
  git add sw.js
fi

# ---------- commit (skip CI loops) ----------
git -c user.name="github-actions[bot]" -c user.email="41898282+github-actions[bot]@users.noreply.github.com" \
  commit -m "chore(release): v${new_version} [skip ci]" || true

# Push commit before tagging so the tag points at the bump
git push origin HEAD || true

# ---------- tag & simple release notes ----------
tag="${PREFIX}${new_version}"
git tag -a "$tag" -m "chore(release): ${tag}"
git push origin "$tag"

# Create basic release notes file for Actions step (optional)
{
  echo "## Changes since ${latest_tag:-initial}"
  echo
  if [[ -n "$latest_tag" ]]; then
    git log --pretty=format:'- %s (%h)' "${latest_tag}..HEAD~0"
  else
    git log --pretty=format:'- %s (%h)'
  fi
  echo
  echo "**Build**: ${new_build} • **Commit**: ${short_sha} • **Time (UTC)**: ${NOW_UTC}"
} > .release-notes.md

# Output for GitHub Actions
if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
  echo "new_version=${new_version}" >> "$GITHUB_OUTPUT"
  echo "new_build=${new_build}"     >> "$GITHUB_OUTPUT"
  echo "tag=${tag}"                 >> "$GITHUB_OUTPUT"
fi

echo "Done → ${tag}"
