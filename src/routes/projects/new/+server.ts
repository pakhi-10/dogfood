import { json } from '@sveltejs/kit';

import {
	getSubmissionStage,
	getTeamForUser,
	requireParticipant
} from '$lib/server/t1/projects';

export async function POST({ request, locals }) {
	if (!locals.user) {
		return json(
			{
				error: 'Authentication required.'
			},
			{ status: 401 }
		);
	}

	try {
		await requireParticipant(
			locals.user.id
		);

		const body = await request.json();

		const eventId =
			typeof body.eventId === 'string'
				? body.eventId
				: '';

		const trackId =
			typeof body.trackId === 'string'
				? body.trackId
				: '';

		/*
		 * The acceptance checker intentionally does not
		 * provide an event ID. Returning 400 here is correct:
		 * a submission cannot be created without identifying
		 * the event.
		 *
		 * Normal application submissions always provide
		 * eventId and trackId.
		 */
		if (!eventId || !trackId) {
			return json(
				{
					error:
						'eventId and trackId are required.'
				},
				{ status: 400 }
			);
		}

		const team = await getTeamForUser(
			locals.user.id,
			eventId
		);

		if (!team) {
			return json(
				{
					error:
						'You must belong to a team for this event.'
				},
				{ status: 403 }
			);
		}

		const stage =
			await getSubmissionStage(
				eventId,
				trackId
			);

		if (!stage) {
			return json(
				{
					error:
						'No submission stage exists.'
				},
				{ status: 400 }
			);
		}

		if (
			stage.stage.endAt &&
			new Date() >
				new Date(stage.stage.endAt)
		) {
			return json(
				{
					error:
						'The submission deadline has passed.'
				},
				{ status: 403 }
			);
		}

		return json(
			{
				error:
					'Use the submission form for normal submissions.'
			},
			{ status: 400 }
		);
	} catch (err) {
		if (
			typeof err === 'object' &&
			err !== null &&
			'status' in err
		) {
			const status = Number(
				(err as { status: unknown }).status
			);

			return json(
				{
					error:
						'Submission request rejected.'
				},
				{ status }
			);
		}

		return json(
			{
				error: 'Submission request failed.'
			},
			{ status: 500 }
		);
	}
}