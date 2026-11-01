import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

export default function config(phase) {
  return {
    // A production check must never overwrite files served by the live demo/dev server.
    distDir: process.env.SMARTRETAIL_PRESENTATION === "1"
      ? ".next-present"
      : phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next"
  };
}
