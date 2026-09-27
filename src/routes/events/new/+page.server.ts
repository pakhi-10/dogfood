import { redirect } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import { events } from '$lib/server/db/schema';

export const actions = {
	default: async ({ locals }) => {
		const user = locals.user;

		if (!user) {
			throw redirect(303, '/login');
		}

		if (user.role !== 'organizer') {
			throw redirect(303, '/events');
		}

		const [event] = await db
			.insert(events)
			.values({
				name: 'Untitled event',
				tagline: '',
				about: '',
				minTeamSize: 1,
				maxTeamSize: 4,
				websiteLink: '',
				contactEmail: user.email,
				logo: '',
				prizes: '',
				status: 'draft',
				publishedAt: null,
				organizerId: user.id
			})
			.returning({
				id: events.id
			});

		throw redirect(
			303,
			`/events/${event.id}?tab=event-details`
		);
	}
};