import {
	createHash,
	randomBytes
} from 'node:crypto';

import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import {
	events,
	teamInvites,
	teamMembers,
	teams
} from '$lib/server/db/schema';

function hashToken(token: string) {
	return createHash('sha256')
		.update(token)
		.digest('hex');
}

export async function createTeamInvite(
	teamId: string,
	userId: string
) {
	const user = await db.query.users.findFirst({
		where: (users, { eq }) =>
			eq(users.id, userId)
	});

	if (!user?.email) {
		throw error(400, 'Your account has no email.');
	}

	const teamRows = await db
		.select()
		.from(teams)
		.where(eq(teams.id, teamId))
		.limit(1);

	const team = teamRows[0];

	if (!team) {
		throw error(404, 'Team not found.');
	}

	if (team.leaderEmail !== user.email) {
		throw error(
			403,
			'Only the team leader can create invite links.'
		);
	}

	const eventRows = await db
		.select()
		.from(events)
		.where(eq(events.id, team.eventId))
		.limit(1);

	const event = eventRows[0];

	if (!event) {
		throw error(404, 'Event not found.');
	}

	const memberCount = await db
		.select()
		.from(teamMembers)
		.where(eq(teamMembers.teamId, teamId));

	if (memberCount.length >= event.maxTeamSize) {
		throw error(
			400,
			'This team has reached its maximum size.'
		);
	}

	const token = randomBytes(32).toString('hex');

	await db.insert(teamInvites).values({
		teamId,
		tokenHash: hashToken(token),
		expiresAt: new Date(
			Date.now() + 1000 * 60 * 60 * 24 * 7
		)
	});

	return token;
}

export async function acceptTeamInvite(
	token: string,
	userId: string
) {
	const tokenHash = hashToken(token);

	const inviteRows = await db
		.select({
			invite: teamInvites,
			team: teams
		})
		.from(teamInvites)
		.innerJoin(
			teams,
			eq(teamInvites.teamId, teams.id)
		)
		.where(
			eq(teamInvites.tokenHash, tokenHash)
		)
		.limit(1);

	const record = inviteRows[0];

	if (!record) {
		throw error(404, 'Invite link is invalid.');
	}

	if (
		record.invite.expiresAt &&
		new Date() > new Date(record.invite.expiresAt)
	) {
		throw error(410, 'Invite link has expired.');
	}

	const user = await db.query.users.findFirst({
		where: (users, { eq }) =>
			eq(users.id, userId)
	});

	if (!user?.email) {
		throw error(400, 'Your account has no email.');
	}

	const eventRows = await db
		.select()
		.from(events)
		.where(eq(events.id, record.team.eventId))
		.limit(1);

	const event = eventRows[0];

	if (!event) {
		throw error(404, 'Event not found.');
	}

	const existing = await db
		.select()
		.from(teamMembers)
		.innerJoin(
			teams,
			eq(teamMembers.teamId, teams.id)
		)
		.where(
			and(
				eq(
					teamMembers.userEmail,
					user.email
				),
				eq(
					teams.eventId,
					record.team.eventId
				)
			)
		)
		.limit(1);

	if (existing.length) {
		throw error(
			409,
			'You already belong to a team for this event.'
		);
	}

	const memberCount = await db
		.select()
		.from(teamMembers)
		.where(
			eq(
				teamMembers.teamId,
				record.team.id
			)
		);

	if (memberCount.length >= event.maxTeamSize) {
		throw error(
			400,
			'This team has reached its maximum size.'
		);
	}

	await db.insert(teamMembers).values({
		teamId: record.team.id,
		userEmail: user.email
	});

	return record.team;
}