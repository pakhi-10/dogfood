import { asc } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';

export const load = async () => {
	const rows = await db
		.select({
			id: events.id,
			name: events.name,
			tagline: events.tagline,
			about: events.about,
			applicationOpenAt: events.applicationOpenAt,
			applicationCloseAt: events.applicationCloseAt,
			createdAt: events.createdAt
		})
		.from(events)
		.orderBy(asc(events.applicationOpenAt));

	return {
		events: rows
	};
};