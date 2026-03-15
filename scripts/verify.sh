#!/bin/bash

# OpenClaw Doc Viewer - Verification Script
# Usage: ./scripts/verify.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASS=0
FAIL=0
WARN=0

# Functions
log_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

log_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo "========================================"
echo "OpenClaw Doc Viewer - Project Verification"
echo "========================================"
echo ""

# Check Node.js version
log_info "Checking Node.js version..."
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    log_pass "Node.js version: $(node --version)"
else
    log_fail "Node.js version must be 18+ (current: $(node --version))"
fi

# Check npm version
log_info "Checking npm version..."
NPM_VERSION=$(npm --version)
log_pass "npm version: $NPM_VERSION"

# Check required files
log_info "Checking required files..."

REQUIRED_FILES=(
    "README.md"
    "LICENSE"
    "CONTRIBUTING.md"
    "CODE_OF_CONDUCT.md"
    "CHANGELOG.md"
    "package.json"
    "Dockerfile"
    "docker-compose.yml"
    ".github/ISSUE_TEMPLATE/bug_report.md"
    ".github/ISSUE_TEMPLATE/feature_request.md"
    ".github/PULL_REQUEST_TEMPLATE.md"
    ".github/SECURITY.md"
    ".github/SUPPORT.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_pass "Found: $file"
    else
        log_fail "Missing: $file"
    fi
done

# Check documentation
log_info "Checking documentation..."

DOCS_FILES=(
    "docs/INSTALL.md"
    "docs/DEPLOYMENT.md"
    "docs/QUICKSTART.md"
    "docs/API.md"
    "docs/CONFIGURATION.md"
    "docs/ARCHITECTURE.md"
    "docs/FAQ.md"
    "docs/TROUBLESHOOTING.md"
)

for file in "${DOCS_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_pass "Found: $file"
    else
        log_warn "Missing: $file"
    fi
done

# Check GitHub workflows
log_info "Checking GitHub workflows..."

WORKFLOWS=(
    ".github/workflows/ci.yml"
    ".github/workflows/labeler.yml"
    ".github/workflows/stale.yml"
)

for file in "${WORKFLOWS[@]}"; do
    if [ -f "$file" ]; then
        log_pass "Found: $file"
    else
        log_warn "Missing: $file"
    fi
done

# Check backend
log_info "Checking backend..."
if [ -f "workspace/backend/package.json" ]; then
    log_pass "Backend package.json exists"
    
    cd workspace/backend
    if npm ls --depth=0 > /dev/null 2>&1; then
        log_pass "Backend dependencies installed"
    else
        log_warn "Backend dependencies may need installation"
    fi
    cd ../..
else
    log_fail "Backend package.json missing"
fi

# Check frontend
log_info "Checking frontend..."
if [ -f "workspace/frontend/package.json" ]; then
    log_pass "Frontend package.json exists"
    
    cd workspace/frontend
    if npm ls --depth=0 > /dev/null 2>&1; then
        log_pass "Frontend dependencies installed"
    else
        log_warn "Frontend dependencies may need installation"
    fi
    cd ../..
else
    log_fail "Frontend package.json missing"
fi

# Check security
log_info "Checking security..."

if grep -q "JWT_SECRET" workspace/backend/.env.example 2>/dev/null; then
    log_pass "JWT_SECRET placeholder exists"
else
    log_warn "JWT_SECRET placeholder missing"
fi

if [ -f ".github/SECURITY.md" ]; then
    log_pass "Security policy exists"
else
    log_fail "Security policy missing"
fi

# Check git
log_info "Checking git..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    log_pass "Git repository initialized"
    
    BRANCH=$(git rev-parse --abbrev-ref HEAD)
    log_info "Current branch: $BRANCH"
    
    if [ -n "$(git status --porcelain)" ]; then
        log_warn "Uncommitted changes detected"
    else
        log_pass "Working tree clean"
    fi
else
    log_fail "Not a git repository"
fi

# Summary
echo ""
echo "========================================"
echo "Verification Summary"
echo "========================================"
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${YELLOW}Warnings:${NC} $WARN"
echo -e "${RED}Failed:${NC} $FAIL"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ Project verification passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Project verification failed!${NC}"
    echo ""
    echo "Please address the failed checks above."
    exit 1
fi
