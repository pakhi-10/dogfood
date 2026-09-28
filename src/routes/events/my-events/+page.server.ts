import { fail, redirect } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
    events,
    projects,
    teams,
    tracks,
    submissionForms,
    customQuestions
} from '$lib/server/db/schema';

function requireOrganizer(locals: App.Locals) {
    const user = locals.user;

    if (!user) {
        throw redirect(303, '/login');
    }

    if (user.role !== 'organizer') {
        throw redirect(303, '/events');
    }

    return user;
}

export const load = async ({ locals }) => {
    const user = requireOrganizer(locals);

    const eventRows = await db
        .select({
            id: events.id,
            name: events.name,
            tagline: events.tagline,
            about: events.about,
            status: events.status,
            applicationOpenAt: events.applicationOpenAt,
            applicationCloseAt: events.applicationCloseAt,
            submissionsClose: events.submissionsClose,
            createdAt: events.createdAt
        })
        .from(events)
        .where(eq(events.organizerId, user.id))
        .orderBy(desc(events.createdAt));

    return {
        events: eventRows
    };
};

export const actions = {
    deleteEvent: async ({ request, locals }) => {
        const user = requireOrganizer(locals);

        const form = await request.formData();
        const eventId = String(form.get('eventId') ?? '').trim();

        if (!eventId) {
            return fail(400, {
                success: false,
                error: 'Event ID is required.'
            });
        }

        const [event] = await db
            .select({
                id: events.id
            })
            .from(events)
            .where(
                and(
                    eq(events.id, eventId),
                    eq(events.organizerId, user.id)
                )
            )
            .limit(1);

        if (!event) {
            return fail(404, {
                success: false,
                error: 'Event not found.'
            });
        }

        /*
         * Projects reference tracks with ON DELETE RESTRICT,
         * so remove projects before removing the event's tracks.
         *
         * custom_answers and judge_assignments reference projects
         * with ON DELETE CASCADE.
         *
         * teams, team_members and team_invites cascade from teams.
         * submission forms/questions cascade from the event/form.
         */
        await db.transaction(async (tx) => {
            const eventTeams = await tx
                .select({
                    id: teams.id
                })
                .from(teams)
                .where(eq(teams.eventId, event.id));

            for (const team of eventTeams) {
                await tx
                    .delete(projects)
                    .where(eq(projects.teamId, team.id));
            }

            /*
             * Remove tracks' dependent project records first.
             * Projects normally disappear through their teams, but
             * this also handles any project attached to the event's
             * tracks whose team relationship is unusual.
             */
            const eventTracks = await tx
                .select({
                    id: tracks.id
                })
                .from(tracks)
                .where(eq(tracks.eventId, event.id));

            for (const track of eventTracks) {
                await tx
                    .delete(projects)
                    .where(eq(projects.trackId, track.id));
            }

            await tx
                .delete(events)
                .where(
                    and(
                        eq(events.id, event.id),
                        eq(events.organizerId, user.id)
                    )
                );
        });

        throw redirect(303, '/events/my-events');
    }
};