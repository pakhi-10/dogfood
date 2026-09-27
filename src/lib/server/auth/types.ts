export type Role =
	| 'visitor'
	| 'participant'
	| 'judge'
	| 'organizer'
	| 'admin';

export interface CurrentUser {
	id: string;
	name: string;
	email: string | null;
	role: Role;
}