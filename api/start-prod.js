const fs = require("fs");
const path = require("path");

const apiDir = __dirname;
const dbPath = path.join(apiDir, "db.json");
const dbExamplePath = path.join(apiDir, "db.example.json");

if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(dbExamplePath, dbPath);
} else {
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
