import bcrypt from "bcryptjs";
import { createClient } from "./db-client.mjs";

const senha = process.env.DEFAULT_PASSWORD;

if (!senha) {
  console.error("DEFAULT_PASSWORD não definida em .env");
  process.exitCode = 1;
  process.exit();
}

const client = createClient();

async function main() {
  await client.connect();
  const hash = await bcrypt.hash(senha, 12);
  const { rows } = await client.query(
    `update public.formularios_colaboradores
     set password_hash = $1
     returning nome, email, perfil, ativo`,
    [hash]
  );
  console.log(`Senha redefinida para DEFAULT_PASSWORD em ${rows.length} colaborador(es):`);
  for (const row of rows) {
    console.log(`- ${row.nome} (${row.email}, perfil=${row.perfil}, ativo=${row.ativo})`);
  }
}

main()
  .catch((err) => {
    console.error("ERRO:", err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
