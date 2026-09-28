import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
    events,
    projects,
    teams,
    tracks
} from '$lib/server/db/schema';

function csvEscape(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    const text = String(value);

    if (
        text.includes(',') ||
        text.includes('"') ||
        text.includes('\n') ||
        text.includes('\r')
    ) {
        return `"${text.replace(/"/g, '""')}"`;
    }

    return text;
}

export async function GET({ locals }) {
    const user = locals.user;

    if (!user) {
        return json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    if (
        user.role !== 'organizer' &&
        user.role !== 'admin'
    ) {
        return json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    const rows = await db
        .select({
            eventName: events.name,
            teamId: teams.id,
            teamName: teams.teamName,
            projectId: projects.id,
            projectTitle: projects.title,
            trackName: tracks.name,
            status: projects.status,
            submittedAt: projects.submittedAt,
            summary: projects.summary,
            repoUrl: projects.repoUrl,
            demoVideoUrl: projects.demoVideoUrl,
            deployedLiveLink: projects.deployedLiveLink
        })
        .from(projects)
        .innerJoin(
            teams,
            eq(projects.teamId, teams.id)
        )
        .innerJoin(
            events,
            eq(teams.eventId, events.id)
        )
        .innerJoin(
            tracks,
            eq(projects.trackId, tracks.id)
        );

    const header = [
        'event',
        'team_id',
        'team_name',
        'project_id',
        'project_title',
        'track',
        'status',
        'submitted_at',
        'summary',
        'repo_url',
        'demo_video_url',
        'deployed_live_link'
    ];

    const lines = [
        header.join(','),
        ...rows.map((row) =>
            [
                row.eventName,
                row.teamId,
                row.teamName,
                row.projectId,
                row.projectTitle,
                row.trackName,
                row.status,
                row.submittedAt?.toISOString() ?? '',
                row.summary,
                row.repoUrl,
                row.demoVideoUrl,
                row.deployedLiveLink
            ]
                .map(csvEscape)
                .join(',')
        )
    ];

    return new Response(
        lines.join('\r\n') + '\r\n',
        {
            status: 200,
            headers: {
                'Content-Type':
                    'text/csv; charset=utf-8',
                'Content-Disposition':
                    'attachment; filename="dogfood-export.csv"'
            }
        }
    );
}