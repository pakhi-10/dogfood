import { error } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	events,
	projects,
	teams,
	teamMembers,
	users
} from '$lib/server/db/schema';

export async function requireParticipant(
	userId: string
) {
	const [user] = await db
		.select({
			id: users.id,
			type: users.type
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		throw error(401, 'Authentication required.');
	}

	if (user.type !== 'participant') {
		throw error(403, 'Participant access required.');
	}

	return user;
}

export async function getTeamForUser(
	userId: string,
	eventId: string
) {
	const [user] = await db
		.select({
			id: users.id,
			email: users.email
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		return null;
	}

	const leaderConditions = [
		eq(teams.eventId, eventId)
	];

	if (user.email) {
		leaderConditions.push(
			eq(teams.leaderEmail, user.email)
		);
	}

	const [leaderTeam] = await db
		.select({
			id: teams.id,
			eventId: teams.eventId,
			teamName: teams.teamName,
			leaderEmail: teams.leaderEmail
		})
		.from(teams)
		.where(and(...leaderConditions))
		.limit(1);

	if (leaderTeam) {
		return leaderTeam;
	}

	if (!user.email) {
		return null;
	}

	const [memberTeam] = await db
		.select({
			id: teams.id,
			eventId: teams.eventId,
			teamName: teams.teamName,
			leaderEmail: teams.leaderEmail
		})
		.from(teamMembers)
		.innerJoin(
			teams,
			eq(teamMembers.teamId, teams.id)
		)
		.where(
			and(
				eq(teams.eventId, eventId),
				eq(
					teamMembers.userEmail,
					user.email
				)
			)
		)
		.limit(1);

	return memberTeam ?? null;
}

export async function getProjectForUser(
	userId: string,
	projectId: string
) {
	const [user] = await db
		.select({
			id: users.id,
			email: users.email
		})
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!user) {
		return null;
	}

	const [project] = await db
		.select({
			project: projects,
			event: events,
			team: teams
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
		.where(
			and(
				eq(projects.id, projectId),
				or(
					user.email
						? eq(
								teams.leaderEmail,
								user.email
							)
						: undefined,
					user.email
						? eq(
								teamMembers.userEmail,
								user.email
							)
						: undefined
				)
			)
		)
		.limit(1);

	return project ?? null;
}

export async function getSubmissionDeadline(
	eventId: string
) {
	const [event] = await db
		.select({
			id: events.id,
			submissionsClose:
				events.submissionsClose
		})
		.from(events)
		.where(eq(events.id, eventId))
		.limit(1);

	return event?.submissionsClose ?? null;
}