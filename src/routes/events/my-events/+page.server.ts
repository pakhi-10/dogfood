import { redirect } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';

export const load = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw redirect(303, '/login');
	}

	if (user.role !== 'organizer') {
		throw redirect(303, '/events');
	}

	const organizerEvents = await db
		.select({
			id: events.id,
			name: events.name,
			tagline: events.tagline,
			about: events.about,
			logo: events.logo,
			minTeamSize: events.minTeamSize,
			maxTeamSize: events.maxTeamSize,
			applicationOpenAt: events.applicationOpenAt,
			applicationCloseAt: events.applicationCloseAt,
			judgingStartAt: events.judgingStartAt,
			judgingDeadline: events.judgingDeadline,
			resultAnnouncement: events.resultAnnouncement,
			status: events.status,
			publishedAt: events.publishedAt,
			createdAt: events.createdAt
		})
		.from(events)
		.where(eq(events.organizerId, user.id))
		.orderBy(desc(events.createdAt));

	return {
		events: organizerEvents
	};
};