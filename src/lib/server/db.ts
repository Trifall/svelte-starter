import { DATABASE_URL } from "$env/static/private";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

if (!DATABASE_URL) throw new Error("DATABASE_URL is not set priv");

const driver = postgres(DATABASE_URL);

export const db = drizzle({ client: driver, schema });
