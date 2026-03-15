#!/bin/bash

# OpenClaw Doc Viewer - Branch Cleanup Script
# Usage: ./scripts/cleanup-branches.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "========================================"
echo "Branch Cleanup Script"
echo "========================================"
echo ""

# Check current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${RED}Error: Must be on main branch${NC}"
    exit 1
fi

# Fetch latest
echo -e "${BLUE}Fetching latest changes...${NC}"
git fetch --all --prune

# List branches
echo ""
echo -e "${BLUE}Local branches:${NC}"
git branch

echo ""
echo -e "${BLUE}Remote branches:${NC}"
git branch -r

# Find merged branches
echo ""
echo -e "${BLUE}Branches merged into main:${NC}"
MERGED_BRANCHES=$(git branch --merged | grep -v "\*" | grep -v "main")

if [ -z "$MERGED_BRANCHES" ]; then
    echo "No merged branches found."
else
    echo "$MERGED_BRANCHES"
fi

# Find stale branches (older than 30 days)
echo ""
echo -e "${YELLOW}Stale branches (older than 30 days):${NC}"
git branch --sort=-committerdate | tail -n +10 | head -10

# Cleanup options
echo ""
echo "========================================"
echo "Cleanup Options"
echo "========================================"
echo ""
echo "1. Delete local merged branches"
echo "2. Prune remote tracking branches"
echo "3. Delete all Dependabot branches (after merge)"
echo "4. Exit"
echo ""
read -p "Select option (1-4): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}Deleting local merged branches...${NC}"
        git branch --merged | grep -v "\*" | grep -v "main" | xargs -r git branch -d
        echo -e "${GREEN}Done!${NC}"
        ;;
    2)
        echo ""
        echo -e "${BLUE}Pruning remote tracking branches...${NC}"
        git remote prune origin
        echo -e "${GREEN}Done!${NC}"
        ;;
    3)
        echo ""
        echo -e "${YELLOW}Deleting Dependabot branches...${NC}"
        read -p "Are you sure? (y/n): " confirm
        if [ "$confirm" = "y" ]; then
            # Delete local dependabot branches
            git branch | grep dependabot | xargs -r git branch -D
            # Prune remote tracking
            git remote prune origin
            echo -e "${GREEN}Done!${NC}"
        else
            echo "Cancelled."
        fi
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid option${NC}"
        exit 1
        ;;
esac

echo ""
echo "Current branches:"
git branch -a
