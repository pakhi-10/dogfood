import { and, asc, eq, inArray, sql } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	judgeAssignments,
	judgeTrackEligibility,
	projects,
	tracks,
	users
} from '$lib/server/db/schema';

import type {
	AssignmentRunResult,
	AssignmentResult,
	AssignmentWarning
} from './types';

type EligibleJudge = {
	id: string;
	name: string;
	assignmentCount: number;
};

export async function assignJudgesToProjects(
	projectIds: string[],
	minJudges = 2,
	maxJudges = 5
): Promise<AssignmentRunResult> {
	if (minJudges < 1) {
		throw new Error('minJudges must be at least 1');
	}

	if (maxJudges < minJudges) {
		throw new Error(
			'maxJudges must be greater than or equal to minJudges'
		);
	}

	if (projectIds.length === 0) {
		return {
			assignments: [],
			warnings: []
		};
	}

	const projectRows = await db
		.select({
			id: projects.id,
			trackId: projects.trackId,
			eventId: tracks.eventId
		})
		.from(projects)
		.innerJoin(
			tracks,
			eq(projects.trackId, tracks.id)
		)
		.where(
			inArray(projects.id, projectIds)
		);

	const assignments: AssignmentResult[] = [];
	const warnings: AssignmentWarning[] = [];

	/*
	 * Keep track of assignments made during this run.
	 * This makes balancing work even before the database is updated.
	 */
	const assignmentCounts = new Map<string, number>();

	for (const project of projectRows) {
		const eligibleRows = await db
			.select({
				id: users.id,
				name: users.name,
				assignmentCount: sql<number>`count(${judgeAssignments.id})`
			})
			.from(judgeTrackEligibility)
			.innerJoin(
				users,
				eq(
					judgeTrackEligibility.judgeId,
					users.id
				)
			)
			.leftJoin(
				judgeAssignments,
				eq(
					judgeAssignments.judgeId,
					users.id
				)
			)
			.where(
				and(
					eq(
						judgeTrackEligibility.trackId,
						project.trackId
					),
					eq(users.type, 'judge')
				)
			)
			.groupBy(
				users.id,
				users.name
			)
			.orderBy(
				asc(sql`count(${judgeAssignments.id})`)
			);

		const eligibleJudges: EligibleJudge[] =
			eligibleRows.map((judge) => ({
				id: judge.id,
				name: judge.name,
				assignmentCount:
					Number(judge.assignmentCount) +
					(assignmentCounts.get(judge.id) ?? 0)
			}));

		if (eligibleJudges.length < minJudges) {
			warnings.push({
				projectId: project.id,
				reason:
					`Only ${eligibleJudges.length} eligible judge(s) available; ` +
					`${minJudges} required.`
			});

			continue;
		}

		eligibleJudges.sort(
			(a, b) =>
				a.assignmentCount -
				b.assignmentCount
		);

		const panelSize = Math.min(
			maxJudges,
			eligibleJudges.length
		);

		const selected = eligibleJudges.slice(
			0,
			panelSize
		);

		const judgeIds = selected.map(
			(judge) => judge.id
		);

		for (const judge of selected) {
			assignmentCounts.set(
				judge.id,
				(assignmentCounts.get(judge.id) ?? 0) + 1
			);
		}

		assignments.push({
			projectId: project.id,
			judgeIds
		});
	}

	/*
	 * Insert assignments only after the entire plan is calculated.
	 *
	 * onConflictDoNothing prevents duplicates if this function is
	 * accidentally run more than once.
	 */
	for (const assignment of assignments) {
		await db
			.insert(judgeAssignments)
			.values(
				assignment.judgeIds.map(
					(judgeId) => ({
						judgeId,
						projectId:
							assignment.projectId
					})
				)
			)
			.onConflictDoNothing();
	}

	return {
		assignments,
		warnings
	};
}