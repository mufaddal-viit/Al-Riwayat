import mongoose from "mongoose";

const MONGO_URI =
  "";
const DB_NAME = "Cafedb";
const TIMEOUT_MS = 5_000;

interface CheckResult {
  connected: boolean;
  host: string;
  dbName: string;
  pingMs: number | null;
  error?: string;
}

async function checkDbConnection(): Promise<CheckResult> {
  const start = Date.now();

  try {
    await mongoose.connect(MONGO_URI, {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: TIMEOUT_MS,
      connectTimeoutMS: TIMEOUT_MS,
    });

    // Ping the database to confirm it's truly responsive
    await mongoose.connection.db!.admin().ping();

    const pingMs = Date.now() - start;
    const { host, port } = mongoose.connection;

    return {
      connected: true,
      host: `${host}:${port}`,
      dbName: mongoose.connection.name,
      pingMs,
    };
  } catch (err) {
    return {
      connected: false,
      host: MONGO_URI,
      dbName: DB_NAME,
      pingMs: null,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  console.log("\n🔍 Checking MongoDB connection...\n");

  const result = await checkDbConnection();

  if (result.connected) {
    console.log("✅ Connection successful");
    console.log(`   Host     : ${result.host}`);
    console.log(`   Database : ${result.dbName}`);
    console.log(`   Ping     : ${result.pingMs}ms`);
  } else {
    console.error("❌ Connection failed");
    console.error(`   URI      : ${result.host}`);
    console.error(`   Database : ${result.dbName}`);
    console.error(`   Error    : ${result.error}`);
    // process.exit(1);
  }

  console.log();
}

main();
