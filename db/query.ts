import { db, closeDb } from "./client.ts";

const select = db.prepare("SELECT * FROM signals WHERE symbol = ?");
const rows = select.all("ZM");
console.log(rows);
console.log(rows.map((r) => JSON.parse(r.last_five_days)));

closeDb();