import { NextResponse } from "next/server";
import { postgres } from "@/lib/db/postgres";
import { getMongoDb } from "@/lib/db/mongo";

export async function GET() {
  const [postgresResult, mongoResult] = await Promise.allSettled([
    postgres.query("SELECT 1"),
    getMongoDb().then((db) => db.command({ ping: 1 }))
  ]);
  const body = {
    status: postgresResult.status === "fulfilled" && mongoResult.status === "fulfilled" ? "ok" : "degraded",
    postgres: postgresResult.status === "fulfilled" ? "up" : "down",
    mongodb: mongoResult.status === "fulfilled" ? "up" : "down"
  };
  return NextResponse.json(body, { status: body.status === "ok" ? 200 : 503 });
}
