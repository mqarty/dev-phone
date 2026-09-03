# Local Publishing Scripts

## Quick Publish (Recommended for Development)

Skip the CI pipeline and publish directly to npm:

```bash
./scripts/publish-local-quick.sh
```

This script:
- Builds all packages
- Publishes directly to npm without versioning
- Takes ~2 minutes total

**Use this when:**
- Testing UI changes quickly
- You want to skip CI/CD entirely
- You're managing versions manually

## Standard Publish

Use the changeset workflow locally:

```bash
./scripts/publish-local.sh
```

This script:
- Builds packages
- Processes changesets (versions packages)
- Publishes to npm
- Takes ~5 minutes total

**Use this when:**
- You want proper version management
- You want changelog updates

## Manual Steps

If you prefer to run commands individually:

```bash
# 1. Build
npm run build

# 2. Publish (quick way - no versioning)
cd packages/dev-phone-ui && npm publish --access public && cd ../..

# 3. Or use changesets (standard way)
npx changeset add
npx changeset version
npx changeset publish
```

## Container Updates

After publishing UI changes to npm:

```bash
# If using dev-phone-tool container
docker pull your-registry/dev-phone-ui:latest
docker-compose up -d

# Or rebuild
docker build -t dev-phone-ui:latest packages/dev-phone-ui/.
```

## Requirements

- `NPM_TOKEN` environment variable set (or npm credentials configured)
- Local npm version 8+
- Node.js 24+
