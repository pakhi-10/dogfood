import { redirect } from '@sveltejs/kit';
import { deleteSession, SESSION_COOKIE } from '$lib/server/auth/session';

export const actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get(SESSION_COOKIE);

		await deleteSession(sessionToken);

		cookies.delete(SESSION_COOKIE, {
			path: '/'
		});

		throw redirect(303, '/');
	}
};