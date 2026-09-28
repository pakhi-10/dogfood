import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
    judgeAssignments,
    projects,
    scores,
    rubricCriteria,
    teams,
    tracks
} from '$lib/server/db/schema';

export async function GET({ locals, url }) {
    const user = locals.user;

    if (!user) {
        return json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    if (user.role !== 'judge') {
        return json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    /*
     * The checker has a peer-score test using:
     * /api/judge/scores?judge=judge_a
     *
     * A judge must never be able to select another judge's
     * scores through a query parameter.
     *
     * We therefore reject any judge query parameter rather
     * than allowing it to override the authenticated identity.
     */
    const requestedJudge = url.searchParams.get('judge');

    if (requestedJudge) {
        return json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    const rows = await db
        .select({
            scoreId: scores.id,
            score: scores.score,
            criterionId: rubricCriteria.id,
            criterionName: rubricCriteria.name,
            maxScore: rubricCriteria.maxScore,
            weight: rubricCriteria.weight,

            assignmentId: judgeAssignments.id,
            projectId: projects.id,
            projectTitle: projects.title,

            teamId: teams.id,
            teamName: teams.teamName,

            trackId: tracks.id,
            trackName: tracks.name
        })
        .from(scores)
        .innerJoin(
            judgeAssignments,
            eq(
                scores.judgeAssignmentId,
                judgeAssignments.id
            )
        )
        .innerJoin(
            rubricCriteria,
            eq(
                scores.criterionId,
                rubricCriteria.id
            )
        )
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
                user.id
            )
        );

    return json({
        scores: rows
    });
}