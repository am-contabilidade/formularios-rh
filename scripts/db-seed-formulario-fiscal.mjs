import fs from "node:fs";
import path from "node:path";
import { createClient, projectRoot } from "./db-client.mjs";

async function main() {
  const client = createClient();
  await client.connect();
  const sql = fs.readFileSync(
    path.join(projectRoot, "supabase", "seed-formulario-fiscal.sql"),
    "utf8"
  );
  console.log("Aplicando supabase/seed-formulario-fiscal.sql ...");
  await client.query(sql);
  console.log("OK");
  await client.end();
}

main().catch((err) => {
  console.error("ERRO:", err.message);
  process.exitCode = 1;
});
