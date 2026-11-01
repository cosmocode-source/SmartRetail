import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const next = require.resolve("next/dist/bin/next");
const env = { ...process.env, SMARTRETAIL_PRESENTATION: "1" };
let child;
function run(args) {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, [next, ...args], { env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => { child?.kill(signal); process.exit(0); });
}
const code = await run(["build"]);
if (code !== 0) process.exit(code);
console.log("Presentation build ready. Keep this terminal open during the demonstration.");
process.exit(await run(["start", "--hostname", "0.0.0.0", ...process.argv.slice(2)]));
