import type { Role } from '$lib/server/auth/types';

export type Permission =
	| 'view_public_events'
	| 'view_public_gallery'
	| 'register_for_event'
	| 'view_my_activity'
	| 'manage_own_event'
	| 'create_event'
	| 'view_judging'
	| 'manage_users'
	| 'manage_public_gallery';

const permissions: Record<Role, Permission[]> = {
	visitor: [
		'view_public_events',
		'view_public_gallery'
	],

	participant: [
		'view_public_events',
		'view_public_gallery',
		'register_for_event',
		'view_my_activity'
	],

	judge: [
		'view_public_events',
		'view_public_gallery',
		'view_judging'
	],

	organizer: [
		'view_public_events',
		'view_public_gallery',
		'register_for_event',
		'view_my_activity',
		'manage_own_event',
		'create_event'
	],

	admin: [
		'view_public_events',
		'view_public_gallery',
		'register_for_event',
		'view_my_activity',
		'manage_own_event',
		'create_event',
		'view_judging',
		'manage_users',
		'manage_public_gallery'
	]
};

export function hasPermission(
	role: Role | null | undefined,
	permission: Permission
): boolean {
	if (!role) {
		return permission === 'view_public_events' ||
			permission === 'view_public_gallery';
	}

	return permissions[role].includes(permission);
}

export function getPermissions(role: Role | null | undefined) {
	return {
		viewPublicEvents: hasPermission(role, 'view_public_events'),
		viewPublicGallery: hasPermission(role, 'view_public_gallery'),
		registerForEvent: hasPermission(role, 'register_for_event'),
		viewMyActivity: hasPermission(role, 'view_my_activity'),
		manageOwnEvent: hasPermission(role, 'manage_own_event'),
		createEvent: hasPermission(role, 'create_event'),
		viewJudging: hasPermission(role, 'view_judging'),
		manageUsers: hasPermission(role, 'manage_users'),
		managePublicGallery: hasPermission(
			role,
			'manage_public_gallery'
		)
	};
}