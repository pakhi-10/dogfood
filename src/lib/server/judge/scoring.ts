import {
	and,
	eq
} from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	judgeAssignments,
	projects,
	rubricCriteria,
	scores,
	tracks
} from '$lib/server/db/schema';

import type {
	ScoreInput
} from './types';

export async function saveJudgeScores(
	judgeId: string,
	assignmentId: string,
	inputs: ScoreInput[]
) {
	if (inputs.length === 0) {
		throw new Error('No scores provided');
	}

	/*
	 * Verify that this assignment actually belongs to this judge.
	 */
	const assignmentRows = await db
		.select({
			assignmentId: judgeAssignments.id,
			projectId: judgeAssignments.projectId,
			eventId: tracks.eventId
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
			tracks,
			eq(
				projects.trackId,
				tracks.id
			)
		)
		.where(
			and(
				eq(
					judgeAssignments.id,
					assignmentId
				),
				eq(
					judgeAssignments.judgeId,
					judgeId
				)
			)
		)
		.limit(1);

	const assignment = assignmentRows[0];

	if (!assignment) {
		throw new Error(
			'Judge assignment not found'
		);
	}

	/*
	 * Load criteria for this event.
	 */
	const criteria = await db
		.select({
			id: rubricCriteria.id,
			maxScore: rubricCriteria.maxScore
		})
		.from(rubricCriteria)
		.where(
			eq(
				rubricCriteria.eventId,
				assignment.eventId
			)
		);

	const criteriaMap = new Map(
		criteria.map((criterion) => [
			criterion.id,
			criterion.maxScore
		])
	);

	/*
	 * Validate every submitted score before writing anything.
	 */
	for (const input of inputs) {
		const maxScore =
			criteriaMap.get(input.criterionId);

		if (maxScore === undefined) {
			throw new Error(
				`Invalid criterion: ${input.criterionId}`
			);
		}

		if (
			!Number.isInteger(input.score) ||
			input.score < 0 ||
			input.score > maxScore
		) {
			throw new Error(
				`Score for criterion ${input.criterionId} ` +
				`must be between 0 and ${maxScore}`
			);
		}
	}

	/*
	 * Upsert scores.
	 */
	for (const input of inputs) {
		await db
			.insert(scores)
			.values({
				judgeAssignmentId:
					assignmentId,
				criterionId:
					input.criterionId,
				score: input.score
			})
			.onConflictDoUpdate({
				target: [
					scores.judgeAssignmentId,
					scores.criterionId
				],
				set: {
					score: input.score
				}
			});
	}

	return {
		assignmentId,
		saved: inputs.length
	};
}