#!/bin/bash

# OpenClaw Doc Viewer - Release Script
# Usage: ./scripts/release.sh [major|minor|patch]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check arguments
if [ -z "$1" ]; then
    echo "Usage: $0 [major|minor|patch]"
    echo ""
    echo "Examples:"
    echo "  $0 patch    # 1.3.1 → 1.3.2"
    echo "  $0 minor    # 1.3.1 → 1.4.0"
    echo "  $0 major    # 1.3.1 → 2.0.0"
    exit 1
fi

# Validate argument
if [[ ! "$1" =~ ^(major|minor|patch)$ ]]; then
    log_error "Invalid argument. Must be 'major', 'minor', or 'patch'"
    exit 1
fi

RELEASE_TYPE=$1

# Check if on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    log_error "Must be on main branch to release"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    log_error "Uncommitted changes detected. Please commit or stash them first."
    exit 1
fi

log_info "Starting $RELEASE_TYPE release..."

# Update version numbers
log_info "Updating version numbers..."

# Backend
cd workspace/backend
npm version $RELEASE_TYPE --no-git-tag-version
cd ../..

# Frontend
cd workspace/frontend
npm version $RELEASE_TYPE --no-git-tag-version
cd ../..

# Root package.json
npm version $RELEASE_TYPE --no-git-tag-version

# Get new version
NEW_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | tr -d '", ')

log_info "New version: $NEW_VERSION"

# Update CHANGELOG
log_info "Updating CHANGELOG..."
TODAY=$(date +%Y-%m-%d)

# Add new version section to CHANGELOG.md
sed -i '' "s/## \[Unreleased\]/## [Unreleased]\n\n## [$NEW_VERSION] - $TODAY/" CHANGELOG.md 2>/dev/null || \
sed -i "s/## \[Unreleased\]/## [Unreleased]\n\n## [$NEW_VERSION] - $TODAY/" CHANGELOG.md

# Update README badges
log_info "Updating README badges..."
sed -i '' "s/release-v[0-9.]*-blue/release-$NEW_VERSION-blue/g" README.md README.*.md 2>/dev/null || \
sed -i "s/release-v[0-9.]*-blue/release-$NEW_VERSION-blue/g" README.md README.*.md

# Commit changes
log_info "Committing changes..."
git add .
git commit -m "chore: Release v$NEW_VERSION"

# Create tag
log_info "Creating git tag..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push to remote
log_info "Pushing to remote..."
git push origin main --tags

# Create GitHub release
log_info "Creating GitHub release..."
echo ""
echo "Next steps:"
echo "1. Go to https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/new"
echo "2. Select tag: v$NEW_VERSION"
echo "3. Add release notes (see CHANGELOG.md)"
echo "4. Click 'Publish release'"
echo ""

# Publish to npm (optional)
read -p "Publish to npm? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Publishing to npm..."
    
    # Backend
    cd workspace/backend
    npm publish
    cd ../..
    
    # Frontend (if applicable)
    # cd workspace/frontend
    # npm publish
    # cd ../..
fi

log_info "Release v$NEW_VERSION completed!"
echo ""
echo "🎉 Release successful!"
echo ""
echo "Post-release checklist:"
echo "☐ Verify GitHub release"
echo "☐ Test installation from npm"
echo "☐ Update project website"
echo "☐ Announce on social media"
echo "☐ Update Discord/Slack channels"
echo ""
