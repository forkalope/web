#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOY_DIR="$SCRIPT_DIR/../deployed"
REMOTE_URL="git@github.com:forkalope/deployed.git"

# Keep the deploy flow aligned with cubacadabra: publish a clean directory,
# then commit and force-push that directory as the GitHub Pages repository.
if [ -d "$SCRIPT_DIR/dist" ]; then
  PUBLISH_DIR="$SCRIPT_DIR/dist"
else
  PUBLISH_DIR="$SCRIPT_DIR"
fi

rm -rf "$DEPLOY_DIR"
mkdir "$DEPLOY_DIR"

if [ "$PUBLISH_DIR" = "$SCRIPT_DIR/dist" ]; then
  cp -R "$PUBLISH_DIR"/. "$DEPLOY_DIR/"
else
  cp "$SCRIPT_DIR/index.html" \
    "$SCRIPT_DIR/styles.css" \
    "$SCRIPT_DIR/script.js" \
    "$SCRIPT_DIR/landscape.css" \
    "$SCRIPT_DIR/developer.css" \
    "$SCRIPT_DIR/developer.js" \
    "$DEPLOY_DIR/"
  cp -R "$SCRIPT_DIR/developer" "$SCRIPT_DIR/landscape" "$SCRIPT_DIR/public" "$DEPLOY_DIR/"
fi

# CNAME lives in the source repo so a clean deploy keeps the custom domain.
if [ -f "$SCRIPT_DIR/CNAME" ]; then
  cp "$SCRIPT_DIR/CNAME" "$DEPLOY_DIR/CNAME"
fi

cd "$DEPLOY_DIR"

if [ ! -d .git ]; then
  git init
fi

if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
fi

git branch -M main
git add -A

if git diff --cached --quiet; then
  echo "No deployment changes to commit."
else
  git commit -m "deploy"
fi

git push --force origin main
