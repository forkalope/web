#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
DEPLOY_DIR="$SCRIPT_DIR/../deployed"
REMOTE_URL="git@github.com:forkalope/deployed.git"

if ! command -v rsync >/dev/null 2>&1; then
  echo "deploy.sh requires rsync" >&2
  exit 1
fi

# A future packaged build can publish dist/ without changing this deploy step.
if [ -d "$SCRIPT_DIR/dist" ]; then
  PUBLISH_DIR="$SCRIPT_DIR/dist"
else
  PUBLISH_DIR="$SCRIPT_DIR"
fi

mkdir -p "$DEPLOY_DIR"

# Keep deployment metadata in the Pages repository, but copy only website output
# from this source repository. --delete removes stale published files while the
# excluded CNAME, README, and .git directory remain intact.
rsync -a --delete \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='deploy.sh' \
  --exclude='LICENSE' \
  --exclude='README.md' \
  --exclude='CNAME' \
  --exclude='node_modules/' \
  --exclude='src/' \
  --exclude='scripts/' \
  --exclude='dist/' \
  --exclude='package.json' \
  --exclude='package-lock.json' \
  --exclude='pnpm-lock.yaml' \
  --exclude='yarn.lock' \
  "$PUBLISH_DIR/" "$DEPLOY_DIR/"

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
