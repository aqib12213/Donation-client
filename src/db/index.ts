import { drizzle } from "drizzle-orm/sqlite-proxy";
import { SQLocalDrizzle } from "sqlocal/drizzle";

export const DATABASE_PATH = "database.sqlite3";
export const MIGRATIONS_LOCK_NAME = `PWA-APP:migrations:${DATABASE_PATH}`;

export const sqlocal = new SQLocalDrizzle(DATABASE_PATH);
export const db = drizzle(sqlocal.driver);
