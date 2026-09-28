import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import {
	judgeInvites,
	users
} from '$lib/server/db/schema';

import {
	generateJudgeToken,
	hashJudgeToken
} from './auth';

export async function createJudgeInvite(
	judgeId: string,
	expiresInDays = 7
) {
	const judge = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			type: users.type
		})
		.from(users)
		.where(eq(users.id, judgeId))
		.limit(1);

	const user = judge[0];

	if (!user) {
		throw new Error('Judge not found');
	}

	if (user.type !== 'judge') {
		throw new Error('User is not a judge');
	}

	if (!user.email) {
		throw new Error('Judge must have an email address');
	}

	const token = generateJudgeToken();
	const tokenHash = hashJudgeToken(token);

	const expiresAt = new Date();

	expiresAt.setDate(
		expiresAt.getDate() + expiresInDays
	);

	await db.insert(judgeInvites).values({
		judgeId,
		tokenHash,
		expiresAt
	});

	return {
		token,
		judgeId: user.id,
		name: user.name,
		email: user.email,
		expiresAt
	};
}