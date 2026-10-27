# Zaminnegar

Farmland management and GIS application: draw agricultural parcels on a satellite map and store them as
PostGIS geometry. This is a rewrite on the stack below, laid out like the existing pnpm workspace
(`apps/*`, `packages/*`).

| Package | Stack |
|---|---|
| `@zaminnegar/api` (`apps/api`) | NestJS 11, PostgreSQL + PostGIS, TypeORM, class-validator, `@nestjs/cqrs`, `@nestjs/swagger` |
| `@zaminnegar/bff` (`apps/bff`) | Next.js (App Router), React, Tailwind CSS 4, zod, TanStack Form, TanStack Query, server actions, nuqs |
| `@zaminnegar/api-client` (`packages/api-client`) | Types generated from the API's OpenAPI document + a typed `openapi-fetch` client |

The UI is Persian, right-to-left. Geometry is always WGS 84 (EPSG:4326), GeoJSON order `[longitude, latitude]`.

## Getting started

Prerequisites: Node.js 22+, pnpm, and a PostgreSQL server **with PostGIS installed** (no Docker involved).

```bash
# 1. Database (the first migration runs CREATE EXTENSION postgis; this needs a privileged role,
#    or run `CREATE EXTENSION postgis;` yourself once as a superuser)
createdb zaminnegar

# 2. Install and configure
pnpm install
cp apps/api/.env.example apps/api/.env      # set DB_PASSWORD etc.
cp apps/bff/.env.example apps/bff/.env.local

# 3. Create the schema
pnpm --filter @zaminnegar/api migration:run

# 4. Generate the typed API client (needs no database, see "OpenAPI pipeline")
pnpm openapi:generate

# 5. Run both apps
pnpm dev            # API http://localhost:3001 (Swagger UI: /docs), BFF http://localhost:3000
```

Step 4 is required before the BFF type-checks or builds: until then `packages/api-client` contains an
empty placeholder schema. Re-run it whenever a controller or DTO changes; a breaking API change then shows
up as a compile error in the BFF.

Other scripts: `pnpm typecheck`, `pnpm build`, `pnpm format`, `pnpm --filter @zaminnegar/api migration:revert|migration:show`.

## OpenAPI pipeline

`apps/api/nest-cli.json` defines two Nest projects: `api` (the server) and `openapi` (entry point
`src/openapi/generate-openapi.ts`). `pnpm openapi:generate` runs `nest start openapi`, which:

1. builds the app in **preview mode** (routes and DTO metadata are registered, providers are not
   instantiated, so there is no database connection);
2. writes `packages/api-client/openapi.json`;
3. runs `pnpm --filter @zaminnegar/api-client generate` (`openapi-typescript`) to produce
   `src/generated/schema.d.ts`.

Every DTO, query, path parameter and response (including the shared `ErrorResponseDto`) is declared
explicitly with `@nestjs/swagger` decorators, with descriptions and examples, so the generated types are complete.

## API (`apps/api`)

Routes are versioned and resource-oriented (`/api/v1/...`); Swagger UI is at `/docs`.

| Method | Path | Purpose |
|---|---|---|
| POST / GET | `/projects` | Create / list (paginated, with parcel count and extent) |
| GET | `/projects/{projectId}` | Get one project |
| POST / GET / DELETE | `/projects/{projectId}/parcels` | Create / list / delete all parcels |
| GET / PATCH / DELETE | `/projects/{projectId}/parcels/{parcelId}` | Read / partially update / delete |
| GET | `/projects/{projectId}/exports/geojson` | RFC 7946 FeatureCollection |

Layout: `src/config` (validated env), `src/common` (shared errors, DTOs, filter, geometry, database helpers),
`src/database` (connection, CLI data source, migrations), `src/modules/{projects,parcels}`.
Each module contains `interfaces/`, `entities/`, `repositories/`, `dto/`, `errors/`, `commands/`, `queries/`,
its controller(s) and its own `TypeOrmModule.forFeature([...])`.

Conventions worth knowing:

- **Interfaces first.** `IProject` / `IParcel` describe the domain (including optional relations);
  entities `implements` them, so nothing relies on `Omit<Entity, 'relation'>`.
- **CQRS.** Controllers only dispatch commands/queries; handlers hold the logic. Modules talk to each other
  through the bus (the parcels module asks `GetProjectQuery` whether the project exists).
- **Repositories** extend `BaseRepository` and every public method takes an optional `manager?: EntityManager`
  so it can join a transaction (`TransactionService.run`).
- **Explicit database names.** Every column, constraint and index is named in the entity and the migration.
  `handleDatabaseError` maps constraint names (`uq_projects_name`, `uq_parcels_project_id_name`,
  `fk_parcels_project_id`, `chk_parcels_geom_valid`) to domain errors, never by parsing messages.
- **Errors.** `AppError` is abstract; each concrete error (`ProjectNotFoundError`, `InvalidGeometryError`, …)
  and each DTO lives in its own file. One global filter returns a uniform `ErrorResponseDto`.
- **Geometry.** Stored as `geometry(MultiPolygon, 4326)`. Shape and ranges are checked by class-validator,
  topology by PostGIS (`ST_IsValid` pre-check plus a CHECK constraint). `area_m2` is a generated column,
  `ST_Area(geom::geography)` (geodesic), so it can never go stale.

### Indexes

| Index | Why |
|---|---|
| `idx_parcels_geom_gist` (GiST on `geom`) | spatial predicates and `ST_Extent` |
| `idx_parcels_project_id_created_at (project_id, created_at, id)` | project parcel list in order without a sort; cascading deletes |
| `uq_parcels_project_id_name (project_id, name)` | unique names per project (its `project_id` prefix also serves lookups) |
| `uq_projects_name` | unique project names |
| `idx_projects_updated_at (updated_at DESC, id)` | "most recently changed first" project list |

A trigger bumps `projects.updated_at` whenever one of its parcels changes.

## BFF (`apps/bff`)

The browser never talks to the API directly: UI → **server actions** → typed API client → API.
Actions return `ActionResult<T>` (expected failures are data, not exceptions).

- `src/config/env.ts` — the only place environment variables are read: `loadEnvConfig` from `@next/env`
  validated with zod. Imagery settings reach client components as props from `getMapConfig()`.
- `src/features/<feature>/{actions,hooks,components,schemas,lib}` — projects, parcels, map, workspace, search.
- **State**: server state in TanStack Query; UI state in Context (`WorkspaceProvider`, `DrawingProvider`);
  shareable UI state (`?parcel=&mode=&basemap=&q=`) in the URL via nuqs.
- **Forms**: one `useAppForm` (TanStack Form composition) with pre-bound `TextField`, `SliderField`, … and zod schemas.
- **UI**: Radix primitives, `class-variance-authority`, `sonner`, `lucide-react`; map via `react-map-gl` (MapLibre);
  self-intersection check via Turf (`@turf/kinks`).
- Parcel properties autosave (700 ms debounce) with instant on-map preview; vertex edits save on release and
  snap back if invalid.

### Imagery

`MAP_IMAGERY_PROVIDER=esri` (default, no key) | `mapbox` | `maptiler`. Esri shows "Map data not yet available"
tiles where it has no high-resolution imagery; lower `maxzoom` in `features/map/config/map-config.ts`, or use
another provider. Keys for Mapbox/MapTiler end up in tile URLs, so use public, domain-restricted keys.

## Decisions to review

- **`@next/config`** is not a published package. I used **`@next/env`** (Next's own env loader) plus zod,
  so no code reads `process.env` directly. If you meant something else (e.g. `@t3-oss/env-nextjs`), only
  `src/config/env.ts` changes.
- Place search (Nominatim) lives in the BFF as a server action rather than in the API.
- Library versions are caret ranges chosen without registry access; run `pnpm up -L -r` to move to the newest.
- Not implemented: authentication (the API is open), tests (as requested).

## Verification status

This was written in a sandbox without network access, so dependencies were never installed and nothing was run.
What was done: both apps were type-checked against their own sources with dependency declarations absent
(no errors other than "module not found" cascades), and the earlier geometry logic was executed.
**Not run**: `pnpm install`, migrations on a real PostGIS database, `nest start openapi`, the BFF build, the app in a browser.
The least certain points are the `nest-cli.json` multi-project setup (output path of the `openapi` project) and
preview-mode generation; if `nest start openapi` cannot locate its entry file, check `dist/` and adjust `entryFile`.
