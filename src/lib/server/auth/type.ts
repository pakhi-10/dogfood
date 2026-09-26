export type Role =
	| 'visitor'
	| 'participant'
	| 'judge'
	| 'organizer'
	| 'admin';

export type User = {
	id: string;
	name: string;
	email: string;
	role: Exclude<Role, 'visitor'>;
};

export type CurrentUser = User | null;