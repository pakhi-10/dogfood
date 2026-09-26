import { fail, redirect } from '@sveltejs/kit';

import { db } from '$lib/server/db';
import {
	events,
	submissionForms,
	tracks,
	stages
} from '$lib/server/db/schema';

function parseDate(value: FormDataEntryValue | null) {
	const text = String(value ?? '').trim();

	if (!text) {
		return null;
	}

	const date = new Date(text);

	return Number.isNaN(date.getTime()) ? null : date;
}

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	if (
		locals.user.role !== 'organizer' &&
		locals.user.role !== 'admin'
	) {
		throw redirect(303, '/');
	}

	return {};
};

export const actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				error: 'Authentication required.'
			});
		}

		if (
			locals.user.role !== 'organizer' &&
			locals.user.role !== 'admin'
		) {
			return fail(403, {
				error: 'Organizer access required.'
			});
		}

		const form = await request.formData();

		const name = String(form.get('name') ?? '').trim();
		const tagline = String(
			form.get('tagline') ?? ''
		).trim();

		const about = String(
			form.get('about') ?? ''
		).trim();

		const minTeamSize = Number(
			form.get('minTeamSize') ?? 1
		);

		const maxTeamSize = Number(
			form.get('maxTeamSize') ?? 4
		);

		const prizes = String(
			form.get('prizes') ?? ''
		).trim();

		const applicationOpenAt = parseDate(
			form.get('applicationOpenAt')
		);

		const applicationCloseAt = parseDate(
			form.get('applicationCloseAt')
		);

		const submissionDeadline = parseDate(
			form.get('submissionDeadline')
		);

		const trackNames = String(
			form.get('tracks') ?? ''
		)
			.split('\n')
			.map((value) => value.trim())
			.filter(Boolean);

		if (!name) {
			return fail(400, {
				error: 'Event name is required.'
			});
		}

		if (
			!Number.isInteger(minTeamSize) ||
			!Number.isInteger(maxTeamSize) ||
			minTeamSize < 1 ||
			maxTeamSize < minTeamSize
		) {
			return fail(400, {
				error: 'Invalid team size range.'
			});
		}

		if (!trackNames.length) {
			return fail(400, {
				error: 'At least one track is required.'
			});
		}

		if (
			applicationOpenAt &&
			applicationCloseAt &&
			applicationCloseAt <= applicationOpenAt
		) {
			return fail(400, {
				error: 'Application close must be after application open.'
			});
		}

		if (!submissionDeadline) {
			return fail(400, {
				error: 'Submission deadline is required.'
			});
		}

		const result = await db.transaction(
			async (tx) => {
				const insertedEvent = await tx
					.insert(events)
					.values({
						name,
						tagline: tagline || null,
						about: about || null,
						minTeamSize,
						maxTeamSize,
						prizes: prizes || null,
						applicationOpenAt,
						applicationCloseAt,
						organizerId: locals.user!.id
					})
					.returning({
						id: events.id
					});

				const eventId = insertedEvent[0].id;

				const formRows = await tx
					.insert(submissionForms)
					.values({
						name: `${name} submission form`
					})
					.returning({
						id: submissionForms.id
					});

				for (const trackName of trackNames) {
					const trackRows = await tx
						.insert(tracks)
						.values({
							eventId,
							name: trackName
						})
						.returning({
							id: tracks.id
						});

					await tx.insert(stages).values({
						trackId: trackRows[0].id,
						formId: formRows[0].id,
						name: 'Submission',
						startAt: applicationOpenAt,
						endAt: submissionDeadline
					});
				}

				return eventId;
			}
		);

		throw redirect(
			303,
			`/events/${result}`
		);
	}
};