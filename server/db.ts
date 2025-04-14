import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { log } from "./vite";

// Initialize the postgres client with the DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL || "";

if (!connectionString) {
  log("Error: DATABASE_URL environment variable is not set.", "error");
  process.exit(1);
}

// Log that we're connecting to the database
log(`Connecting to PostgreSQL database${connectionString}`, "express");

// Create a postgres connection
const client = postgres(connectionString, { max: 10 });

// Initialize drizzle with the client
export const db = drizzle(client);

// Export a function to check the database connection
export async function checkDatabaseConnection() {
  try {
    // Simple query to check if the database is accessible
    await client`SELECT NOW()`;
    log(`PostgreSQL database connection successful.`, "express");
    return true;
  } catch (error) {
    log(
      `Database connection error: ${error instanceof Error ? error.message : String(error)}`,
      "error",
    );
    return false;
  }
}
