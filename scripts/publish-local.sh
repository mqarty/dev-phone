#!/bin/bash
set -e

echo "🚀 Local Publishing Script for dev-phone packages"
echo ""

# Check if NPM token is set
if [[ -z "${NPM_TOKEN}" ]]; then
    echo "⚠️  NPM_TOKEN not set. Set it with: export NPM_TOKEN=your-token"
    echo "Continuing anyway - you may be prompted for credentials"
fi

# Build packages
echo "📦 Building packages..."
npm run build

# Create/version changesets
echo "📝 Processing changesets..."
npx changeset version

# Publish to npm
echo "🎉 Publishing to npm..."
npx changeset publish

echo "✅ Done! Packages published to npm"
echo ""
echo "Next steps:"
echo "1. Update your local container: docker pull your-registry/dev-phone-ui:latest"
echo "2. Or rebuild container with: docker build -t dev-phone-ui ."
