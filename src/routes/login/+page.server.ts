import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import {
	createSession,
	SESSION_COOKIE
} from '$lib/server/auth/session';
import { verifyPassword } from '$lib/server/auth/password';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();

		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required.'
			});
		}

		const result = await db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		const user = result[0];

		if (!user) {
			return fail(401, {
				error: 'Invalid email or password.'
			});
		}

		const valid = await verifyPassword(
			password,
			user.password
		);

		if (!valid) {
			return fail(401, {
				error: 'Invalid email or password.'
			});
		}

		const session = await createSession(user.id);

		cookies.set(SESSION_COOKIE, session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: false,
			expires: session.expiresAt
		});

		throw redirect(303, '/');
	}
};