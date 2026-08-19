import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
    console.error(
        "DATABASE_URL tidak ditemukan. Pastikan file .env sudah dibuat dan berisi baris: DATABASE_URL=..."
    );
    process.exit(1);
}

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export async function testConnection() {
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("Database connected:", result.rows[0].now);
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1);
    }
}
