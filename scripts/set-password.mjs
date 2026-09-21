import bcrypt from "bcryptjs";
import { createClient } from "./db-client.mjs";

const [, , emailPessoal, senha] = process.argv;

if (!emailPessoal || !senha) {
  console.error("Uso: node scripts/set-password.mjs <email_pessoal> <senha>");
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
     where email_pessoal = $2 and ativo = true
     returning nome, email, perfil`,
    [hash, emailPessoal]
  );
  if (rows.length === 0) {
    console.error(`Nenhum colaborador ativo encontrado com email_pessoal = ${emailPessoal}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Senha definida para ${rows[0].nome} (${rows[0].email}, perfil=${rows[0].perfil}).`);
}

main()
  .catch((err) => {
    console.error("ERRO:", err.message);
    process.exitCode = 1;
  })
  .finally(() => client.end());
