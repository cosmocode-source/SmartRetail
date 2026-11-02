import { spawn } from "node:child_process";
import { spawnSync } from "node:child_process";

const setup = spawnSync(process.execPath, ["scripts/setup.mjs"], { stdio: "inherit" });
if (setup.status !== 0) process.exit(setup.status ?? 1);

const dev = spawn(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "dev", "--", "-p", "8080"], {
  stdio: "inherit",
  shell: process.platform === "win32"
});
dev.on("exit", (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
