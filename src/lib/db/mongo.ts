import { MongoClient } from "mongodb";
import { getEnv } from "@/lib/env";

const client = new MongoClient(getEnv().MONGODB_URI);
let connection: Promise<MongoClient> | undefined;
export function getMongoClient() { connection ??= client.connect(); return connection; }
export async function getMongoDb() { return (await getMongoClient()).db(getEnv().MONGODB_DB); }
