# OpenClaw Doc Viewer - Makefile
# https://github.com/xiaodong-l/OpenClaw-doc-viewer

.PHONY: help install dev build test lint clean docker-up docker-down release

# Default target
help:
	@echo "OpenClaw Doc Viewer - Available Commands"
	@echo "========================================="
	@echo ""
	@echo "Development:"
	@echo "  install     Install all dependencies"
	@echo "  dev         Start development servers"
	@echo "  build       Build for production"
	@echo "  test        Run all tests"
	@echo "  lint        Run linters"
	@echo "  clean       Clean build artifacts"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up   Start Docker containers"
	@echo "  docker-down Stop Docker containers"
	@echo "  docker-build Build Docker image"
	@echo "  docker-logs View container logs"
	@echo ""
	@echo "Release:"
	@echo "  release     Create a new release"
	@echo "  changelog   Generate changelog"
	@echo ""
	@echo "Documentation:"
	@echo "  docs        Build documentation"
	@echo "  docs-serve  Serve documentation locally"
	@echo ""

# ============================================
# Development
# ============================================

install:
	@echo "Installing dependencies..."
	npm install
	cd workspace/backend && npm install
	cd workspace/frontend && npm install
	@echo "Installation complete!"

dev:
	@echo "Starting development servers..."
	npm run dev

build:
	@echo "Building for production..."
	npm run build
	@echo "Build complete!"

test:
	@echo "Running tests..."
	npm test
	@echo "Tests complete!"

lint:
	@echo "Running linters..."
	npm run lint
	@echo "Linting complete!"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf workspace/backend/node_modules
	rm -rf workspace/frontend/node_modules
	rm -rf workspace/backend/dist
	rm -rf workspace/frontend/dist
	@echo "Clean complete!"

# ============================================
# Docker
# ============================================

docker-up:
	@echo "Starting Docker containers..."
	docker-compose up -d
	@echo "Containers started!"
	@echo "API: http://localhost:3000"

docker-down:
	@echo "Stopping Docker containers..."
	docker-compose down
	@echo "Containers stopped!"

docker-build:
	@echo "Building Docker image..."
	docker build -t openclaw/doc-viewer:latest .
	@echo "Image built!"

docker-logs:
	docker-compose logs -f

docker-restart:
	docker-compose restart

# ============================================
# Release
# ============================================

release:
	@echo "Creating release..."
	@echo "Current version: $$(cat package.json | grep version | head -1 | awk -F: '{ print $$2 }' | tr -d \",)"
	@echo "Run 'npm version [major|minor|patch]' to bump version"
	@echo "Then run 'git push origin main --tags'"
	@echo "Finally create GitHub release at: https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/new"

changelog:
	@echo "Generating changelog..."
	@echo "See CHANGELOG.md for full changelog"

# ============================================
# Documentation
# ============================================

docs:
	@echo "Building documentation..."
	@echo "Documentation is in docs/ directory"

docs-serve:
	@echo "Documentation serving not yet implemented"
	@echo "View docs directly in browser from docs/ directory"

# ============================================
# Utilities
# ============================================

status:
	@echo "Project Status:"
	@echo "==============="
	git status --short
	@echo ""
	@echo "Recent commits:"
	git log --oneline -5

version:
	@cat package.json | grep version | head -1 | awk -F: '{ print $$2 }' | tr -d '", '

contributors:
	@echo "Project Contributors:"
	@echo "===================="
	git shortlog -sn --all | head -20

health:
	@echo "Checking service health..."
	curl -s http://localhost:3000/health && echo " - API OK" || echo " - API DOWN"

# ============================================
# CI/CD Helpers
# ============================================

ci-install:
	npm ci
	cd workspace/backend && npm ci
	cd workspace/frontend && npm ci

ci-test:
	npm run lint
	npm test

ci-build:
	npm run build

# ============================================
# Security
# ============================================

security-audit:
	@echo "Running security audit..."
	cd workspace/backend && npm audit
	cd workspace/frontend && npm audit

security-fix:
	@echo "Fixing security vulnerabilities..."
	cd workspace/backend && npm audit fix
	cd workspace/frontend && npm audit fix
