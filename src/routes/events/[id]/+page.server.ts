import { error, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	events,
	tracks,
	stages,
	submissionForms,
	customQuestions
} from '$lib/server/db/schema';

function requireOrganizer(locals: App.Locals) {
	const user = locals.user;

	if (!user) {
		throw redirect(303, '/login');
	}

	if (user.role !== 'organizer') {
		throw error(403, 'Forbidden');
	}

	return user;
}

async function getOwnedEvent(eventId: string, userId: string) {
	const [event] = await db
		.select()
		.from(events)
		.where(
			and(
				eq(events.id, eventId),
				eq(events.organizerId, userId)
			)
		)
		.limit(1);

	if (!event) {
		throw error(404, 'Event not found');
	}

	return event;
}

export const load = async ({ locals, params }) => {
	const user = requireOrganizer(locals);

	const event = await getOwnedEvent(params.id, user.id);

	const eventTracks = await db
		.select({
			id: tracks.id,
			name: tracks.name
		})
		.from(tracks)
		.where(eq(tracks.eventId, event.id))
		.orderBy(asc(tracks.name));

	const eventStages = await db
		.select({
			id: stages.id,
			name: stages.name,
			trackId: stages.trackId,
			trackName: tracks.name,
			formId: stages.formId,
			formName: submissionForms.name
		})
		.from(stages)
		.innerJoin(tracks, eq(stages.trackId, tracks.id))
		.innerJoin(
			submissionForms,
			eq(stages.formId, submissionForms.id)
		)
		.where(eq(tracks.eventId, event.id))
		.orderBy(asc(stages.name));

	const forms = await db
		.select({
			id: submissionForms.id,
			name: submissionForms.name
		})
		.from(submissionForms)
		.innerJoin(
			stages,
			eq(stages.formId, submissionForms.id)
		)
		.innerJoin(tracks, eq(stages.trackId, tracks.id))
		.where(eq(tracks.eventId, event.id))
		.groupBy(
			submissionForms.id,
			submissionForms.name
		)
		.orderBy(asc(submissionForms.name));

	const questions = await db
		.select({
			id: customQuestions.id,
			formId: customQuestions.formId,
			question: customQuestions.question,
			questionType: customQuestions.questionType,
			required: customQuestions.required,
			options: customQuestions.options,
			formName: submissionForms.name
		})
		.from(customQuestions)
		.innerJoin(
			submissionForms,
			eq(customQuestions.formId, submissionForms.id)
		)
		.innerJoin(
			stages,
			eq(stages.formId, submissionForms.id)
		)
		.innerJoin(
			tracks,
			eq(stages.trackId, tracks.id)
		)
		.where(eq(tracks.eventId, event.id))
		.groupBy(
			customQuestions.id,
			customQuestions.formId,
			customQuestions.question,
			customQuestions.questionType,
			customQuestions.required,
			customQuestions.options,
			submissionForms.name
		)
		.orderBy(asc(customQuestions.question));

	return {
		event,
		tracks: eventTracks,
		stages: eventStages,
		forms,
		questions
	};
};

export const actions = {
	saveEvent: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();

		const name = String(data.get('name') ?? '').trim();
		const tagline = String(data.get('tagline') ?? '').trim();
		const about = String(data.get('about') ?? '').trim();
		const websiteLink = String(
			data.get('websiteLink') ?? ''
		).trim();
		const contactEmail = String(
			data.get('contactEmail') ?? ''
		).trim();
		const logo = String(data.get('logo') ?? '').trim();
		const prizes = String(data.get('prizes') ?? '').trim();

		const minTeamSize = Number(data.get('minTeamSize'));
		const maxTeamSize = Number(data.get('maxTeamSize'));

		if (!name) {
			return {
				success: false,
				error: 'Event name is required.'
			};
		}

		if (!tagline) {
			return {
				success: false,
				error: 'Tagline is required.'
			};
		}

		if (!about) {
			return {
				success: false,
				error: 'About section is required.'
			};
		}

		if (!contactEmail) {
			return {
				success: false,
				error: 'Contact email is required.'
			};
		}

		if (!Number.isInteger(minTeamSize) || minTeamSize < 1) {
			return {
				success: false,
				error: 'Minimum team size must be at least 1.'
			};
		}

		if (
			!Number.isInteger(maxTeamSize) ||
			maxTeamSize < minTeamSize
		) {
			return {
				success: false,
				error:
					'Maximum team size must be greater than or equal to minimum team size.'
			};
		}

		const applicationOpenAt = data.get('applicationOpenAt')
			? new Date(String(data.get('applicationOpenAt')))
			: null;

		const applicationCloseAt = data.get('applicationCloseAt')
			? new Date(String(data.get('applicationCloseAt')))
			: null;

		const judgingStartAt = data.get('judgingStartAt')
			? new Date(String(data.get('judgingStartAt')))
			: null;

		const judgingDeadline = data.get('judgingDeadline')
			? new Date(String(data.get('judgingDeadline')))
			: null;

		const resultAnnouncement = data.get('resultAnnouncement')
			? new Date(String(data.get('resultAnnouncement')))
			: null;

		const dates = [
			applicationOpenAt,
			applicationCloseAt,
			judgingStartAt,
			judgingDeadline,
			resultAnnouncement
		];

		if (
			dates.some(
				(date) =>
					date !== null &&
					Number.isNaN(date.getTime())
			)
		) {
			return {
				success: false,
				error: 'One or more dates are invalid.'
			};
		}

		await db
			.update(events)
			.set({
				name,
				tagline,
				about,
				websiteLink,
				contactEmail,
				logo,
				prizes,
				minTeamSize,
				maxTeamSize,
				applicationOpenAt,
				applicationCloseAt,
				judgingStartAt,
				judgingDeadline,
				resultAnnouncement
			})
			.where(
				and(
					eq(events.id, event.id),
					eq(events.organizerId, user.id)
				)
			);

		return {
			success: true,
			message: 'Event details saved.'
		};
	},

	saveTeamFormation: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();

		const minTeamSize = Number(data.get('minTeamSize'));
		const maxTeamSize = Number(data.get('maxTeamSize'));

		if (!Number.isInteger(minTeamSize) || minTeamSize < 1) {
			return {
				success: false,
				error: 'Minimum team size must be at least 1.'
			};
		}

		if (
			!Number.isInteger(maxTeamSize) ||
			maxTeamSize < minTeamSize
		) {
			return {
				success: false,
				error:
					'Maximum team size must be greater than or equal to minimum team size.'
			};
		}

		await db
			.update(events)
			.set({
				minTeamSize,
				maxTeamSize
			})
			.where(
				and(
					eq(events.id, event.id),
					eq(events.organizerId, user.id)
				)
			);

		return {
			success: true,
			message: 'Team configuration saved.'
		};
	},

	addTrack: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();

		if (!name) {
			return {
				success: false,
				error: 'Track name is required.'
			};
		}

		await db.insert(tracks).values({
			eventId: event.id,
			name
		});

		return {
			success: true,
			message: 'Track added.'
		};
	},

	deleteTrack: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();
		const trackId = String(data.get('trackId') ?? '');

		if (!trackId) {
			return {
				success: false,
				error: 'Track ID is required.'
			};
		}

		const [track] = await db
			.select({
				id: tracks.id
			})
			.from(tracks)
			.where(
				and(
					eq(tracks.id, trackId),
					eq(tracks.eventId, event.id)
				)
			)
			.limit(1);

		if (!track) {
			throw error(404, 'Track not found');
		}

		const existingStages = await db
			.select({
				id: stages.id
			})
			.from(stages)
			.where(eq(stages.trackId, track.id))
			.limit(1);

		if (existingStages.length > 0) {
			return {
				success: false,
				error:
					'This track has stages. Delete its stages before deleting the track.'
			};
		}

		await db
			.delete(tracks)
			.where(
				and(
					eq(tracks.id, track.id),
					eq(tracks.eventId, event.id)
				)
			);

		return {
			success: true,
			message: 'Track deleted.'
		};
	},

	addStage: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();

		const name = String(data.get('name') ?? '').trim();
		const trackId = String(data.get('trackId') ?? '').trim();
		const formName = String(
			data.get('formName') ?? ''
		).trim();

		if (!name) {
			return {
				success: false,
				error: 'Stage name is required.'
			};
		}

		if (!trackId) {
			return {
				success: false,
				error: 'A track must be selected.'
			};
		}

		if (!formName) {
			return {
				success: false,
				error: 'Submission form name is required.'
			};
		}

		const [track] = await db
			.select({
				id: tracks.id
			})
			.from(tracks)
			.where(
				and(
					eq(tracks.id, trackId),
					eq(tracks.eventId, event.id)
				)
			)
			.limit(1);

		if (!track) {
			throw error(404, 'Track not found');
		}

		await db.transaction(async (tx) => {
			const [form] = await tx
				.insert(submissionForms)
				.values({
					name: formName
				})
				.returning({
					id: submissionForms.id
				});

			await tx.insert(stages).values({
				name,
				trackId: track.id,
				formId: form.id
			});
		});

		return {
			success: true,
			message: 'Stage and submission form added.'
		};
	},

	deleteStage: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();
		const stageId = String(data.get('stageId') ?? '');

		if (!stageId) {
			return {
				success: false,
				error: 'Stage ID is required.'
			};
		}

		const [stage] = await db
			.select({
				id: stages.id,
				formId: stages.formId
			})
			.from(stages)
			.innerJoin(
				tracks,
				eq(stages.trackId, tracks.id)
			)
			.where(
				and(
					eq(stages.id, stageId),
					eq(tracks.eventId, event.id)
				)
			)
			.limit(1);

		if (!stage) {
			throw error(404, 'Stage not found');
		}

		const questions = await db
			.select({
				id: customQuestions.id
			})
			.from(customQuestions)
			.where(
				eq(customQuestions.formId, stage.formId)
			)
			.limit(1);

		if (questions.length > 0) {
			return {
				success: false,
				error:
					'This stage has submission questions. Delete its questions before deleting the stage.'
			};
		}

		await db.transaction(async (tx) => {
			await tx
				.delete(stages)
				.where(eq(stages.id, stage.id));

			await tx
				.delete(submissionForms)
				.where(
					eq(
						submissionForms.id,
						stage.formId
					)
				);
		});

		return {
			success: true,
			message: 'Stage deleted.'
		};
	},

	addQuestion: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();

		const formId = String(
			data.get('formId') ?? ''
		).trim();

		const question = String(
			data.get('question') ?? ''
		).trim();

		const questionType = String(
			data.get('questionType') ?? ''
		).trim();

		const optionsValue = String(
			data.get('options') ?? ''
		).trim();

		const required = data.get('required') === 'true';

		if (!formId) {
			return {
				success: false,
				error: 'A submission form must be selected.'
			};
		}

		if (!question) {
			return {
				success: false,
				error: 'Question is required.'
			};
		}

		const validQuestionTypes = [
			'text',
			'textarea',
			'number',
			'select',
			'radio',
			'checkbox'
		] as const;

		if (
			!validQuestionTypes.includes(
				questionType as (typeof validQuestionTypes)[number]
			)
		) {
			return {
				success: false,
				error: 'Invalid question type.'
			};
		}

		const [form] = await db
			.select({
				id: submissionForms.id
			})
			.from(submissionForms)
			.innerJoin(
				stages,
				eq(
					stages.formId,
					submissionForms.id
				)
			)
			.innerJoin(
				tracks,
				eq(stages.trackId, tracks.id)
			)
			.where(
				and(
					eq(
						submissionForms.id,
						formId
					),
					eq(tracks.eventId, event.id)
				)
			)
			.limit(1);

		if (!form) {
			throw error(
				404,
				'Submission form not found'
			);
		}

		const needsOptions =
			questionType === 'select' ||
			questionType === 'radio' ||
			questionType === 'checkbox';

		const options =
			needsOptions && optionsValue
				? optionsValue
						.split(',')
						.map((option) => option.trim())
						.filter(Boolean)
				: null;

		if (needsOptions && (!options || options.length === 0)) {
			return {
				success: false,
				error:
					'Select, radio, and checkbox questions require options.'
			};
		}

		await db.insert(customQuestions).values({
			formId: form.id,
			question,
			questionType:
				questionType as
					| 'text'
					| 'textarea'
					| 'number'
					| 'select'
					| 'radio'
					| 'checkbox',
			required,
			options
		});

		return {
			success: true,
			message: 'Question added.'
		};
	},

	deleteQuestion: async ({ request, locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		const data = await request.formData();
		const questionId = String(
			data.get('questionId') ?? ''
		);

		if (!questionId) {
			return {
				success: false,
				error: 'Question ID is required.'
			};
		}

		const [question] = await db
			.select({
				id: customQuestions.id
			})
			.from(customQuestions)
			.innerJoin(
				submissionForms,
				eq(
					customQuestions.formId,
					submissionForms.id
				)
			)
			.innerJoin(
				stages,
				eq(
					stages.formId,
					submissionForms.id
				)
			)
			.innerJoin(
				tracks,
				eq(stages.trackId, tracks.id)
			)
			.where(
				and(
					eq(
						customQuestions.id,
						questionId
					),
					eq(tracks.eventId, event.id)
				)
			)
			.limit(1);

		if (!question) {
			throw error(
				404,
				'Question not found'
			);
		}

		await db
			.delete(customQuestions)
			.where(
				eq(
					customQuestions.id,
					question.id
				)
			);

		return {
			success: true,
			message: 'Question deleted.'
		};
	},

	makeLive: async ({ locals, params }) => {
		const user = requireOrganizer(locals);
		const event = await getOwnedEvent(params.id, user.id);

		if (!event.name?.trim()) {
			return {
				success: false,
				error: 'Event name is required.'
			};
		}

		if (!event.tagline?.trim()) {
			return {
				success: false,
				error: 'Tagline is required.'
			};
		}

		if (!event.about?.trim()) {
			return {
				success: false,
				error: 'About section is required.'
			};
		}

		if (!event.contactEmail?.trim()) {
			return {
				success: false,
				error: 'Contact email is required.'
			};
		}

		if (
			!Number.isInteger(event.minTeamSize) ||
			event.minTeamSize < 1
		) {
			return {
				success: false,
				error: 'Minimum team size is invalid.'
			};
		}

		if (
			!Number.isInteger(event.maxTeamSize) ||
			event.maxTeamSize < event.minTeamSize
		) {
			return {
				success: false,
				error: 'Maximum team size is invalid.'
			};
		}

		const eventTracks = await db
			.select({
				id: tracks.id
			})
			.from(tracks)
			.where(eq(tracks.eventId, event.id))
			.limit(1);

		if (eventTracks.length === 0) {
			return {
				success: false,
				error:
					'Add at least one track before making the event live.'
			};
		}

		const eventStages = await db
			.select({
				id: stages.id
			})
			.from(stages)
			.innerJoin(
				tracks,
				eq(stages.trackId, tracks.id)
			)
			.where(eq(tracks.eventId, event.id))
			.limit(1);

		if (eventStages.length === 0) {
			return {
				success: false,
				error:
					'Add at least one submission stage before making the event live.'
			};
		}

		await db
			.update(events)
			.set({
				status: 'live',
				publishedAt: new Date()
			})
			.where(
				and(
					eq(events.id, event.id),
					eq(events.organizerId, user.id)
				)
			);

		throw redirect(
			303,
			'/events/my-events'
		);
	}
};