import { db } from '$lib/server/db';
import {
	events,
	projects,
	teams,
	stages,
	tracks,
	users
} from '$lib/server/db/schema';
import { count, desc, eq } from 'drizzle-orm';

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

	let adminStats = null;

	if (locals.user?.role === 'admin') {
		const [
			userCount,
			eventCount,
			projectCount,
			teamCount,
			judgeCount
		] = await Promise.all([
			db.select({ count: count() }).from(users),

			db.select({ count: count() }).from(events),

			db.select({ count: count() }).from(projects),

			db.select({ count: count() }).from(teams),

			db
				.select({ count: count() })
				.from(users)
				.where(eq(users.type, 'judge'))
		]);

		adminStats = {
			users: userCount[0]?.count ?? 0,
			events: eventCount[0]?.count ?? 0,
			projects: projectCount[0]?.count ?? 0,
			teams: teamCount[0]?.count ?? 0,
			judges: judgeCount[0]?.count ?? 0
		};
	}

	return {
		user: locals.user,
		events: currentEvents,
		gallery: galleryRows,
		adminStats
	};
};

