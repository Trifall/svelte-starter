import z from 'zod';

/**
 * Shared role and permission constants that can be safely used on both client and server
 * Server-only Better Auth role definitions are in lib/server/roles.ts
 */

export const PERMISSIONS = {
	user: {
		create: 'create',
		list: 'list',
		'set-role': 'set-role',
		ban: 'ban',
		impersonate: 'impersonate',
		delete: 'delete',
		'set-password': 'set-password',
		'get:own': 'get:own',
		update: 'update',
		'get:any': 'get:any', // Admin can get any user's statistics
	},
	session: {
		list: 'list',
		revoke: 'revoke',
		delete: 'delete',
	},
} as const satisfies Readonly<{
	user: Readonly<Record<string, string>>;
	session: Readonly<Record<string, string>>;
}>;

export type UserPermission = keyof typeof PERMISSIONS.user;
export type Permission = UserPermission;

// Role names as constants
export const RoleNames = {
	user: 'user',
	admin: 'admin',
	unauthenticated: 'unauthenticated',
} as const;

export const AuthedRoleNames = {
	user: RoleNames.user,
	admin: RoleNames.admin,
} as const;

export const authedRoleNamesTuple = Object.keys(AuthedRoleNames) as [
	keyof typeof AuthedRoleNames,
	...Array<keyof typeof AuthedRoleNames>,
];

export const authedRoleSchema = z.enum(authedRoleNamesTuple);

export type AuthedRoleName = z.infer<typeof authedRoleSchema>;
export type RoleName = (typeof RoleNames)[keyof typeof RoleNames];
