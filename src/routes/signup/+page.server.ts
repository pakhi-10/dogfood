import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import {
	createSession,
	SESSION_COOKIE
} from '$lib/server/auth/session';
import { hashPassword } from '$lib/server/auth/password';

export const actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();

		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();

		const username = String(
			form.get('username') ?? ''
		).trim();

		const password = String(form.get('password') ?? '');

		if (!name || !email || !password) {
			return fail(400, {
				error: 'Name, email and password are required.'
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters.'
			});
		}

		const existing = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existing.length) {
			return fail(409, {
				error: 'An account with that email already exists.'
			});
		}

		const passwordHash = await hashPassword(password);

		const inserted = await db
			.insert(users)
			.values({
				name,
				email,
				username: username || null,
				password: passwordHash,
				type: 'participant'
			})
			.returning({
				id: users.id
			});

		const session = await createSession(inserted[0].id);

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