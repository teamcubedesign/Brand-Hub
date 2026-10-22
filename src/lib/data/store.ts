import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { BrandColor, BrandFont, Client, Link, Note, Profile } from "@/lib/types";
import { seed } from "./seed";

/**
 * MOCK DATABASE — a JSON file in `.mock-db/db.json`, seeded on first use.
 * Delete the folder (or run `npm run mock:reset`) to get the sample data back.
 *
 * Only `src/lib/data/index.ts` talks to this file. The dev team replaces that
 * module with real database queries and deletes this one.
 */
export type Db = {
  profiles: Profile[];
  clients: Client[];
  brand_colors: BrandColor[];
  brand_fonts: BrandFont[];
  links: Link[];
  notes: Note[];
};

const FILE = path.join(process.cwd(), ".mock-db", "db.json");

// Fallback for read-only file systems (e.g. a serverless preview deploy).
let memory: Db | null = null;

export async function readDb(): Promise<Db> {
  if (memory) return structuredClone(memory);
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Db;
  } catch {
    const db = seed();
    await writeDb(db);
    return db;
  }
}

export async function writeDb(db: Db) {
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(db, null, 2));
  } catch {
    memory = structuredClone(db);
  }
}

/** Read, change and save in one go. */
export async function mutate<T>(change: (db: Db) => T): Promise<T> {
  const db = await readDb();
  const result = change(db);
  await writeDb(db);
  return result;
}

export function newId() {
  return crypto.randomUUID();
}
