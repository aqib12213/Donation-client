# Client DB Migrator (SQLocal + Drizzle)

This app runs **SQLite in the browser** using **SQLocal** (SQLite WASM + OPFS). Drizzle is used for **schema definition** and **migration generation**, but Drizzle’s normal migration runner can’t read files in the browser.

So this repo uses a two-stage approach:

1. **Build-time**: compile Drizzle-generated SQL migrations into a browser-importable TypeScript module.
2. **Runtime (browser)**: apply pending migrations in a SQLocal transaction and track progress in a `__drizzle_migrations` table.

---

## Goals

- **Offline-first**: migrations run entirely in the browser.
- **Deterministic**: migrations apply in the same order Drizzle generated them.
- **Idempotent**: each migration is applied at most once (tracked in DB).
- **Multi-tab safe**: only one tab applies migrations at a time.
- **Fast startup**: migrations run inside a single SQLocal transaction.

---

## Key files

**Drizzle tooling**

- `src/db/schema.ts` — schema source of truth.
- `drizzle.config.ts` — drizzle-kit config (schema path, output directory).
- `drizzle/meta/_journal.json` — ordered migration journal.
- `drizzle/*.sql` — generated migration SQL files.

**Build-time compiler (Node)**

- `scripts/build-client-migrations.ts` — reads `drizzle/` and writes the generated client migrations module.

**Generated artifact (bundled into the app)**

- `src/db/migrations/client/index.ts` — generated. Exports `clientMigrations`.

**Runtime migrator (browser)**

- `src/db/migrate.ts` — `migrateClientDb(sqlocal, options)`.
- `src/db/index.ts` — exports `sqlocal`, `db`, and `MIGRATIONS_LOCK_NAME`.
- `src/components/context/db-provider.tsx` — runs migrations before rendering routes.
- `src/routes/__root.tsx` — wraps the app in `DbProvider`.

---

## How migrations are produced (build-time)

### 1) Generate migrations from schema

Drizzle generates migrations from `src/db/schema.ts` into `drizzle/`:

```bash
pnpm db:generate
```

This creates/updates:

- `drizzle/meta/_journal.json`
- `drizzle/meta/*_snapshot.json`
- `drizzle/<tag>.sql`

### 2) Compile migrations into a TS module

The browser cannot read local files like `drizzle/*.sql`, so we compile them into a module:

```bash
pnpm db:build-client-migrations
```

That command:

- runs `tsx scripts/build-client-migrations.ts`
- writes `src/db/migrations/client/index.ts`
- formats the generated file with Biome

#### What the generator emits

`clientMigrations` is an ordered array of objects:

- `tag`: migration tag (filename without `.sql`)
- `folderMillis`: the `when` timestamp from the journal entry
- `hash`: SHA-256 of the full migration SQL file
- `bps`: whether Drizzle recorded breakpoints (kept for parity)
- `sql`: the migration split into statements at `--> statement-breakpoint`

Example shape:

```ts
export interface ClientMigration {
  tag: string;
  folderMillis: number;
  hash: string;
  bps: boolean;
  sql: string[];
}

export const clientMigrations: ClientMigration[] = [
  {
    tag: "0000_initial",
    folderMillis: 1700000000000,
    hash: "…",
    bps: true,
    sql: ["CREATE TABLE …;", "CREATE INDEX …;"],
  },
];
```

---

## How migrations are applied (runtime in browser)

### Startup path

On startup, `DbProvider` runs migrations before routes render:

- `src/components/context/db-provider.tsx` calls:
  - `migrateClientDb(sqlocal, { lockName: MIGRATIONS_LOCK_NAME })`
- `src/routes/__root.tsx` wraps the app in `DbProvider`

If migrations fail, the provider throws and the router error boundary will render.

### Tracking table: `__drizzle_migrations`

Migrations are tracked in a local SQLite table (created automatically):

```sql
CREATE TABLE IF NOT EXISTS `__drizzle_migrations` (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  tag TEXT
);
```

Notes:

- Drizzle’s built-in migrators typically use `id`, `hash`, `created_at`.
- This repo also keeps a `tag` column for easier debugging.
- If the table exists without `tag`, the migrator will `ALTER TABLE` to add it.

### Selection logic (what gets applied)

1. Read the most recent applied migration:

```sql
SELECT hash, created_at
FROM `__drizzle_migrations`
ORDER BY created_at DESC
LIMIT 1;
```

2. Pending migrations are those where:

- `migration.folderMillis > last.created_at`

3. Apply each pending migration in order:

- execute each SQL statement in `migration.sql`
- then insert a tracking row:

```sql
INSERT INTO `__drizzle_migrations` (hash, created_at, tag)
VALUES (?, ?, ?);
```

### Safety checks

The migrator includes guardrails to prevent silent corruption:

- **Hash drift detection**: if the DB has an applied migration timestamp that exists in `clientMigrations` but its stored `hash` doesn’t match, migration throws.
  - This usually means an old migration SQL was edited after being applied.
- **Downgrade detection**: if the DB’s `created_at` is newer than the newest bundled migration, migration throws.

### Multi-tab locking

The migrator uses `navigator.locks` (when available) with a stable name:

- `MIGRATIONS_LOCK_NAME` (from `src/db/index.ts`)

This prevents two tabs from trying to migrate the same OPFS-backed database simultaneously.

---

## Developer workflow

### Typical day-to-day

- Edit schema: `src/db/schema.ts`
- Generate migrations: `pnpm db:generate`
- Compile for browser: `pnpm db:build-client-migrations`

Or do both:

```bash
pnpm db:prepare
```

---

## Troubleshooting

### Error: “Migration hash mismatch for …”

Cause: A migration SQL file was modified after it had already been applied to an existing local DB.

Fix options:

- Preferred: **don’t edit old migrations**; generate a new migration that changes the schema forward.
- If you must recover locally: clear the persisted DB storage for the site (OPFS) and reload.

### Error: “Database is newer than bundled migrations …”

Cause: You opened an older build of the app against a newer local DB.

Fix:

- Upgrade to a newer build, or clear/reset the local DB.

### I want to inspect what’s been applied

Run (in code) using the exported SQLocal instance:

```ts
import { sqlocal } from "@/db";

const rows = await sqlocal.sql("SELECT * FROM __drizzle_migrations ORDER BY created_at;");
console.log(rows);
```

---

## Production requirements (important)

### Cross-origin isolation (COI)

SQLocal uses OPFS for persistence in its worker. OPFS requires COI headers.

- In dev, `sqlocal/vite` adds:
  - `Cross-Origin-Opener-Policy: same-origin`
  - `Cross-Origin-Embedder-Policy: require-corp`
- In production, your hosting must set the same headers.

If OPFS init fails, SQLocal will fall back to an in-memory database (non-persistent), which can look like “data disappears on refresh”.

---

## FAQ

### Why not use Drizzle’s built-in migrator?

Drizzle’s migrator reads migration files from disk (Node environment). In the browser we bundle migrations as code, then apply them ourselves.

### Can we optimize migration speed?

Yes. For very large migrations, consider switching the runtime execution from per-statement `tx.sql(...)` to `execBatch(...)` style execution. The current implementation favors clarity and correctness.
