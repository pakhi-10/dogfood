import { and, eq, ilike, or } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	projects,
	teams,
	events,
	tracks,
	stages
} from '$lib/server/db/schema';

export const load = async ({ url }) => {
	const search = url.searchParams
		.get('q')
		?.trim() ?? '';

	const trackId =
		url.searchParams.get('track') ?? '';

	const conditions = [
		eq(projects.status, 'submitted')
	];

	if (search) {
		conditions.push(
			or(
				ilike(
					projects.projectName,
					`%${search}%`
				),
				ilike(
					projects.projectTagline,
					`%${search}%`
				),
				ilike(
					projects.longDescription,
					`%${search}%`
				)
			)!
		);
	}

	if (trackId) {
		conditions.push(
			eq(tracks.id, trackId)
		);
	}

	const result = await db
		.select({
			id: projects.id,
			name: projects.projectName,
			tagline: projects.projectTagline,
			description:
				projects.longDescription,
			repoUrl: projects.repoUrl,
			demoVideoUrl:
				projects.demoVideoUrl,
			teamName: teams.teamName,
			eventName: events.name,
			eventId: events.id,
			trackId: tracks.id,
			trackName: tracks.name,
			submittedAt: projects.submittedAt
		})
		.from(projects)
		.innerJoin(
			teams,
			eq(projects.teamId, teams.id)
		)
		.innerJoin(
			events,
			eq(teams.eventId, events.id)
		)
		.innerJoin(
			stages,
			eq(projects.stageId, stages.id)
		)
		.innerJoin(
			tracks,
			eq(stages.trackId, tracks.id)
		)
		.where(and(...conditions))
		.orderBy(projects.submittedAt);

	const allTracks = await db
		.select({
			id: tracks.id,
			name: tracks.name
		})
		.from(tracks);

	return {
		projects: result,
		tracks: allTracks,
		search,
		trackId
	};
};