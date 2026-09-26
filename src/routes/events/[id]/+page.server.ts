import { fail, error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	events,
	teams,
	teamMembers
} from '$lib/server/db/schema';

export const load = async ({ params, locals }) => {
	const result = await db
		.select()
		.from(events)
		.where(eq(events.id, params.id))
		.limit(1);

	if (!result[0]) {
		throw error(404, 'Event not found.');
	}

	let team = null;

	if (locals.user?.email) {
		const membership = await db
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
					eq(teamMembers.userEmail, locals.user.email),
					eq(teams.eventId, params.id)
				)
			)
			.limit(1);

		team = membership[0]?.team ?? null;
	}

	return {
		event: result[0],
		team,
		user: locals.user
	};
};

export const actions = {
	createTeam: async ({ request, locals, params }) => {
		if (!locals.user) {
			return fail(401, {
				error: 'Please log in first.'
			});
		}

		if (
			locals.user.role !== 'participant' &&
			locals.user.role !== 'organizer' &&
			locals.user.role !== 'admin'
		) {
			return fail(403, {
				error: 'Only participants can form teams.'
			});
		}

		if (!locals.user.email) {
			return fail(400, {
				error: 'Your account does not have an email address.'
			});
		}

		const form = await request.formData();

		const teamName = String(
			form.get('teamName') ?? ''
		).trim();

		if (!teamName) {
			return fail(400, {
				error: 'Team name is required.'
			});
		}

		const event = await db
			.select()
			.from(events)
			.where(eq(events.id, params.id))
			.limit(1);

		if (!event[0]) {
			return fail(404, {
				error: 'Event not found.'
			});
		}

		if (
			event[0].applicationCloseAt &&
			new Date() >
				new Date(event[0].applicationCloseAt)
		) {
			return fail(400, {
				error: 'Registration for this event is closed.'
			});
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
					eq(teamMembers.userEmail, locals.user.email),
					eq(teams.eventId, params.id)
				)
			)
			.limit(1);

		if (existing.length) {
			return fail(409, {
				error: 'You are already on a team for this event.'
			});
		}

		try {
			const team = await db.transaction(
				async (tx) => {
					const created = await tx
						.insert(teams)
						.values({
							eventId: params.id,
							teamName,
							leaderEmail: locals.user!.email
						})
						.returning({
							id: teams.id
						});

					await tx.insert(teamMembers).values({
						teamId: created[0].id,
						userEmail: locals.user!.email
					});

					return created[0];
				}
			);

			return {
				success: true,
				teamId: team.id
			};
		} catch {
			return fail(409, {
				error: 'Could not create the team. The team name may already be in use.'
			});
		}
	}
};