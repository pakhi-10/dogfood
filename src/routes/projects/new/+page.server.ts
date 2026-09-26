import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	events,
	projects,
	tracks
} from '$lib/server/db/schema';

import {
	requireParticipant,
	getTeamForUser,
	getSubmissionStage
} from '$lib/server/t1/projects';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	await requireParticipant(locals.user.id);

	const eventRows = await db
		.select({
			id: events.id,
			name: events.name
		})
		.from(events);

	const trackRows = await db
		.select({
			id: tracks.id,
			eventId: tracks.eventId,
			name: tracks.name
		})
		.from(tracks);

	return {
		events: eventRows,
		tracks: trackRows
	};
};

export const actions = {
	saveDraft: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				error: 'Authentication required.'
			});
		}

		await requireParticipant(locals.user.id);

		const form = await request.formData();

		const eventId = String(
			form.get('eventId') ?? ''
		);

		const trackId = String(
			form.get('trackId') ?? ''
		);

		const projectName = String(
			form.get('projectName') ?? ''
		).trim();

		const projectTagline = String(
			form.get('projectTagline') ?? ''
		).trim();

		const longDescription = String(
			form.get('longDescription') ?? ''
		).trim();

		const repoUrl = String(
			form.get('repoUrl') ?? ''
		).trim();

		const demoVideoUrl = String(
			form.get('demoVideoUrl') ?? ''
		).trim();

		if (!eventId || !trackId || !projectName) {
			return fail(400, {
				error:
					'Event, track and project name are required.'
			});
		}

		const team = await getTeamForUser(
			locals.user.id,
			eventId
		);

		if (!team) {
			return fail(403, {
				error:
					'You must form or join a team before creating a submission.'
			});
		}

		const stageRecord =
			await getSubmissionStage(
				eventId,
				trackId
			);

		if (!stageRecord) {
			return fail(400, {
				error:
					'This track does not have a submission stage.'
			});
		}

		const existing = await db
			.select()
			.from(projects)
			.where(eq(projects.teamId, team.id))
			.limit(1);

		if (existing[0]) {
			await db
				.update(projects)
				.set({
					stageId: stageRecord.stage.id,
					projectName,
					projectTagline:
						projectTagline || null,
					longDescription,
					repoUrl: repoUrl || null,
					demoVideoUrl:
						demoVideoUrl || null
				})
				.where(eq(projects.id, existing[0].id));

			throw redirect(
				303,
				`/projects/${existing[0].id}/edit`
			);
		}

		const created = await db
			.insert(projects)
			.values({
				teamId: team.id,
				stageId: stageRecord.stage.id,
				projectName,
				projectTagline:
					projectTagline || null,
				longDescription,
				repoUrl: repoUrl || null,
				demoVideoUrl:
					demoVideoUrl || null,
				status: 'draft'
			})
			.returning({
				id: projects.id
			});

		throw redirect(
			303,
			`/projects/${created[0].id}/edit`
		);
	},

	submit: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, {
				error: 'Authentication required.'
			});
		}

		await requireParticipant(locals.user.id);

		const form = await request.formData();

		const eventId = String(
			form.get('eventId') ?? ''
		);

		const trackId = String(
			form.get('trackId') ?? ''
		);

		const projectName = String(
			form.get('projectName') ?? ''
		).trim();

		const longDescription = String(
			form.get('longDescription') ?? ''
		).trim();

		if (
			!eventId ||
			!trackId ||
			!projectName ||
			!longDescription
		) {
			return fail(400, {
				error:
					'Event, track, project name and description are required.'
			});
		}

		const team = await getTeamForUser(
			locals.user.id,
			eventId
		);

		if (!team) {
			return fail(403, {
				error:
					'You must belong to a team for this event.'
			});
		}

		const stageRecord =
			await getSubmissionStage(
				eventId,
				trackId
			);

		if (!stageRecord) {
			return fail(400, {
				error:
					'No submission stage exists for this track.'
			});
		}

		const deadline =
			stageRecord.stage.endAt;

		if (
			deadline &&
			new Date() > new Date(deadline)
		) {
			return fail(403, {
				error:
					'The submission deadline has passed.'
			});
		}

		const existing = await db
			.select()
			.from(projects)
			.where(eq(projects.teamId, team.id))
			.limit(1);

		if (existing[0]) {
			if (
				existing[0].status ===
				'submitted'
			) {
				return fail(409, {
					error:
						'This project has already been submitted.'
				});
			}

			await db
				.update(projects)
				.set({
					stageId:
						stageRecord.stage.id,
					projectName,
					projectTagline:
						String(
							form.get(
								'projectTagline'
							) ?? ''
						).trim() || null,
					longDescription,
					repoUrl:
						String(
							form.get(
								'repoUrl'
							) ?? ''
						).trim() || null,
					demoVideoUrl:
						String(
							form.get(
								'demoVideoUrl'
							) ?? ''
						).trim() || null,
					status: 'submitted',
					submittedAt: new Date()
				})
				.where(
					eq(
						projects.id,
						existing[0].id
					)
				);

			throw redirect(
				303,
				`/projects/${existing[0].id}`
			);
		}

		const created = await db
			.insert(projects)
			.values({
				teamId: team.id,
				stageId: stageRecord.stage.id,
				projectName,
				projectTagline:
					String(
						form.get(
							'projectTagline'
						) ?? ''
					).trim() || null,
				longDescription,
				repoUrl:
					String(
						form.get(
							'repoUrl'
						) ?? ''
					).trim() || null,
				demoVideoUrl:
					String(
						form.get(
							'demoVideoUrl'
						) ?? ''
					).trim() || null,
				status: 'submitted',
				submittedAt: new Date()
			})
			.returning({
				id: projects.id
			});

		throw redirect(
			303,
			`/projects/${created[0].id}`
		);
	}
};