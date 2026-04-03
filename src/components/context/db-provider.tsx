import { useEffect, useState } from "react";
import { MIGRATIONS_LOCK_NAME, sqlocal } from "@/db";
import { migrateClientDb } from "@/db/migrate";

interface DbProviderProps {
    children: React.ReactNode;
}

type DbInitState =
    | { status: "pending" }
    | { status: "ready" }
    | { status: "error"; error: Error };

export function DbProvider({ children }: DbProviderProps) {
    const [state, setState] = useState<DbInitState>({ status: "pending" });

    useEffect(() => {
        let cancelled = false;

        const init = async () => {
            try {
                await migrateClientDb(sqlocal, { lockName: MIGRATIONS_LOCK_NAME });

                if (cancelled) {
                    return;
                }

                setState({ status: "ready" });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                const err = error instanceof Error ? error : new Error(String(error));
                setState({ status: "error", error: err });
            }
        };

        init();

        return () => {
            cancelled = true;
        };
    }, []);

    if (state.status === "pending") {
        return null;
    }

    if (state.status === "error") {
        throw state.error;
    }

    return children;
}
