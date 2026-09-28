import { createHash, randomBytes } from 'node:crypto';
import { and, eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	judgeInvites,
	users
} from '$lib/server/db/schema';

export function generateJudgeToken(): string {
	return randomBytes(32).toString('hex');
}

export function hashJudgeToken(token: string): string {
	return createHash('sha256')
		.update(token)
		.digest('hex');
}

export async function getJudgeFromToken(token: string) {
	if (!token) {
		return null;
	}

	const tokenHash = hashJudgeToken(token);

	const result = await db
		.select({
			judgeId: users.id,
			name: users.name,
			email: users.email,
			expiresAt: judgeInvites.expiresAt
		})
		.from(judgeInvites)
		.innerJoin(
			users,
			eq(judgeInvites.judgeId, users.id)
		)
		.where(
			and(
				eq(judgeInvites.tokenHash, tokenHash),
				eq(users.type, 'judge')
			)
		)
		.limit(1);

	const invite = result[0];

	if (!invite) {
		return null;
	}

	if (
		invite.expiresAt &&
		invite.expiresAt.getTime() <= Date.now()
	) {
		return null;
	}

	return {
		judgeId: invite.judgeId,
		name: invite.name,
		email: invite.email,
		expiresAt: invite.expiresAt
	};
}