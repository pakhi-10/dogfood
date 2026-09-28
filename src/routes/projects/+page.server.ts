import { and, desc, eq, ilike, or } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	projects,
	teams,
	events,
	tracks
} from '$lib/server/db/schema';

export const load = async ({ url, locals }) => {
	const search =
		url.searchParams
			.get('q')
			?.trim() ?? '';

	const trackId =
		url.searchParams.get('track') ?? '';

	const conditions = [
		eq(
			projects.status,
			'submitted'
		)
	];

	if (search) {
		conditions.push(
			or(
				ilike(
					projects.title,
					`%${search}%`
				),
				ilike(
					projects.projectTagline,
					`%${search}%`
				),
				ilike(
					projects.summary,
					`%${search}%`
				)
			)!
		);
	}

	if (trackId) {
		conditions.push(
			eq(
				tracks.id,
				trackId
			)
		);
	}

	const result = await db
		.select({
			id: projects.id,
			name: projects.title,
			tagline:
				projects.projectTagline,
			description:
				projects.summary,
			thumbnail:
				projects.thumbnail,
			repoUrl:
				projects.repoUrl,
			demoVideoUrl:
				projects.demoVideoUrl,
			teamName:
				teams.teamName,
			eventName:
				events.name,
			eventId:
				events.id,
			trackId:
				tracks.id,
			trackName:
				tracks.name,
			submittedAt:
				projects.submittedAt
		})
		.from(projects)
		.innerJoin(
			teams,
			eq(
				projects.teamId,
				teams.id
			)
		)
		.innerJoin(
			events,
			eq(
				teams.eventId,
				events.id
			)
		)
		.innerJoin(
			tracks,
			eq(
				projects.trackId,
				tracks.id
			)
		)
		.where(
			and(...conditions)
		)
		.orderBy(
			desc(projects.submittedAt)
		);

	const allTracks = await db
		.select({
			id: tracks.id,
			name: tracks.name
		})
		.from(tracks)
		.orderBy(tracks.name);

	return {
		projects: result,
		tracks: allTracks,
		search,
		trackId,
		user: locals.user
	};
};