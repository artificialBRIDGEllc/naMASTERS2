# Medicare Training Simulator

Reorganized project layout:

- `server/` for Python backend
- `client/` for frontend assets and app files

## Quality Gate

```bash
node --test tests/*.test.mjs
```

The dependency-free quality gate validates Medicare dialer compliance scoring and provisioning readiness. The full npm install is currently blocked by missing monorepo `catalog:` / `workspace:*` metadata; see `QUALITY_BASELINE.md`.
