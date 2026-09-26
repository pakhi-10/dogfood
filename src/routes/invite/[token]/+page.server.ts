import { redirect } from '@sveltejs/kit';

import { acceptTeamInvite } from '$lib/server/t1/teams';

export const load = async ({ locals, params }) => {
	if (!locals.user) {
		throw redirect(
			303,
			`/login?redirect=/invite/${params.token}`
		);
	}

	const team = await acceptTeamInvite(
		params.token,
		locals.user.id
	);

	throw redirect(
		303,
		`/events/${team.eventId}`
	);
};