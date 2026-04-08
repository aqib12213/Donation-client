import Dexie from "dexie";
import dexieCloud, { type DexieCloudTable } from "dexie-cloud-addon";

export interface TodoRecord {
	completed: boolean;
	createdAt: number;
	id: string;
	owner?: string;
	realmId?: string;
	title: string;
}

class TodoDatabase extends Dexie {
	todos!: DexieCloudTable<TodoRecord, "id">;

	constructor() {
		super("DonationClientTodoDB", {
			addons: [dexieCloud],
			cache: "immutable",
		});

		this.version(1).stores({
			todos: "@id, completed, createdAt",
		});

		if (import.meta.env.VITE_DBURL) {
			this.cloud.configure({
				databaseUrl: import.meta.env.VITE_DBURL,
				requireAuth: false,
				tryUseServiceWorker: true,
			});
		}
	}
}

export const todoDb = new TodoDatabase();
