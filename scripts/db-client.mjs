import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv(path.join(projectRoot, ".env"));

// Parsed manually because Supabase-generated DB passwords can contain
// unencoded characters (e.g. "@") that break naive URL splitting on the
// first "@"/":" found.
function parseDbUrl(raw) {
  const rest = raw.replace(/^postgres(ql)?:\/\//, "");
  const atIdx = rest.lastIndexOf("@");
  const creds = rest.slice(0, atIdx);
  const hostPart = rest.slice(atIdx + 1);
  const colonIdx = creds.indexOf(":");
  const user = decodeURIComponent(creds.slice(0, colonIdx));
  const password = decodeURIComponent(creds.slice(colonIdx + 1));
  const [hostport, dbAndQuery] = hostPart.split("/");
  const [host, port] = hostport.split(":");
  const database = (dbAndQuery || "postgres").split("?")[0];
  return { user, password, host, port: Number(port) || 5432, database };
}

export function createClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL não definida em .env");
  }
  return new Client({
    ...parseDbUrl(process.env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
  });
}

export { projectRoot };
