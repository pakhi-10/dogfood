import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

if (!env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not configured');
}

const pool = new Pool({
	connectionString: env.DATABASE_URL
});

export const db = drizzle(pool, {
	schema
});