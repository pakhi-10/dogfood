import { fail, redirect } from '@sveltejs/kit';
import { and, asc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
    events,
    projects,
    tracks,
    teams,
    teamMembers,
    submissionForms,
    customQuestions,
    customAnswers
} from '$lib/server/db/schema';

async function requireParticipant(
    locals: App.Locals
) {
    if (!locals.user) {
        throw redirect(303, '/login');
    }

    if (locals.user.role !== 'participant') {
        throw redirect(303, '/events');
    }

    return locals.user;
}

async function getTeamForUser(
    userEmail: string,
    eventId: string
) {
    const [team] = await db
        .select({
            id: teams.id,
            teamName: teams.teamName
        })
        .from(teams)
        .innerJoin(
            teamMembers,
            eq(
                teamMembers.teamId,
                teams.id
            )
        )
        .where(
            and(
                eq(
                    teamMembers.userEmail,
                    userEmail
                ),
                eq(
                    teams.eventId,
                    eventId
                )
            )
        )
        .limit(1);

    return team;
}

export const load = async ({ locals, url }) => {
    const user = await requireParticipant(
        locals
    );

    const eventId =
        url.searchParams.get('eventId') ?? '';

    if (!eventId) {
        return {
            event: null,
            tracks: [],
            forms: [],
            questions: [],
            project: null,
            error:
                'Select an event before creating a submission.'
        };
    }

    const [event] = await db
        .select()
        .from(events)
        .where(
            and(
                eq(events.id, eventId),
                eq(events.status, 'live')
            )
        )
        .limit(1);

    if (!event) {
        return {
            event: null,
            tracks: [],
            forms: [],
            questions: [],
            project: null,
            error: 'Event not found.'
        };
    }

    const team = await getTeamForUser(
        user.email,
        event.id
    );

    if (!team) {
        throw redirect(
            303,
            `/events/${event.id}/apply`
        );
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

    const forms = await db
        .select({
            id: submissionForms.id,
            name: submissionForms.name
        })
        .from(submissionForms)
        .where(
            eq(
                submissionForms.eventId,
                event.id
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
                event.id
            )
        )
        .orderBy(
            asc(submissionForms.name),
            asc(customQuestions.createdAt)
        );

    const [existingProject] = await db
        .select()
        .from(projects)
        .where(
            eq(
                projects.teamId,
                team.id
            )
        )
        .limit(1);

    let existingAnswers: {
        questionId: string;
        answer: string | null;
    }[] = [];

    if (existingProject) {
        existingAnswers = await db
            .select({
                questionId:
                    customAnswers.questionId,
                answer: customAnswers.answer
            })
            .from(customAnswers)
            .where(
                eq(
                    customAnswers.projectId,
                    existingProject.id
                )
            );
    }

    return {
        event,
        tracks: eventTracks,
        forms,
        questions,
        project: existingProject ?? null,
        answers: existingAnswers,
        team
    };
};

export const actions = {
    saveDraft: async ({
        request,
        locals,
        url
    }) => {
        const user = await requireParticipant(
            locals
        );

        const form = await request.formData();

        const eventId = String(
            form.get('eventId') ?? ''
        ).trim();

        const trackId = String(
            form.get('trackId') ?? ''
        ).trim();

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

        if (
            !eventId ||
            !trackId ||
            !projectName ||
            !longDescription
        ) {
            return fail(400, {
                success: false,
                error:
                    'Event, track, project name and description are required.'
            });
        }

        const team = await getTeamForUser(
            user.email,
            eventId
        );

        if (!team) {
            return fail(403, {
                success: false,
                error:
                    'You must apply to the event first.'
            });
        }

        const [track] = await db
            .select({
                id: tracks.id
            })
            .from(tracks)
            .where(
                and(
                    eq(
                        tracks.id,
                        trackId
                    ),
                    eq(
                        tracks.eventId,
                        eventId
                    )
                )
            )
            .limit(1);

        if (!track) {
            return fail(400, {
                success: false,
                error:
                    'Selected track does not belong to this event.'
            });
        }

        const [existing] = await db
            .select()
            .from(projects)
            .where(
                eq(
                    projects.teamId,
                    team.id
                )
            )
            .limit(1);

        let projectId: string;

        if (existing) {
            await db
                .update(projects)
                .set({
                    trackId,
                    projectName,
                    projectTagline:
                        projectTagline || null,
                    longDescription,
                    repoUrl:
                        repoUrl || null,
                    demoVideoUrl:
                        demoVideoUrl || null
                })
                .where(
                    eq(
                        projects.id,
                        existing.id
                    )
                );

            projectId = existing.id;
        } else {
            const [created] = await db
                .insert(projects)
                .values({
                    teamId: team.id,
                    trackId,
                    projectName,
                    projectTagline:
                        projectTagline || null,
                    longDescription,
                    repoUrl:
                        repoUrl || null,
                    demoVideoUrl:
                        demoVideoUrl || null,
                    status: 'draft'
                })
                .returning({
                    id: projects.id
                });

            projectId = created.id;
        }

        await saveCustomAnswers(
            projectId,
            form
        );

        throw redirect(
            303,
            `/projects/new?eventId=${eventId}`
        );
    },

    submit: async ({
        request,
        locals
    }) => {
        const user = await requireParticipant(
            locals
        );

        const form = await request.formData();

        const eventId = String(
            form.get('eventId') ?? ''
        ).trim();

        const trackId = String(
            form.get('trackId') ?? ''
        ).trim();

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
                success: false,
                error:
                    'Event, track, project name and description are required.'
            });
        }

        const [event] = await db
            .select()
            .from(events)
            .where(
                and(
                    eq(events.id, eventId),
                    eq(
                        events.status,
                        'live'
                    )
                )
            )
            .limit(1);

        if (!event) {
            return fail(404, {
                success: false,
                error:
                    'Event not found.'
            });
        }

        if (
            event.submissionsClose &&
            new Date() >
                new Date(
                    event.submissionsClose
                )
        ) {
            return fail(403, {
                success: false,
                error:
                    'The submission deadline has passed.'
            });
        }

        const team = await getTeamForUser(
            user.email,
            eventId
        );

        if (!team) {
            return fail(403, {
                success: false,
                error:
                    'You must apply to the event first.'
            });
        }

        const [track] = await db
            .select({
                id: tracks.id
            })
            .from(tracks)
            .where(
                and(
                    eq(
                        tracks.id,
                        trackId
                    ),
                    eq(
                        tracks.eventId,
                        eventId
                    )
                )
            )
            .limit(1);

        if (!track) {
            return fail(400, {
                success: false,
                error:
                    'Selected track does not belong to this event.'
            });
        }

        const [existing] = await db
            .select()
            .from(projects)
            .where(
                eq(
                    projects.teamId,
                    team.id
                )
            )
            .limit(1);

        let projectId: string;

        if (existing) {
            if (
                existing.status ===
                'submitted'
            ) {
                return fail(409, {
                    success: false,
                    error:
                        'This project has already been submitted.'
                });
            }

            await db
                .update(projects)
                .set({
                    trackId,
                    projectName,
                    projectTagline:
                        String(
                            form.get(
                                'projectTagline'
                            ) ?? ''
                        ).trim() ||
                        null,
                    longDescription,
                    repoUrl:
                        String(
                            form.get(
                                'repoUrl'
                            ) ?? ''
                        ).trim() ||
                        null,
                    demoVideoUrl:
                        String(
                            form.get(
                                'demoVideoUrl'
                            ) ?? ''
                        ).trim() ||
                        null,
                    status: 'submitted',
                    submittedAt: new Date()
                })
                .where(
                    eq(
                        projects.id,
                        existing.id
                    )
                );

            projectId = existing.id;
        } else {
            const [created] = await db
                .insert(projects)
                .values({
                    teamId: team.id,
                    trackId,
                    projectName,
                    projectTagline:
                        String(
                            form.get(
                                'projectTagline'
                            ) ?? ''
                        ).trim() ||
                        null,
                    longDescription,
                    repoUrl:
                        String(
                            form.get(
                                'repoUrl'
                            ) ?? ''
                        ).trim() ||
                        null,
                    demoVideoUrl:
                        String(
                            form.get(
                                'demoVideoUrl'
                            ) ?? ''
                        ).trim() ||
                        null,
                    status: 'submitted',
                    submittedAt: new Date()
                })
                .returning({
                    id: projects.id
                });

            projectId = created.id;
        }

        await saveCustomAnswers(
            projectId,
            form
        );

        throw redirect(
            303,
            `/projects/${projectId}`
        );
    }
};

async function saveCustomAnswers(
    projectId: string,
    form: FormData
) {
    const [project] = await db
        .select({
            id: projects.id,
            teamId: projects.teamId
        })
        .from(projects)
        .where(
            eq(
                projects.id,
                projectId
            )
        )
        .limit(1);

    if (!project) {
        return;
    }

    const questions = await db
        .select({
            id: customQuestions.id,
            questionType:
                customQuestions.questionType
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
            events,
            eq(
                submissionForms.eventId,
                events.id
            )
        )
        .innerJoin(
            teams,
            eq(
                teams.eventId,
                events.id
            )
        )
        .where(
            eq(
                teams.id,
                project.teamId
            )
        );

    for (const question of questions) {
        const values = form.getAll(
            `question_${question.id}`
        );

        let answer: string | null = null;

        if (question.questionType === 'checkbox') {
            answer =
                values.length > 0
                    ? values
                          .map(String)
                          .join(', ')
                    : null;
        } else {
            answer =
                values.length > 0
                    ? String(values[0])
                    : null;
        }

        await db
            .insert(customAnswers)
            .values({
                projectId,
                questionId:
                    question.id,
                answer
            })
            .onConflictDoUpdate({
                target: [
                    customAnswers.projectId,
                    customAnswers.questionId
                ],
                set: {
                    answer
                }
            });
    }
}