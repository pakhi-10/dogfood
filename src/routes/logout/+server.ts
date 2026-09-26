import { redirect } from '@sveltejs/kit';

import {
	deleteSession,
	SESSION_COOKIE
} from '$lib/server/auth/session';

export async function POST({ cookies }) {
	const token = cookies.get(SESSION_COOKIE);

	await deleteSession(token);

	cookies.delete(SESSION_COOKIE, {
		path: '/'
	});

	throw redirect(303, '/');
}