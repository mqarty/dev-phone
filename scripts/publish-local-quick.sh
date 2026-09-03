#!/bin/bash
set -e

echo "⚡ Quick Local Publish (skips changesets)"
echo ""

# Build packages
echo "📦 Building packages..."
npm run build

# Publish directly without versioning
echo "📤 Publishing to npm..."
cd packages/dev-phone-ui
npm publish --access public
cd ../plugin-dev-phone
npm publish --access public
cd ../..

echo "✅ Done! Packages published directly to npm"
echo ""
echo "To use the new UI package:"
echo "  1. Update dev-phone-tool to use the new version"
echo "  2. Rebuild/restart your container"
