# Quality Baseline

## Current Build Blocker

The root `package.json` uses `catalog:` and `workspace:*` dependency specifiers:

- `@workspace/api-client-react`
- several React/Vite/Tailwind catalog dependencies

Those specifiers require the missing source monorepo catalog/workspace metadata. In this isolated repository, `npm ci` fails before dependency installation with `Unsupported URL Type "catalog:"`.

## Added Gate

This PR adds a dependency-free Node test suite for the Medicare dialer compliance scoring and provisioning readiness rules. It runs without `npm install` so the repository has an executable quality gate while the missing workspace catalog is resolved.

## Next Upgrade

Replace the `catalog:` and `workspace:*` specifiers with pinned package versions or restore the original monorepo catalog files, then promote the quality workflow to run the full TypeScript build.
