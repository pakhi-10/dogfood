import { json } from '@sveltejs/kit';

export async function POST({
    locals
}) {
    if (!locals.user) {
        return json(
            {
                error: 'Authentication required.'
            },
            { status: 401 }
        );
    }

    if (locals.user.role !== 'participant') {
        return json(
            {
                error:
                    'Only participants can submit projects.'
            },
            { status: 403 }
        );
    }

    return json(
        {
            error:
                'Use the project submission form.'
        },
        { status: 400 }
    );
}