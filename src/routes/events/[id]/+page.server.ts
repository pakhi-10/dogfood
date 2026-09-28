import { error, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	events,
	tracks,
	submissionForms,
	customQuestions,
	teams,
	teamMembers,
	projects,
} from '$lib/server/db/schema';

function requireLogin(locals: App.Locals) {
	const user = locals.user;

	if (!user) {
		throw redirect(303, '/login');
	}

	return user;
}

async function getEvent(eventId: string) {
	const [event] = await db
		.select()
		.from(events)
		.where(eq(events.id, eventId))
		.limit(1);

	if (!event) {
		throw error(404, 'Event not found');
	}

	return event;
}

async function getOwnedEvent(
	eventId: string,
	userId: string
) {
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
	const user = requireLogin(locals);

	const event = await getEvent(params.id);

	/* ---------------------------------------------------------------------- */
	/* PARTICIPANT VIEW                                                       */
	/* ---------------------------------------------------------------------- */

	if (user.role !== 'organizer') {
		if (!user.email) {
	throw error(400, 'User email is required');
}
		if (event.status !== 'live') {
			throw error(404, 'Event not found');
		}

		const eventTracks = await db
			.select({
				id: tracks.id,
				name: tracks.name,
				description: tracks.description
			})
			.from(tracks)
			.where(eq(tracks.eventId, event.id))
			.orderBy(asc(tracks.name));

		/*
		 * Find whether this participant is already part of a team
		 * for this event.
		 *
		 * The registered account email is the identity used here.
		 */
		const [membership] = await db
			.select({
				teamId: teamMembers.teamId,
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
					eq(
						teamMembers.userEmail,
						user.email
					),
					eq(
						teams.eventId,
						event.id
					)
				)
			)
			.limit(1);

		let hasProject = false;

		if (membership) {
			const [project] = await db
				.select({
					id: projects.id
				})
				.from(projects)
				.where(
					eq(
						projects.teamId,
						membership.teamId
					)
				)
				.limit(1);

			hasProject = !!project;
		}

		const now = new Date();

		const applicationNotOpenYet =
			!!event.applicationOpenAt &&
			now < new Date(event.applicationOpenAt);

		const applicationClosed =
			!!event.applicationCloseAt &&
			now > new Date(event.applicationCloseAt);

		const applicationOpen =
			!applicationNotOpenYet &&
			!applicationClosed;
		
		const submissionClosed =
	!!event.submissionsClose &&
	now > new Date(event.submissionsClose);

const submissionOpen =
	!submissionClosed;

		return {
			view: 'participant' as const,

			event,

			tracks: eventTracks,

			/*
			 * Application / team state
			 */
			alreadyApplied: !!membership,

			team: membership
				? {
						id: membership.teamId,
						name: membership.teamName,
						leaderEmail:
							membership.leaderEmail,
						isLeader:
							membership.leaderEmail ===
							user.email
					}
				: null,

			/*
			 * Timing state
			 */
			applicationNotOpenYet,
			applicationOpen,
			applicationClosed,
			submissionOpen,
submissionClosed,

			/*
			 * Submission state
			 */
			hasProject
			
		};
	}

	/* ---------------------------------------------------------------------- */
	/* ORGANIZER VIEW                                                         */
	/* ---------------------------------------------------------------------- */

	const ownedEvent = await getOwnedEvent(
		params.id,
		user.id
	);

	const eventTracks = await db
		.select({
			id: tracks.id,
			name: tracks.name,
			description: tracks.description
		})
		.from(tracks)
		.where(eq(tracks.eventId, ownedEvent.id))
		.orderBy(asc(tracks.name));

	const forms = await db
		.select({
			id: submissionForms.id,
			name: submissionForms.name
		})
		.from(submissionForms)
		.where(
			eq(
				submissionForms.eventId,
				ownedEvent.id
			)
		)
		.orderBy(asc(submissionForms.name));

	const questions = await db
		.select({
			id: customQuestions.id,
			formId: customQuestions.formId,
			question: customQuestions.question,
			questionType:
				customQuestions.questionType,
			required: customQuestions.required,
			options: customQuestions.options,
			formName: submissionForms.name
		})
		.from(customQuestions)
		.innerJoin(
			submissionForms,
			eq(
				customQuestions.formId,
				submissionForms.id
			)
		)
		.where(
			eq(
				submissionForms.eventId,
				ownedEvent.id
			)
		)
		.orderBy(
			asc(customQuestions.createdAt)
		);

	return {
		view: 'organizer' as const,
		event: ownedEvent,
		tracks: eventTracks,
		forms,
		questions
	};
};

export const actions = {
	/* ---------------------------------------------------------------------- */
	/* SAVE EVENT                                                             */
	/* ---------------------------------------------------------------------- */

	saveEvent: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const name = String(
			data.get('name') ?? ''
		).trim();

		const tagline = String(
			data.get('tagline') ?? ''
		).trim();

		const about = String(
			data.get('about') ?? ''
		).trim();

		const logo = String(
			data.get('logo') ?? ''
		).trim();

		const websiteLink = String(
			data.get('websiteLink') ?? ''
		).trim();

		const contactEmail = String(
			data.get('contactEmail') ?? ''
		).trim();

		const prizes = String(
			data.get('prizes') ?? ''
		).trim();

		const minTeamSize = Number(
			data.get('minTeamSize')
		);

		const maxTeamSize = Number(
			data.get('maxTeamSize')
		);

		const parseDate = (
			value: FormDataEntryValue | null
		) => {
			const stringValue = String(
				value ?? ''
			).trim();

			if (!stringValue) {
				return null;
			}

			const date = new Date(stringValue);

			return Number.isNaN(date.getTime())
				? null
				: date;
		};

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

		if (
			!Number.isInteger(minTeamSize) ||
			minTeamSize < 1
		) {
			return {
				success: false,
				error:
					'Minimum team size is invalid.'
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
				name,
				tagline,
				about,
				logo,
				websiteLink,
				contactEmail,
				prizes,
				minTeamSize,
				maxTeamSize,
				applicationOpenAt: parseDate(
					data.get('applicationOpenAt')
				),
				applicationCloseAt: parseDate(
					data.get('applicationCloseAt')
				),
				submissionsClose: parseDate(
					data.get('submissionsClose')
				),
				judgingStartAt: parseDate(
					data.get('judgingStartAt')
				),
				judgingDeadline: parseDate(
					data.get('judgingDeadline')
				),
				resultAnnouncement: parseDate(
					data.get('resultAnnouncement')
				)
			})
			.where(
				and(
					eq(events.id, event.id),
					eq(
						events.organizerId,
						user.id
					)
				)
			);

		return {
			success: true,
			message: 'Event details saved.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* SAVE TEAM FORMATION                                                    */
	/* ---------------------------------------------------------------------- */

	saveTeamFormation: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const minTeamSize = Number(
			data.get('minTeamSize')
		);

		const maxTeamSize = Number(
			data.get('maxTeamSize')
		);

		if (
			!Number.isInteger(minTeamSize) ||
			minTeamSize < 1
		) {
			return {
				success: false,
				error:
					'Minimum team size is invalid.'
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
					eq(
						events.organizerId,
						user.id
					)
				)
			);

		return {
			success: true,
			message:
				'Team configuration saved.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* ADD TRACK                                                              */
	/* ---------------------------------------------------------------------- */

	addTrack: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const name = String(
			data.get('name') ?? ''
		).trim();

		const description = String(
			data.get('description') ?? ''
		).trim();

		if (!name) {
			return {
				success: false,
				error: 'Track name is required.'
			};
		}

		await db.insert(tracks).values({
			eventId: event.id,
			name,
			description
		});

		return {
			success: true,
			message: 'Track added.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* DELETE TRACK                                                           */
	/* ---------------------------------------------------------------------- */

	deleteTrack: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const trackId = String(
			data.get('trackId') ?? ''
		);

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
					eq(
						tracks.eventId,
						event.id
					)
				)
			)
			.limit(1);

		if (!track) {
			throw error(404, 'Track not found');
		}

		await db
			.delete(tracks)
			.where(
				and(
					eq(tracks.id, track.id),
					eq(
						tracks.eventId,
						event.id
					)
				)
			);

		return {
			success: true,
			message: 'Track deleted.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* ADD SUBMISSION FORM                                                    */
	/* ---------------------------------------------------------------------- */

	addForm: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const name = String(
			data.get('formName') ?? ''
		).trim();

		if (!name) {
			return {
				success: false,
				error:
					'Submission form name is required.'
			};
		}

		await db.insert(submissionForms).values({
			eventId: event.id,
			name
		});

		return {
			success: true,
			message:
				'Submission form added.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* DELETE SUBMISSION FORM                                                 */
	/* ---------------------------------------------------------------------- */

	deleteForm: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const formId = String(
			data.get('formId') ?? ''
		);

		if (!formId) {
			return {
				success: false,
				error: 'Form ID is required.'
			};
		}

		const [form] = await db
			.select({
				id: submissionForms.id
			})
			.from(submissionForms)
			.where(
				and(
					eq(
						submissionForms.id,
						formId
					),
					eq(
						submissionForms.eventId,
						event.id
					)
				)
			)
			.limit(1);

		if (!form) {
			throw error(
				404,
				'Submission form not found'
			);
		}

		const existingQuestions =
			await db
				.select({
					id: customQuestions.id
				})
				.from(customQuestions)
				.where(
					eq(
						customQuestions.formId,
						form.id
					)
				)
				.limit(1);

		if (existingQuestions.length > 0) {
			return {
				success: false,
				error:
					'Delete the questions in this form before deleting the form.'
			};
		}

		await db
			.delete(submissionForms)
			.where(
				and(
					eq(
						submissionForms.id,
						form.id
					),
					eq(
						submissionForms.eventId,
						event.id
					)
				)
			);

		return {
			success: true,
			message:
				'Submission form deleted.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* ADD QUESTION                                                           */
	/* ---------------------------------------------------------------------- */

	addQuestion: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const formId = String(
			data.get('formId') ?? ''
		);

		const question = String(
			data.get('question') ?? ''
		).trim();

		const rawQuestionType = String(
	data.get('questionType') ?? 'text'
);

const required =
	data.get('required') === 'true';

const optionsText = String(
	data.get('options') ?? ''
).trim();

const allowedTypes = [
	'text',
	'textarea',
	'number',
	'select',
	'radio',
	'checkbox'
] as const;

		if (!formId) {
			return {
				success: false,
				error:
					'Submission form is required.'
			};
		}

		if (!question) {
			return {
				success: false,
				error: 'Question is required.'
			};
		}

		if (
	!allowedTypes.includes(
		rawQuestionType as (typeof allowedTypes)[number]
	)
) {
	return {
		success: false,
		error: 'Invalid question type.'
	};
}

const questionType =
	rawQuestionType as (typeof allowedTypes)[number];

		const [form] = await db
			.select({
				id: submissionForms.id
			})
			.from(submissionForms)
			.where(
				and(
					eq(
						submissionForms.id,
						formId
					),
					eq(
						submissionForms.eventId,
						event.id
					)
				)
			)
			.limit(1);

		if (!form) {
			throw error(
				404,
				'Submission form not found'
			);
		}

		const options = optionsText
			.split(',')
			.map((option) => option.trim())
			.filter(Boolean);

		if (
			[
				'select',
				'radio',
				'checkbox'
			].includes(questionType) &&
			options.length === 0
		) {
			return {
				success: false,
				error:
					'Options are required for this question type.'
			};
		}

		await db
			.insert(customQuestions)
			.values({
				formId: form.id,
				question,
				questionType,
				required,
				options
			});

		return {
			success: true,
			message: 'Question added.'
		};
	},

	/* ---------------------------------------------------------------------- */
	/* DELETE QUESTION                                                        */
	/* ---------------------------------------------------------------------- */

	deleteQuestion: async ({
		request,
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		const data = await request.formData();

		const questionId = String(
			data.get('questionId') ?? ''
		);

		if (!questionId) {
			return {
				success: false,
				error:
					'Question ID is required.'
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
			.where(
				and(
					eq(
						customQuestions.id,
						questionId
					),
					eq(
						submissionForms.eventId,
						event.id
					)
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

	/* ---------------------------------------------------------------------- */
	/* MAKE EVENT LIVE                                                        */
	/* ---------------------------------------------------------------------- */

	makeLive: async ({
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

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
				error:
					'About section is required.'
			};
		}

		if (
			!Number.isInteger(
				event.minTeamSize
			) ||
			event.minTeamSize < 1
		) {
			return {
				success: false,
				error:
					'Minimum team size is invalid.'
			};
		}

		if (
			!Number.isInteger(
				event.maxTeamSize
			) ||
			event.maxTeamSize <
				event.minTeamSize
		) {
			return {
				success: false,
				error:
					'Maximum team size is invalid.'
			};
		}

		const eventTracks = await db
			.select({
				id: tracks.id
			})
			.from(tracks)
			.where(
				eq(tracks.eventId, event.id)
			)
			.limit(1);

		if (eventTracks.length === 0) {
			return {
				success: false,
				error:
					'Add at least one track before making the event live.'
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
					eq(
						events.organizerId,
						user.id
					)
				)
			);

		throw redirect(
			303,
			'/events/my-events'
		);
	},

	/* ---------------------------------------------------------------------- */
	/* DELETE EVENT                                                           */
	/* ---------------------------------------------------------------------- */

	deleteEvent: async ({
		locals,
		params
	}) => {
		const user = requireLogin(locals);

		if (user.role !== 'organizer') {
			throw error(403, 'Forbidden');
		}

		const event = await getOwnedEvent(
			params.id,
			user.id
		);

		await db
			.delete(events)
			.where(
				and(
					eq(events.id, event.id),
					eq(
						events.organizerId,
						user.id
					)
				)
			);

		throw redirect(
			303,
			'/events/my-events'
		);
	}
};