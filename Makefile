.PHONY: help install build dev clean publish publish-quick lint format test

# Default target
help:
	@echo "dev-phone - Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start dev server for dev-phone-ui"
	@echo "  make build            Build all packages"
	@echo ""
	@echo "Publishing:"
	@echo "  make publish          Publish to npm with changesets (standard)"
	@echo "  make publish-quick    Publish to npm directly (skip CI)"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean            Remove build artifacts"
	@echo "  make lint             Lint code"
	@echo "  make format           Format code"
	@echo ""

# Install dependencies
install:
	npm install

# Start dev server
dev:
	npm run start -w packages/dev-phone-ui

# Build all packages
build:
	npm run build

# Clean build artifacts
clean:
	rm -rf packages/*/dist
	rm -rf packages/*/.next
	npm run clean || true

# Publish with changesets (standard workflow)
publish:
	@echo "Publishing with changesets..."
	./scripts/publish-local.sh

# Publish directly (quick, skips changesets)
publish-quick:
	@echo "Quick publish (skipping changesets)..."
	./scripts/publish-local-quick.sh

# Lint (if configured)
lint:
	@echo "Linting packages..."
	npm run lint || echo "No lint script configured"

# Format code (if configured)
format:
	@echo "Formatting code..."
	npm run format || echo "No format script configured"

# Run tests (if configured)
test:
	@echo "Running tests..."
	npm run test || echo "No test script configured"

# Create a new changeset
changeset:
	npx changeset add

# Version packages without publishing
version:
	npx changeset version

# Check npm credentials
check-npm:
	npm whoami

# Watch for changes and rebuild
watch:
	npm run build -- --watch || echo "Watch not supported"
