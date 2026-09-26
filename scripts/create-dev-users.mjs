import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import pg from 'pg';

const scrypt = promisify(scryptCallback);

const { Client } = pg;

const DATABASE_URL =
	process.env.DATABASE_URL ||
	'postgresql://postgres:1234@localhost:5432/dogfood';

async function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = await scrypt(password, salt, 64);

	return `scrypt:${salt}:${Buffer.from(derivedKey).toString('hex')}`;
}

const users = [
	{
		name: 'Dev Admin',
		email: 'admin@dogfood.local',
		username: 'dev_admin',
		password: 'admin1234',
		type: 'admin'
	},
	{
		name: 'Dev Organizer',
		email: 'organizer@dogfood.local',
		username: 'dev_organizer',
		password: 'organizer1234',
		type: 'organizer'
	}
];

const client = new Client({ connectionString: DATABASE_URL });

try {
	await client.connect();

	for (const user of users) {
		const existing = await client.query(
			'SELECT id FROM users WHERE email = $1 LIMIT 1',
			[user.email]
		);

		const passwordHash = await hashPassword(user.password);

		if (existing.rows.length > 0) {
			await client.query(
				`
				UPDATE users
				SET
					name = $1,
					username = $2,
					password = $3,
					type = $4
				WHERE email = $5
				`,
				[
					user.name,
					user.username,
					passwordHash,
					user.type,
					user.email
				]
			);

			console.log(`Updated ${user.type}: ${user.email}`);
		} else {
			await client.query(
				`
				INSERT INTO users
					(name, email, username, password, type)
				VALUES
					($1, $2, $3, $4, $5)
				`,
				[
					user.name,
					user.email,
					user.username,
					passwordHash,
					user.type
				]
			);

			console.log(`Created ${user.type}: ${user.email}`);
		}
	}
} finally {
	await client.end();
}