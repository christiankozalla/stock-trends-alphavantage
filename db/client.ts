import { Database } from "sqlite";

const db = new Database(new URL("../data/sqlite.db", import.meta.url));

const [version] = db.prepare("select sqlite_version()").value<[string]>()!;
console.log("Open DB connection to SQLite version: ", version);

const closeDb = () => db.close();

export { closeDb, db };
