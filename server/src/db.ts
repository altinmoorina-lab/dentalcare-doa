import fs from "node:fs";
import path from "node:path";
import initSqlJs, { type Database, type SqlValue } from "sql.js";

export type ReviewRow = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_demo: number;
};

export type ReviewStore = Awaited<ReturnType<typeof createStore>>;

const DEMO_REVIEWS = [
  { name: "Arta K.", rating: 5, comment: "Staff i qetë dhe profesional. U ndjeva rehat gjatë gjithë vizitës.", days: 2 },
  { name: "Besnik M.", rating: 5, comment: "Shpjegim i qartë i trajtimit dhe asnjë ngutje. Rekomandoj.", days: 6 },
  { name: "Elira S.", rating: 4, comment: "Ambient shumë i pastër dhe termin i organizuar mirë.", days: 11 },
  { name: "Visitor", rating: 5, comment: "Very friendly team, clear explanations in English too.", days: 19 },
];

const COLUMNS = "id, name, rating, comment, created_at, is_demo";

function atomicWrite(file: string, data: Uint8Array) {
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, data);
  try {
    fs.renameSync(tmp, file);
  } catch {
    // Windows can refuse to rename over a file that antivirus/OneDrive is touching.
    fs.copyFileSync(tmp, file);
    fs.rmSync(tmp, { force: true });
  }
}

/**
 * SQLite through sql.js (SQLite compiled to WebAssembly): no native build step, so
 * `npm install` works on any OS/Node version. The database lives in memory and is
 * written to `dbPath` atomically after every change.
 */
export async function createStore(dbPath: string, opts: { seedDemo: boolean }) {
  const SQL = await initSqlJs();
  const persistent = dbPath !== ":memory:";
  let db: Database;
  if (persistent) {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    db = fs.existsSync(dbPath) ? new SQL.Database(fs.readFileSync(dbPath)) : new SQL.Database();
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      created_at TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      ip_hash TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_created ON reviews (created_at DESC, id DESC);
    CREATE INDEX IF NOT EXISTS idx_reviews_ip ON reviews (ip_hash, created_at);
  `);

  const persist = () => {
    if (persistent) atomicWrite(dbPath, db.export());
  };

  function all<T>(sql: string, params: SqlValue[] = []): T[] {
    const stmt = db.prepare(sql);
    try {
      stmt.bind(params);
      const rows: T[] = [];
      while (stmt.step()) rows.push(stmt.getAsObject() as T);
      return rows;
    } finally {
      stmt.free();
    }
  }
  const get = <T>(sql: string, params: SqlValue[] = []) => all<T>(sql, params)[0];

  function insert(name: string, rating: number, comment: string, createdAt: string, isDemo: number, ipHash: string | null) {
    db.run("INSERT INTO reviews (name, rating, comment, created_at, is_demo, ip_hash) VALUES (?, ?, ?, ?, ?, ?)", [
      name,
      rating,
      comment,
      createdAt,
      isDemo,
      ipHash,
    ]);
    return (get<{ id: number }>("SELECT last_insert_rowid() AS id") as { id: number }).id;
  }

  const initial = get<{ n: number }>("SELECT COUNT(*) AS n FROM reviews") as { n: number };
  if (opts.seedDemo && initial.n === 0) {
    for (const r of DEMO_REVIEWS) {
      const at = new Date(Date.now() - r.days * 86_400_000).toISOString();
      insert(r.name, r.rating, r.comment, at, 1, null);
    }
  }
  persist();

  return {
    list(limit: number, offset: number) {
      return all<ReviewRow>(
        `SELECT ${COLUMNS} FROM reviews ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?`,
        [limit, offset],
      );
    },
    stats() {
      const s = get<{ count: number; average: number | null }>(
        "SELECT COUNT(*) AS count, AVG(rating) AS average FROM reviews",
      ) as { count: number; average: number | null };
      return {
        count: s.count,
        average: s.average === null ? 0 : Math.round(s.average * 10) / 10,
      };
    },
    countFromIpSince(ipHash: string, sinceIso: string) {
      return (
        get<{ n: number }>("SELECT COUNT(*) AS n FROM reviews WHERE ip_hash = ? AND created_at > ?", [
          ipHash,
          sinceIso,
        ]) as { n: number }
      ).n;
    },
    isDuplicate(ipHash: string, comment: string, sinceIso: string) {
      return (
        get("SELECT 1 AS x FROM reviews WHERE ip_hash = ? AND comment = ? AND created_at > ? LIMIT 1", [
          ipHash,
          comment,
          sinceIso,
        ]) !== undefined
      );
    },
    add(input: { name: string; rating: number; comment: string; ipHash: string }) {
      const id = insert(input.name, input.rating, input.comment, new Date().toISOString(), 0, input.ipHash);
      persist();
      return get<ReviewRow>(`SELECT ${COLUMNS} FROM reviews WHERE id = ?`, [id]) as ReviewRow;
    },
    close() {
      db.close();
    },
  };
}
