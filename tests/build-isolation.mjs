// Start dev on 3000 and presentation on 3100 before running this regression check.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const origins = (process.env.TEST_ORIGINS || "http://localhost:3000,http://localhost:3100").split(",");
const targets = [];
for (const origin of origins) {
  const login = await fetch(`${origin}/api/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: process.env.TEST_EMAIL || "admin@smartretail.local", password: process.env.TEST_PASSWORD || "Admin123!" })
  });
  assert.equal(login.status, 200, `${origin}: login failed`);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  for (const route of ["/pos", "/purchase-orders", "/analytics"]) {
    const response = await fetch(origin + route, { headers: { Cookie: cookie } });
    assert.equal(response.status, 200, origin + route);
    const html = await response.text();
    assert.ok(!html.includes("Internal Server Error"), origin + route);
    const paths = [...html.matchAll(/(?:href|src)="([^\"]*\/_next\/static\/[^\"]+)"/g)].map((match) => match[1].replaceAll("&amp;", "&"));
    assert.ok(paths.some((path) => path.includes(".css")), "Page must have stylesheets");
    for (const path of new Set(paths)) targets.push(new URL(path, origin).toString());
  }
}
async function verify() {
  for (const url of new Set(targets)) {
    const response = await fetch(url);
    assert.equal(response.status, 200, `Static asset unavailable: ${url}`);
    await response.arrayBuffer();
  }
}
await verify();
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit", env: { ...process.env, SMARTRETAIL_PRESENTATION: "0" } });
let done = false;
const completion = new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("exit", (code) => { done = true; resolve(code); });
});
let checks = 0;
try {
  while (!done) { await verify(); checks++; await new Promise((resolve) => setTimeout(resolve, 750)); }
  assert.equal(await completion, 0, "Ordinary build must succeed");
  await verify();
  console.log(`PASS: ${new Set(targets).size} dev/presentation assets remained available across ${checks} checks during a production build.`);
} catch (error) { child.kill("SIGTERM"); throw error; }
