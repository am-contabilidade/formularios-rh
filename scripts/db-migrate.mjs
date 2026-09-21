import fs from "node:fs";
import path from "node:path";
import { createClient, projectRoot } from "./db-client.mjs";

const migrationsDir = path.join(projectRoot, "supabase", "migrations");

async function main() {
  const client = createClient();
  await client.connect();

  await client.query(`
    create table if not exists public.formularios_schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    );
  `);

  const applied = new Set(
    (
      await client.query(
        "select filename from public.formularios_schema_migrations"
      )
    ).rows.map((r) => r.filename)
  );

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  let ranAny = false;
  for (const file of files) {
    if (applied.has(file)) continue;
    ranAny = true;
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`Aplicando ${file} ...`);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query(
        "insert into public.formularios_schema_migrations (filename) values ($1)",
        [file]
      );
      await client.query("commit");
      console.log(`  OK`);
    } catch (err) {
      await client.query("rollback");
      throw new Error(`Falhou em ${file}: ${err.message}`);
    }
  }

  if (!ranAny) console.log("Nenhuma migration pendente.");
  await client.end();
}

main().catch((err) => {
  console.error("ERRO:", err.message);
  process.exitCode = 1;
});
