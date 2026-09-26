import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import {
	events,
	projects,
	stages,
	teamMembers,
	teams,
	tracks
} from '$lib/server/db/schema';

export async function requireParticipant(
	userId: string
) {
	const user = await db.query.users.findFirst({
		where: (users, { eq }) =>
			eq(users.id, userId)
	});

	if (!user) {
		throw error(401, 'Authentication required.');
	}

	if (
		user.type !== 'participant' &&
		user.type !== 'organizer' &&
		user.type !== 'admin'
	) {
		throw error(
			403,
			'Participant access required.'
		);
	}

	return user;
}

export async function getTeamForUser(
	userId: string,
	eventId: string
) {
	const user = await db.query.users.findFirst({
		where: (users, { eq }) =>
			eq(users.id, userId)
	});

	if (!user?.email) {
		return null;
	}

	const result = await db
		.select({
			team: teams
		})
		.from(teamMembers)
		.innerJoin(
			teams,
			eq(teamMembers.teamId, teams.id)
		)
		.where(
			and(
				eq(teamMembers.userEmail, user.email),
				eq(teams.eventId, eventId)
			)
		)
		.limit(1);

	return result[0]?.team ?? null;
}

export async function getSubmissionStage(
	eventId: string,
	trackId?: string
) {
	if (trackId) {
		const result = await db
			.select({
				stage: stages,
				track: tracks
			})
			.from(stages)
			.innerJoin(
				tracks,
				eq(stages.trackId, tracks.id)
			)
			.where(
				and(
					eq(tracks.eventId, eventId),
					eq(tracks.id, trackId)
				)
			)
			.limit(1);

		return result[0] ?? null;
	}

	const result = await db
		.select({
			stage: stages,
			track: tracks
		})
		.from(stages)
		.innerJoin(
			tracks,
			eq(stages.trackId, tracks.id)
		)
		.where(eq(tracks.eventId, eventId))
		.limit(1);

	return result[0] ?? null;
}

export async function canEditProject(
	projectId: string,
	userId: string
) {
	const user = await requireParticipant(userId);

	const result = await db
		.select({
			project: projects,
			team: teams
		})
		.from(projects)
		.innerJoin(
			teams,
			eq(projects.teamId, teams.id)
		)
		.where(eq(projects.id, projectId))
		.limit(1);

	const record = result[0];

	if (!record) {
		throw error(404, 'Project not found.');
	}

	if (
		user.type === 'admin'
	) {
		return record;
	}

	if (record.team.leaderEmail !== user.email) {
		throw error(
			403,
			'Only the team leader can edit the project.'
		);
	}

	if (record.project.status === 'submitted') {
		const stageResult = await db
			.select()
			.from(stages)
			.where(
				eq(
					stages.id,
					record.project.stageId
				)
			)
			.limit(1);

		const stage = stageResult[0];

		if (
			stage?.endAt &&
			new Date() > new Date(stage.endAt)
		) {
			throw error(
				403,
				'Submitted projects cannot be edited after the deadline.'
			);
		}
	}

	return record;
}