import type { Handle } from '@sveltejs/kit';

import {
	getUserFromSession,
	SESSION_COOKIE
} from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(SESSION_COOKIE);

	event.locals.user = await getUserFromSession(sessionToken);

	console.log('CURRENT USER:', event.locals.user);

	return resolve(event);
};
