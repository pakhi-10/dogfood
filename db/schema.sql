 Get-Content package.json
{
        "name": "dogfood",
        "private": true,
        "version": "0.0.1",
        "type": "module",
        "scripts": {
                "dev": "vite dev",
                "build": "vite build",
                "preview": "vite preview",
                "prepare": "svelte-kit sync || echo ''",
                "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
                "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch"
        },
        "devDependencies": {
                "@sveltejs/adapter-auto": "^7.0.1",
                "@sveltejs/kit": "^2.63.0",
                "@sveltejs/vite-plugin-svelte": "^7.1.2",
                "drizzle-kit": "^0.31.11",
                "svelte": "^5.56.1",
                "svelte-check": "^4.6.0",
                "tsx": "^4.23.15",
                "typescript": "^6.0.3",
                "vite": "^8.0.16"
        },
        "dependencies": {
                "drizzle-orm": "^0.45.3",
                "pg": "^8.23.0",
                "postgres": "^3.4.9"
        }
}
PS C:\Users\gauri\Desktop\koding\dogfood\dogfood> Get-Content src\lib\server\db\index.ts
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
PS C:\Users\gauri\Desktop\koding\dogfood\dogfood> 