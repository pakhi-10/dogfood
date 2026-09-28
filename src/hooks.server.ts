import type { Handle } from '@sveltejs/kit';

import {
        getUserFromSession,
        SESSION_COOKIE
} from '$lib/server/auth/session';

export const handle: Handle = async ({ event, resolve }) => {
        let sessionToken = event.cookies.get(SESSION_COOKIE);

        if (!sessionToken) {
                const authorization =
                        event.request.headers.get('authorization');

                if (
                        authorization &&
                        authorization.toLowerCase().startsWith('bearer ')
                ) {
                        sessionToken = authorization.slice(7).trim();
                }
        }

        event.locals.user =
                await getUserFromSession(sessionToken);

        console.log('CURRENT USER:', event.locals.user);

        return resolve(event);
};