import nextEnv from "@next/env";
import bcrypt from "bcryptjs";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd(), true);

const [email, ...passwordParts] = process.argv.slice(2);
const password = passwordParts.join(" ");

if (!email || !password) {
  console.error("Usage: npm run verify:admin-login -- admin@example.com your-password");
  process.exit(1);
}

const configuredEmail = (process.env.ADMIN_EMAIL ?? "admin@erishot.com")
  .trim()
  .toLowerCase();
const configuredPasswordHash = process.env.ADMIN_PASSWORD_HASH;
const configuredPassword = process.env.ADMIN_PASSWORD ?? "erishot2026";

const emailMatches = email.trim().toLowerCase() === configuredEmail;
const passwordMatches = configuredPasswordHash
  ? await bcrypt.compare(password, configuredPasswordHash)
  : password === configuredPassword;

console.log("ADMIN_EMAIL loaded:", Boolean(process.env.ADMIN_EMAIL));
console.log(
  "ADMIN_PASSWORD_HASH bcrypt-shaped:",
  configuredPasswordHash ? /^\$2[aby]\$\d{2}\$/.test(configuredPasswordHash) : false
);
console.log("Email matches:", emailMatches);
console.log("Password matches:", passwordMatches);

process.exit(emailMatches && passwordMatches ? 0 : 1);
