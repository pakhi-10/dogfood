import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { events, projects, teamMembers, teams, tracks } from '$lib/server/db/schema';
import { getUserFromSession, SESSION_COOKIE } from '$lib/server/auth/session';

export const load = async ({ cookies }) => {
	const sessionToken = cookies.get(SESSION_COOKIE);
	const user = await getUserFromSession(sessionToken);

	if (!user) {
		throw redirect(303, '/login');
	}

	if (user.role !== 'participant') {
		throw redirect(303, '/');
	}

	if (!user.email) {
		throw redirect(303, '/');
	}

	const teamRows = await db
		.select({
			id: teams.id,
			teamName: teams.teamName,
			eventId: events.id,
			eventName: events.name,
			leaderEmail: teams.leaderEmail,
			memberEmail: teamMembers.userEmail
		})
		.from(teamMembers)
		.innerJoin(teams, eq(teamMembers.teamId, teams.id))
		.innerJoin(events, eq(teams.eventId, events.id))
		.where(eq(teamMembers.userEmail, user.email));

	const projectRows = await db
		.select({
			id: projects.id,
			title: projects.title,
			projectTagline: projects.projectTagline,
			status: projects.status,
			submittedAt: projects.submittedAt,
			teamId: teams.id,
			teamName: teams.teamName,
			eventName: events.name,
			trackName: tracks.name
		})
		.from(projects)
		.innerJoin(teams, eq(projects.teamId, teams.id))
		.innerJoin(events, eq(teams.eventId, events.id))
		.leftJoin(tracks, eq(projects.trackId, tracks.id))
		.innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
		.where(eq(teamMembers.userEmail, user.email));

	return {
		user,
		teams: teamRows,
		projects: projectRows
	};
};
