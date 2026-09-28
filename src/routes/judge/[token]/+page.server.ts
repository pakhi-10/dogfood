import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	events,
	judgeAssignments,
	projects,
	rubricCriteria,
	scores,
	teams,
	tracks
} from '$lib/server/db/schema';

import {
	getJudgeFromToken
} from '$lib/server/judge/auth';

export const load: PageServerLoad = async ({
	params
}) => {
	const judge = await getJudgeFromToken(
		params.token
	);

	if (!judge) {
		throw error(
			401,
			'This judge invitation is invalid or has expired.'
		);
	}

	/* ------------------------------------------------------------------ */
	/* ASSIGNED PROJECTS                                                  */
	/* ------------------------------------------------------------------ */

	const assignments = await db
		.select({
			assignmentId:
				judgeAssignments.id,

			projectId:
				projects.id,

			title:
				projects.title,

			tagline:
				projects.projectTagline,

			summary:
				projects.summary,

			thumbnail:
				projects.thumbnail,

			imageGallery:
				projects.imageGallery,

			demoVideoUrl:
				projects.demoVideoUrl,

			repoUrl:
				projects.repoUrl,

			deployedLiveLink:
				projects.deployedLiveLink,

			techTags:
				projects.techTags,

			status:
				projects.status,

			submittedAt:
				projects.submittedAt,

			trackId:
				tracks.id,

			trackName:
				tracks.name,

			eventId:
				tracks.eventId,

			teamId:
				teams.id,

			teamName:
				teams.teamName
		})
		.from(judgeAssignments)
		.innerJoin(
			projects,
			eq(
				judgeAssignments.projectId,
				projects.id
			)
		)
		.innerJoin(
			teams,
			eq(
				projects.teamId,
				teams.id
			)
		)
		.innerJoin(
			tracks,
			eq(
				projects.trackId,
				tracks.id
			)
		)
		.where(
			eq(
				judgeAssignments.judgeId,
				judge.judgeId
			)
		);

	/* ------------------------------------------------------------------ */
	/* EVENT                                                              */
	/* ------------------------------------------------------------------ */

	if (assignments.length === 0) {
	throw error(
		404,
		'No projects have been assigned to this judge.'
	);
}

	const eventId = assignments[0].eventId;

	const [event] = await db
		.select({
			id: events.id,
			name: events.name,
			judgingStartAt:
				events.judgingStartAt,
			judgingDeadline:
				events.judgingDeadline
		})
		.from(events)
		.where(eq(events.id, eventId))
		.limit(1);

	if (!event) {
		throw error(404, 'Event not found');
	}

	/* ------------------------------------------------------------------ */
	/* RUBRIC                                                             */
	/* ------------------------------------------------------------------ */

	const criteria = await db
		.select({
			id: rubricCriteria.id,
			name: rubricCriteria.name,
			weight: rubricCriteria.weight,
			maxScore: rubricCriteria.maxScore
		})
		.from(rubricCriteria)
		.where(
			eq(
				rubricCriteria.eventId,
				event.id
			)
		);

	/* ------------------------------------------------------------------ */
	/* PROJECT SCORES                                                     */
	/* ------------------------------------------------------------------ */

	const projectsWithScores = await Promise.all(
		assignments.map(async (assignment) => {
			const existingScores = await db
				.select({
					criterionId:
						scores.criterionId,
					score:
						scores.score
				})
				.from(scores)
				.where(
					eq(
						scores.judgeAssignmentId,
						assignment.assignmentId
					)
				);

			const scoreMap: Record<
				string,
				number | null
			> = {};

			for (const criterion of criteria) {
				scoreMap[criterion.id] = null;
			}

			for (const score of existingScores) {
				scoreMap[score.criterionId] =
					score.score;
			}

			const scored =
				criteria.length > 0 &&
				criteria.every(
					(criterion) =>
						scoreMap[criterion.id] !== null
				);

			return {
				assignmentId:
					assignment.assignmentId,

				projectId:
					assignment.projectId,

				title:
					assignment.title,

				tagline:
					assignment.tagline,

				summary:
					assignment.summary,

				teamName:
					assignment.teamName,

				trackName:
					assignment.trackName,

				thumbnail:
					assignment.thumbnail,

				imageGallery:
					assignment.imageGallery ?? [],

				demoVideoUrl:
					assignment.demoVideoUrl,

				repoUrl:
					assignment.repoUrl,

				deployedLiveLink:
					assignment.deployedLiveLink,

				techTags:
					assignment.techTags ?? [],

				customAnswers: [],

				criteria,

				scores: scoreMap,

				comment: null,

				scored
			};
		})
	);

	return {
		judge: {
			id: judge.judgeId,
			name: judge.name,
			email: judge.email,
			expiresAt: judge.expiresAt
		},

		event,

		projects: projectsWithScores
	};
};