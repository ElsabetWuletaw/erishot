import bcrypt from "bcryptjs";

const password = process.argv.slice(2).join(" ");

if (!password) {
  console.error("Usage: npm run hash:admin-password -- your-password");
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const nextSafeHash = hash.replaceAll("$", "\\$");

console.log("Raw bcrypt hash:");
console.log(hash);
console.log("");
console.log("Paste this into .env or .env.local for Next.js:");
console.log(`ADMIN_PASSWORD_HASH=${nextSafeHash}`);
console.log("");
console.log("Login with the plain password you typed, not the hash.");
