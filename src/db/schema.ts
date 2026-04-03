import { int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	age: int().notNull(),
	email: text().notNull().unique(),
});

export const todosTable = sqliteTable("todos_table", {
	id: int().primaryKey({ autoIncrement: true }),
	title: text().notNull(),
	description: text(),
	completed: int().notNull().default(0),
	createdAt: real().notNull().default(Date.now()),
});
