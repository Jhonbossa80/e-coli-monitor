import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "ecoli_monitor",
});

console.log("Archivo db.ts cargado correctamente");