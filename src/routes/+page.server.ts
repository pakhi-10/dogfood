import { db } from '$lib/server/db';
import { events, projects, teams, stages, tracks } from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	const now = new Date();

	const eventRows = await db
		.select({
			id: events.id,
			name: events.name,
			tagline: events.tagline,
			about: events.about,
			applicationOpenAt: events.applicationOpenAt,
			applicationCloseAt: events.applicationCloseAt,
			judgingStartAt: events.judgingStartAt,
			judgingDeadline: events.judgingDeadline,
			resultAnnouncement: events.resultAnnouncement,
			prizes: events.prizes
		})
		.from(events)
		.orderBy(desc(events.createdAt))
		.limit(6);

	const currentEvents = eventRows.map((event) => {
		let status: 'upcoming' | 'active' | 'ended';

		if (
			event.applicationOpenAt &&
			now < new Date(event.applicationOpenAt)
		) {
			status = 'upcoming';
		} else if (
			event.applicationCloseAt &&
			now > new Date(event.applicationCloseAt)
		) {
			status = 'ended';
		} else {
			status = 'active';
		}

		return {
			...event,
			status
		};
	});

	const galleryRows = await db
		.select({
			id: projects.id,
			projectName: projects.projectName,
			projectTagline: projects.projectTagline,
			thumbnail: projects.thumbnail,
			eventName: events.name,
			trackName: tracks.name
		})
		.from(projects)
		.innerJoin(teams, eq(projects.teamId, teams.id))
		.innerJoin(events, eq(teams.eventId, events.id))
		.innerJoin(stages, eq(projects.stageId, stages.id))
		.innerJoin(tracks, eq(stages.trackId, tracks.id))
		.orderBy(desc(projects.submittedAt))
		.limit(3);

	return {
		user: locals.user,
		events: currentEvents,
		gallery: galleryRows
	};
};