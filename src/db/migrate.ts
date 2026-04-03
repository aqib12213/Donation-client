import type { SQLocalDrizzle } from "sqlocal/drizzle";
import { type ClientMigration, clientMigrations } from "./migrations/client";

const DEFAULT_MIGRATIONS_TABLE = "__drizzle_migrations";

export interface AppliedMigration {
	folderMillis: number;
	hash: string;
	tag: string;
}

export interface MigrateClientDbResult {
	applied: AppliedMigration[];
}

export interface MigrateClientDbOptions {
	lockName?: string;
	migrations?: readonly ClientMigration[];
	migrationsTable?: string;
}

interface SqlocalTx {
	sql: (
		queryTemplate: TemplateStringsArray | string,
		...params: unknown[]
	) => Promise<Record<string, unknown>[]>;
}

function quoteIdentifier(name: string): string {
	return `\`${name.replaceAll("`", "``")}\``;
}

function toFiniteNumber(value: unknown): number | null {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "bigint") {
		const asNumber = Number(value);
		return Number.isFinite(asNumber) ? asNumber : null;
	}

	if (typeof value === "string") {
		const asNumber = Number(value);
		return Number.isFinite(asNumber) ? asNumber : null;
	}

	return null;
}

function toNonEmptyString(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function withExclusiveLock<T>(
	lockName: string | undefined,
	run: () => Promise<T>
): Promise<T> {
	if (!lockName) {
		return run();
	}

	if ("locks" in navigator && navigator.locks) {
		return navigator.locks.request(lockName, { mode: "exclusive" }, run);
	}

	return run();
}

async function ensureMigrationsTable(
	tx: SqlocalTx,
	tableIdent: string
): Promise<void> {
	await tx.sql(
		`CREATE TABLE IF NOT EXISTS ${tableIdent} (
			id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
			hash TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			tag TEXT
		);`
	);

	const tableInfo = await tx.sql(`PRAGMA table_info(${tableIdent});`);
	const hasTagColumn = tableInfo.some((col) => col.name === "tag");
	if (!hasTagColumn) {
		await tx.sql(`ALTER TABLE ${tableIdent} ADD COLUMN tag TEXT;`);
	}
}

async function readLastMigration(
	tx: SqlocalTx,
	tableIdent: string
): Promise<{ createdAt: number; hash: string | null }> {
	const lastRows = await tx.sql(
		`SELECT hash, created_at FROM ${tableIdent} ORDER BY created_at DESC LIMIT 1;`
	);
	const last = lastRows[0];

	return {
		createdAt: toFiniteNumber(last?.created_at) ?? 0,
		hash: toNonEmptyString(last?.hash),
	};
}

function assertMigrationState(params: {
	lastCreatedAt: number;
	lastHash: string | null;
	migrations: ClientMigration[];
}): void {
	const { lastCreatedAt, lastHash, migrations } = params;

	const newestBundled = migrations.at(-1);
	if (newestBundled && lastCreatedAt > newestBundled.folderMillis) {
		throw new Error(
			"Database is newer than bundled migrations; downgrade is not supported."
		);
	}

	if (lastCreatedAt === 0) {
		return;
	}

	const lastBundled = migrations.find((m) => m.folderMillis === lastCreatedAt);
	if (!lastBundled) {
		throw new Error(
			"Database migration state is not present in bundled migrations."
		);
	}

	if (lastHash && lastHash !== lastBundled.hash) {
		throw new Error(`Migration hash mismatch for ${lastBundled.tag}.`);
	}
}

function getPendingMigrations(
	migrations: ClientMigration[],
	lastCreatedAt: number
): ClientMigration[] {
	return migrations.filter(
		(migration) => migration.folderMillis > lastCreatedAt
	);
}

async function applyPendingMigrations(params: {
	tx: SqlocalTx;
	tableIdent: string;
	pending: ClientMigration[];
	applied: AppliedMigration[];
}): Promise<void> {
	const { tx, tableIdent, pending, applied } = params;

	for (const migration of pending) {
		for (const statement of migration.sql) {
			await tx.sql(statement);
		}

		await tx.sql(
			`INSERT INTO ${tableIdent} (hash, created_at, tag) VALUES (?, ?, ?);`,
			migration.hash,
			migration.folderMillis,
			migration.tag
		);

		applied.push({
			tag: migration.tag,
			folderMillis: migration.folderMillis,
			hash: migration.hash,
		});
	}
}

export function migrateClientDb(
	sqlocal: SQLocalDrizzle,
	options: MigrateClientDbOptions = {}
): Promise<MigrateClientDbResult> {
	const migrationsTable = options.migrationsTable ?? DEFAULT_MIGRATIONS_TABLE;
	const tableIdent = quoteIdentifier(migrationsTable);
	const migrations = [...(options.migrations ?? clientMigrations)].sort(
		(a, b) => a.folderMillis - b.folderMillis
	);

	if (migrations.length === 0) {
		return Promise.resolve({ applied: [] });
	}

	return withExclusiveLock(options.lockName, async () => {
		const applied: AppliedMigration[] = [];

		await sqlocal.transaction(async (tx) => {
			await ensureMigrationsTable(tx, tableIdent);
			const { createdAt: lastCreatedAt, hash: lastHash } =
				await readLastMigration(tx, tableIdent);

			assertMigrationState({
				lastCreatedAt,
				lastHash,
				migrations,
			});

			const pending = getPendingMigrations(migrations, lastCreatedAt);
			await applyPendingMigrations({ tx, tableIdent, pending, applied });
		});

		return { applied };
	});
}
