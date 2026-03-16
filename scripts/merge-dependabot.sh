#!/bin/bash

# OpenClaw Doc Viewer - Merge Dependabot PRs Script
# Usage: ./scripts/merge-dependabot.sh [--all|--minor|--major|--clean]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# GitHub API - Use environment variable
GH_TOKEN="${GH_TOKEN:-}"
REPO="xiaodong-l/OpenClaw-doc-viewer"

if [ -z "$GH_TOKEN" ]; then
    echo "Error: Please set GH_TOKEN environment variable"
    echo "Example: export GH_TOKEN=your_token_here"
    exit 1
fi

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_pass() { echo -e "${GREEN}✓${NC} $1"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }

echo "========================================"
echo "Dependabot PR Merge Tool"
echo "========================================"
echo ""

# Get open PRs
log_info "Fetching open Dependabot PRs..."
PR_LIST=$(curl -s -H "Authorization: token $GH_TOKEN" \
  "https://api.github.com/repos/$REPO/pulls?state=open&per_page=100" | \
  grep -E '"number"|"title"|"head"' | \
  paste - - - | \
  grep dependabot || echo "")

if [ -z "$PR_LIST" ]; then
  log_pass "No open Dependabot PRs found!"
  exit 0
fi

echo "Found PRs. Use --help for options."
