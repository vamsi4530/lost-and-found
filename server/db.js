// SQLite database powered by sql.js (WebAssembly). This avoids native C++ builds
// and works with Node.js 20, 22, and 24 on Windows without Visual Studio tools.
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, 'data');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const file = path.join(dir, 'lost-found.sqlite');

function createAdapter(nativeDb) {
  const persist = () => fs.writeFileSync(file, Buffer.from(nativeDb.export()));
  return {
    exec(sql) {
      nativeDb.exec(sql);
      persist();
    },
    // Kept as a no-op for compatibility with the previous SQLite driver.
    pragma() {},
    prepare(sql) {
      return {
        get(...params) {
          const statement = nativeDb.prepare(sql);
          try {
            if (params.length) statement.bind(params);
            return statement.step() ? statement.getAsObject() : undefined;
          } finally {
            statement.free();
          }
        },
        all(...params) {
          const statement = nativeDb.prepare(sql);
          const rows = [];
          try {
            if (params.length) statement.bind(params);
            while (statement.step()) rows.push(statement.getAsObject());
            return rows;
          } finally {
            statement.free();
          }
        },
        run(...params) {
          nativeDb.run(sql, params);
          const changes = nativeDb.getRowsModified();
          const result = nativeDb.exec('SELECT last_insert_rowid() AS id');
          const lastInsertRowid = result.length && result[0].values.length
            ? result[0].values[0][0]
            : 0;
          persist();
          return { changes, lastInsertRowid };
        }
      };
    }
  };
}

module.exports = (async () => {
  const SQL = await initSqlJs();
  let nativeDb;
  if (fs.existsSync(file)) {
    const bytes = fs.readFileSync(file);
    nativeDb = new SQL.Database(new Uint8Array(bytes));
  } else {
    nativeDb = new SQL.Database();
  }
  const db = createAdapter(nativeDb);
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'user', created_at TEXT DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE IF NOT EXISTS Lost_Items (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, color TEXT, item_date TEXT NOT NULL, location TEXT NOT NULL, image_path TEXT, status TEXT DEFAULT 'lost', created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES Users(id));
    CREATE TABLE IF NOT EXISTS Found_Items (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, color TEXT, item_date TEXT NOT NULL, location TEXT NOT NULL, image_path TEXT, status TEXT DEFAULT 'found', created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES Users(id));
    CREATE TABLE IF NOT EXISTS Matches (id INTEGER PRIMARY KEY AUTOINCREMENT, lost_item_id INTEGER NOT NULL, found_item_id INTEGER NOT NULL, score REAL NOT NULL, factors TEXT, status TEXT DEFAULT 'potential', created_at TEXT DEFAULT CURRENT_TIMESTAMP, UNIQUE(lost_item_id, found_item_id));
    CREATE TABLE IF NOT EXISTS Notifications (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, read INTEGER DEFAULT 0, created_at TEXT DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES Users(id));
  `);
  return db;
})();
