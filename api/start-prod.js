const fs = require("fs");
const path = require("path");

const apiDir = __dirname;
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(apiDir, "db.json");
const dbExamplePath = path.join(apiDir, "db.example.json");

if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  console.log(`[db] Creando base nueva en ${dbPath}`);
  fs.copyFileSync(dbExamplePath, dbPath);
} else {
  console.log(`[db] Usando base persistente en ${dbPath}`);
  const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  if (!Array.isArray(db.shipments)) {
    db.shipments = [];
  }

  if (!Array.isArray(db.store_settings)) {
    db.store_settings = [];
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

process.chdir(apiDir);

require("tsconfig-paths/register");
require("ts-node/register/transpile-only");
require("./src/index.ts");
