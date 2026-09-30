import { MongoClient } from "mongodb";
const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("MONGODB_URI is not configured");
const client = new MongoClient(uri);
let connection: Promise<MongoClient> | undefined;
export function getMongoClient() { connection ??= client.connect(); return connection; }
export async function getMongoDb() { return (await getMongoClient()).db(process.env.MONGODB_DB || "smartretail"); }
