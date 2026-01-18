# Vokh Registry

`vokh-registry` implements a read-only interface over your local filesystem. By bypassing the network layer, it maps disk-resident npm packages and monorepo structures directly to the dependency graph. Zero latency. Pure local I/O.

## Configuration Schema (vokh.config.yaml)

The registry operates on a strict declaration of intent defined in vokh.config.yaml. This file maps package queries (Input) to filesystem coordinates (Output).

Pattern Matching: Both name and path support Glob patterns, allowing for dynamic resolution vectors across complex monorepo structures.

```yaml
# vokh.config.yaml
# registry listen port
port: 5000
rules:
  # Maps a specific scope to a local directory
  - name: '@my-org/*'
    path: './packages/*'

  # Direct mapping for a standalone core package
  - name: 'vokh-core'
    path: './libs/core'
```

## Artifact Generation Protocol

`vokh-registry` operates on immutable snapshots, not volatile source code. To expose a package, you must serialize the current directory state into a .tgz binary. This ensures the registry serves exactly what would be deployed to production.

### 1. Standard Architecture

Execute the `pack` command at the root of the package. This compiles the manifest and files into a tarball.

```bash
# Generates: my-package-1.0.0.tgz
pnpm pack
```

### 2. Monorepo Architecture

For distributed systems, leverage the recursive execution flag (-r) or filter specific scopes to generate artifacts across multiple workspaces simultaneously.

```bash
# Option A: Pack a specific workspace
pnpm --filter "@my-org/*" pack

# Option B: Batch serialization (all packages)
pnpm -r exec pnpm pack
```

## Version Control Hygiene (.gitignore)

Warning: Generated artifacts (.tgz) are ephemeral build outputs. Committing them to the repository creates bloat and violates the "Source of Truth" principle.

Add the following rule to your exclusion list to prevent binary pollution:

```gitignore
# .gitignore
# vokh-registry artifacts
*.tgz
```

## Service Initialization & Client Binding

Server Instantiation Execute the serve command to boot the resolution engine. The system indexes the artifacts defined in your rules and opens the HTTP interface for incoming requests.

**Port Assignment**: The service binds to port 9999 by default. To realign the ingress point, specify the port property in your vokh.config.yaml.

```bash
vokh-registry serve
```

## Hybrid Topology Configuration (Scoped Resolution)

**Architectural Constraint:** Since `vokh-registry` is a specialized local resolver and not a full upstream proxy, you must not sever the connection to the Public Registry.

Instead, implement a Split-Horizon Strategy via .npmrc. This configures the client to resolve the global namespace against the Public Registry (Primary Uplink) while routing specific artifact scopes to the Local Vökh Instance.

**Configuration Vector (.npmrc):** Map your organization's scope (e.g., @myOrg) to the local port.

```yaml
# 1. Global Namespace (Public Uplink) -> Default
# "Check the public ecosystem first for standard packages"
registry=https://registry.npmjs.org/

# 2. Local Namespace (Vökh Override) -> Specific Vector
# "Route only specific scopes to the local filesystem"
@myOrg:registry=http://localhost:9999/
```

### Topology Result:

Request react -> Public Registry (Hit).

Request @myOrg/package -> Vökh Local (Hit).

This ensures high availability for external dependencies while injecting your local builds with zero latency.
