
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'You must be logged in.');
	}

	if (locals.user.role !== 'admin') {
		throw error(403, 'Admin access required.');
	}

	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			role: users.type,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(desc(users.createdAt));

	return {
		users: allUsers
	};
};
