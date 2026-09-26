import type { CurrentUser } from '$lib/server/auth/types';

declare global {
	namespace App {
		interface Locals {
			user: CurrentUser | null;
		}
	}
}

export {};