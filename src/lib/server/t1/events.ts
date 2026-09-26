import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';

export async function requireOrganizer(
	userId: string | undefined
) {
	if (!userId) {
		throw error(401, 'Authentication required.');
	}

	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId)
	});

	if (!user) {
		throw error(401, 'Authentication required.');
	}

	if (user.type !== 'organizer' && user.type !== 'admin') {
		throw error(403, 'Organizer access required.');
	}

	return user;
}

export async function requireEventOwner(
	eventId: string,
	userId: string
) {
	const event = await db
		.select()
		.from(events)
		.where(eq(events.id, eventId))
		.limit(1);

	if (!event[0]) {
		throw error(404, 'Event not found.');
	}

	if (
		event[0].organizerId !== userId
	) {
		const user = await db.query.users.findFirst({
			where: (users, { eq }) =>
				eq(users.id, userId)
		});

		if (user?.type !== 'admin') {
			throw error(
				403,
				'You do not own this event.'
			);
		}
	}

	return event[0];
}