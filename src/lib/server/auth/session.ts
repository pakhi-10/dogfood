import { createHash, randomBytes } from 'node:crypto';
import { eq, and, gt } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';

import type { CurrentUser } from './types';

const SESSION_COOKIE = 'session';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7;

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function toCurrentUser(user: typeof users.$inferSelect): CurrentUser {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		username: user.username,
		role: user.type
	};
}

export async function createSession(userId: string) {
	const token = randomBytes(32).toString('hex');
	const tokenHash = hashToken(token);

	const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

	await db.insert(sessions).values({
		userId,
		tokenHash,
		expiresAt
	});

	return {
		token,
		expiresAt
	};
}

export async function getUserFromSession(
	sessionToken: string | undefined
): Promise<CurrentUser | null> {
	if (!sessionToken) {
		return null;
	}

	const tokenHash = hashToken(sessionToken);

	const rows = await db
		.select({
			user: users
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(
			and(
				eq(sessions.tokenHash, tokenHash),
				gt(sessions.expiresAt, new Date())
			)
		)
		.limit(1);

	return rows.length ? toCurrentUser(rows[0].user) : null;
}

export async function deleteSession(sessionToken: string | undefined) {
	if (!sessionToken) {
		return;
	}

	await db
		.delete(sessions)
		.where(eq(sessions.tokenHash, hashToken(sessionToken)));
}

export { SESSION_COOKIE };