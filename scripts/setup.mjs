import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npmOptions = process.platform === "win32" ? { shell: true } : {};

function run(command, args, options = {}) {
  execFileSync(command, args, { cwd: root, stdio: "inherit", ...options });
}

function runDocker(args, options = {}) {
  run("docker", ["compose", ...args], options);
}

function ensureEnv() {
  if (existsSync(envPath)) return;
  const template = readFileSync(path.join(root, ".env.example"), "utf8");
  const env = template.replace(
    "AUTH_SECRET=replace-with-at-least-32-random-characters",
    `AUTH_SECRET=${randomBytes(32).toString("base64url")}`
  );
  writeFileSync(envPath, env);
  console.log("Created .env.local with a generated development session secret.");
}

function waitFor(service, command, args, attempts = 30) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      runDocker(["exec", service, command, ...args], { stdio: "ignore" });
      return;
    } catch {
      if (attempt === attempts) throw new Error(`${service} did not become ready in time.`);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 1000);
    }
  }
}

ensureEnv();
try {
  runDocker(["up", "-d"]);
} catch {
  throw new Error("Docker Compose could not start. Open Docker Desktop, wait until it is running, then retry `npm run local`.");
}
waitFor("postgres", "pg_isready", ["-U", "smartretail", "-d", "smartretail"]);
waitFor("mongodb", "mongosh", ["mongodb://localhost:27017/smartretail", "--quiet", "--eval", "db.runCommand({ ping: 1 }).ok"]);

if (!existsSync(path.join(root, "node_modules"))) run(npmCommand, ["install"], npmOptions);
run(npmCommand, ["run", "db:seed"], npmOptions);

for (const script of ["validators.js", "indexes.js"]) {
  const contents = readFileSync(path.join(root, "database", "mongodb", script), "utf8");
  runDocker(
    ["exec", "-i", "mongodb", "mongosh", "mongodb://localhost:27017/smartretail", "--quiet"],
    { input: contents }
  );
}

console.log("SmartRetail setup is complete. Run `npm run dev` or `npm run local`.");
