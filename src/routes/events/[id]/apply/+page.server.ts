import { error, fail, redirect } from '@sveltejs/kit';
import { and, asc, eq, sql } from 'drizzle-orm';
import { createHash, randomBytes } from 'node:crypto';

import { db } from '$lib/server/db';
import {
	events,
	teams,
	teamMembers,
	teamInvites,
	users
} from '$lib/server/db/schema';

function hashToken(token: string) {
	return createHash('sha256')
		.update(token)
		.digest('hex');
}

function createInviteToken() {
	return randomBytes(32).toString('hex');
}

async function getLiveEvent(eventId: string) {
	const [event] = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.id, eventId),
				eq(events.status, 'live')
			)
		)
		.limit(1);

	if (!event) {
		throw error(404, 'Event not found');
	}

	return event;
}

async function getCurrentMembership(
	eventId: string,
	email: string
) {
	const [membership] = await db
		.select({
			memberId: teamMembers.id,
			teamId: teams.id,
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
				eq(teamMembers.userEmail, email),
				eq(teams.eventId, eventId)
			)
		)
		.limit(1);

	return membership ?? null;
}

async function applicationIsOpen(event: {
	applicationOpenAt: Date | null;
	applicationCloseAt: Date | null;
}) {
	const now = new Date();

	if (
		event.applicationOpenAt &&
		now < new Date(event.applicationOpenAt)
	) {
		return false;
	}

	if (
		event.applicationCloseAt &&
		now > new Date(event.applicationCloseAt)
	) {
		return false;
	}

	return true;
}

async function getTeamMembers(teamId: string) {
	return db
		.select({
			id: teamMembers.id,
			email: teamMembers.userEmail,
			name: users.name,
			joinedAt: teamMembers.joinedAt
		})
		.from(teamMembers)
		.leftJoin(
			users,
			eq(teamMembers.userEmail, users.email)
		)
		.where(eq(teamMembers.teamId, teamId))
		.orderBy(asc(teamMembers.joinedAt));
}

export const load = async ({ locals, params, url }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	if (locals.user.role !== 'participant') {
		throw redirect(303, '/events');
	}

	const event = await getLiveEvent(params.id);

	const membership = await getCurrentMembership(
		event.id,
		locals.user.email
	);

	const inviteToken =
		url.searchParams.get('invite')?.trim() ?? '';

	/*
	 * ------------------------------------------------------------------------
	 * INVITE MODE
	 * ------------------------------------------------------------------------
	 *
	 * Anyone opening an invite URL sees the invitation rather than the
	 * normal team-management page.
	 */
	if (inviteToken) {
		const tokenHash = hashToken(inviteToken);

		const [invite] = await db
			.select({
				id: teamInvites.id,
				teamId: teams.id,
				teamName: teams.teamName,
				leaderEmail: teams.leaderEmail,
				expiresAt: teamInvites.expiresAt
			})
			.from(teamInvites)
			.innerJoin(
				teams,
				eq(teamInvites.teamId, teams.id)
			)
			.where(
				and(
					eq(
						teamInvites.tokenHash,
						tokenHash
					),
					eq(
						teams.eventId,
						event.id
					)
				)
			)
			.limit(1);

		if (!invite) {
			return {
				user: locals.user,
				event,
				mode: 'invalid-invite' as const
			};
		}

		if (
			invite.expiresAt &&
			new Date() > new Date(invite.expiresAt)
		) {
			return {
				user: locals.user,
				event,
				mode: 'invalid-invite' as const
			};
		}

		const [leader] = invite.leaderEmail
			? await db
					.select({
						name: users.name,
						email: users.email
					})
					.from(users)
					.where(
						eq(
							users.email,
							invite.leaderEmail
						)
					)
					.limit(1)
			: [];

		const members = await getTeamMembers(
			invite.teamId
		);

		const alreadyMember =
			members.some(
				(member) =>
					member.email ===
					locals.user.email
			);

		return {
			user: locals.user,
			event,
			mode: 'invite' as const,
			invite: {
				id: invite.id,
				teamId: invite.teamId,
				teamName: invite.teamName,
				leaderName:
					leader?.name ??
					invite.leaderEmail ??
					'Team leader',
				expiresAt: invite.expiresAt,
				alreadyMember
			},
			memberCount: members.length
		};
	}

	/*
	 * ------------------------------------------------------------------------
	 * NORMAL MODE
	 * ------------------------------------------------------------------------
	 */

	if (!membership) {
		return {
			user: locals.user,
			event,
			mode: 'create' as const,
			applicationOpen: await applicationIsOpen(event)
		};
	}

	const members = await getTeamMembers(
		membership.teamId
	);

	const isLeader =
		membership.leaderEmail ===
		locals.user.email;

	return {
		user: locals.user,
		event,
		mode: 'manage' as const,
		applicationOpen: await applicationIsOpen(event),
		team: {
			id: membership.teamId,
			name: membership.teamName,
			leaderEmail: membership.leaderEmail,
			isLeader
		},
		members
	};
};

export const actions = {
	createTeam: async ({
		request,
		locals,
		params
	}) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		if (locals.user.role !== 'participant') {
			return fail(403, {
				success: false,
				error:
					'Only participants can apply to events.'
			});
		}

		const event = await getLiveEvent(params.id);

		if (!(await applicationIsOpen(event))) {
			return fail(400, {
				success: false,
				error:
					'Applications are closed for this event.'
			});
		}

		const existingMembership =
			await getCurrentMembership(
				event.id,
				locals.user.email
			);

		if (existingMembership) {
			throw redirect(
				303,
				`/events/${event.id}/apply`
			);
		}

		const data = await request.formData();

		const teamName = String(
			data.get('teamName') ?? ''
		).trim();

		if (!teamName) {
			return fail(400, {
				success: false,
				error: 'Team name is required.'
			});
		}

		const [existingTeam] = await db
			.select({
				id: teams.id
			})
			.from(teams)
			.where(
				and(
					eq(
						teams.eventId,
						event.id
					),
					eq(
						teams.teamName,
						teamName
					)
				)
			)
			.limit(1);

		if (existingTeam) {
			return fail(409, {
				success: false,
				error:
					'That team name is already in use.'
			});
		}

		const [team] = await db
			.insert(teams)
			.values({
				eventId: event.id,
				teamName,
				leaderEmail:
					locals.user.email,
				leaderMobileNumber: ''
			})
			.returning({
				id: teams.id
			});

		await db
			.insert(teamMembers)
			.values({
				teamId: team.id,
				userEmail: locals.user.email
			});

		throw redirect(
			303,
			`/events/${event.id}`
		);
	},

	generateInvite: async ({
		locals,
		params
	}) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		if (locals.user.role !== 'participant') {
			return fail(403, {
				success: false,
				error: 'Participants only.'
			});
		}

		const event = await getLiveEvent(params.id);

		if (!(await applicationIsOpen(event))) {
			return fail(400, {
				success: false,
				error:
					'Applications are closed for this event.'
			});
		}

		const membership =
			await getCurrentMembership(
				event.id,
				locals.user.email
			);

		if (!membership) {
			return fail(404, {
				success: false,
				error:
					'You are not part of a team for this event.'
			});
		}

		if (
			membership.leaderEmail !==
			locals.user.email
		) {
			return fail(403, {
				success: false,
				error:
					'Only the team leader can create invite links.'
			});
		}

		const [{ count }] = await db
			.select({
				count: sql<number>`count(*)`
			})
			.from(teamMembers)
			.where(
				eq(
					teamMembers.teamId,
					membership.teamId
				)
			);

		if (
			Number(count) >=
			event.maxTeamSize
		) {
			return fail(400, {
				success: false,
				error:
					'Your team has already reached the maximum team size.'
			});
		}

		const rawToken = createInviteToken();
		const tokenHash = hashToken(rawToken);

		const expiresAt = new Date(
			Date.now() +
				7 * 24 * 60 * 60 * 1000
		);

		await db
			.insert(teamInvites)
			.values({
				teamId: membership.teamId,
				tokenHash,
				expiresAt
			});

		const origin =
			new URL(
				`/events/${event.id}/apply?invite=${rawToken}`,
				'http://localhost'
			).pathname +
			`?invite=${rawToken}`;

		return {
			success: true,
			inviteUrl: origin
		};
	},

	acceptInvite: async ({
		request,
		locals,
		params
	}) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		if (locals.user.role !== 'participant') {
			return fail(403, {
				success: false,
				error: 'Participants only.'
			});
		}

		const event = await getLiveEvent(params.id);

		if (!(await applicationIsOpen(event))) {
			return fail(400, {
				success: false,
				error:
					'Applications are closed for this event.'
			});
		}

		const data = await request.formData();

		const token = String(
			data.get('token') ?? ''
		).trim();

		if (!token) {
			return fail(400, {
				success: false,
				error: 'Invalid invite.'
			});
		}

		const existingMembership =
			await getCurrentMembership(
				event.id,
				locals.user.email
			);

		if (existingMembership) {
			return fail(409, {
				success: false,
				error:
					'You are already on a team for this event.'
			});
		}

		const tokenHash = hashToken(token);

		const [invite] = await db
			.select({
				id: teamInvites.id,
				teamId: teams.id,
				expiresAt: teamInvites.expiresAt
			})
			.from(teamInvites)
			.innerJoin(
				teams,
				eq(teamInvites.teamId, teams.id)
			)
			.where(
				and(
					eq(
						teamInvites.tokenHash,
						tokenHash
					),
					eq(
						teams.eventId,
						event.id
					)
				)
			)
			.limit(1);

		if (!invite) {
			return fail(404, {
				success: false,
				error: 'Invite not found.'
			});
		}

		if (
			invite.expiresAt &&
			new Date() >
				new Date(invite.expiresAt)
		) {
			return fail(400, {
				success: false,
				error: 'This invite has expired.'
			});
		}

		const [{ count }] = await db
			.select({
				count: sql<number>`count(*)`
			})
			.from(teamMembers)
			.where(
				eq(
					teamMembers.teamId,
					invite.teamId
				)
			);

		if (
			Number(count) >=
			event.maxTeamSize
		) {
			return fail(400, {
				success: false,
				error:
					'This team is already full.'
			});
		}

		await db
			.insert(teamMembers)
			.values({
				teamId: invite.teamId,
				userEmail: locals.user.email
			});

		throw redirect(
			303,
			`/events/${event.id}`
		);
	},

	updateTeam: async ({
		request,
		locals,
		params
	}) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		if (locals.user.role !== 'participant') {
			return fail(403, {
				success: false,
				error: 'Participants only.'
			});
		}

		const event = await getLiveEvent(params.id);

		if (!(await applicationIsOpen(event))) {
			return fail(400, {
				success: false,
				error:
					'Applications are closed for this event.'
			});
		}

		const membership =
			await getCurrentMembership(
				event.id,
				locals.user.email
			);

		if (!membership) {
			return fail(404, {
				success: false,
				error: 'Team not found.'
			});
		}

		if (
			membership.leaderEmail !==
			locals.user.email
		) {
			return fail(403, {
				success: false,
				error:
					'Only the team leader can edit the team.'
			});
		}

		const data = await request.formData();

		const teamName = String(
			data.get('teamName') ?? ''
		).trim();

		if (!teamName) {
			return fail(400, {
				success: false,
				error: 'Team name is required.'
			});
		}

		const [duplicate] = await db
			.select({
				id: teams.id
			})
			.from(teams)
			.where(
				and(
					eq(
						teams.eventId,
						event.id
					),
					eq(
						teams.teamName,
						teamName
					)
				)
			)
			.limit(1);

		if (
			duplicate &&
			duplicate.id !==
				membership.teamId
		) {
			return fail(409, {
				success: false,
				error:
					'That team name is already in use.'
			});
		}

		await db
			.update(teams)
			.set({
				teamName
			})
			.where(
				eq(
					teams.id,
					membership.teamId
				)
			);

		return {
			success: true,
			message: 'Team updated.'
		};
	},

	removeMember: async ({
		request,
		locals,
		params
	}) => {
		if (!locals.user) {
			throw redirect(303, '/login');
		}

		if (locals.user.role !== 'participant') {
			return fail(403, {
				success: false,
				error: 'Participants only.'
			});
		}

		const event = await getLiveEvent(params.id);

		if (!(await applicationIsOpen(event))) {
			return fail(400, {
				success: false,
				error:
					'Applications are closed for this event.'
			});
		}

		const membership =
			await getCurrentMembership(
				event.id,
				locals.user.email
			);

		if (!membership) {
			return fail(404, {
				success: false,
				error: 'Team not found.'
			});
		}

		if (
			membership.leaderEmail !==
			locals.user.email
		) {
			return fail(403, {
				success: false,
				error:
					'Only the team leader can remove members.'
			});
		}

		const data = await request.formData();

		const memberId = String(
			data.get('memberId') ?? ''
		).trim();

		if (!memberId) {
			return fail(400, {
				success: false,
				error: 'Member not specified.'
			});
		}

		const [member] = await db
			.select({
				id: teamMembers.id,
				email: teamMembers.userEmail
			})
			.from(teamMembers)
			.where(
				and(
					eq(
						teamMembers.id,
						memberId
					),
					eq(
						teamMembers.teamId,
						membership.teamId
					)
				)
			)
			.limit(1);

		if (!member) {
			return fail(404, {
				success: false,
				error: 'Member not found.'
			});
		}

		if (
			member.email ===
			membership.leaderEmail
		) {
			return fail(400, {
				success: false,
				error:
					'The team leader cannot be removed.'
			});
		}

		await db
			.delete(teamMembers)
			.where(
				eq(
					teamMembers.id,
					memberId
				)
			);

		return {
			success: true,
			message: 'Member removed.'
		};
	}
};