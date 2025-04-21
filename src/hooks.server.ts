// Create a request-specific Supabase client, using the user credentials from the request cookie. This client is used for server-only code.
// Check user authentication.
// Guard protected pages.

import { createServerClient } from '@supabase/ssr';
import { type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';

import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

const supabase: Handle = async ({ event, resolve }) => {
	/**
	 * Creates a Supabase client specific to this server request.
	 *
	 * The Supabase client gets the Auth token from the request cookies.
	 */
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			/**
			 * SvelteKit's cookies API requires `path` to be explicitly set in
			 * the cookie options. Setting `path` to `/` replicates previous/
			 * standard behavior.
			 */
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	/**
	 * Unlike `supabase.auth.getSession()`, which returns the session _without_
	 * validating the JWT, this function also calls `getUser()` to validate the
	 * JWT before returning the session.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			// JWT validation has failed
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			/**
			 * Supabase libraries use the `content-range` and `x-supabase-api-version`
			 * headers, so we need to tell SvelteKit to pass it through.
			 */
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const protectedRoutes = ['/home', '/profile', '/wardrobe', '/outfits'];
	const currentPath = event.url.pathname;

	if (!event.locals.session) {
		// Check if the current path starts with any of the protected base paths
		const isAccessingProtectedRoute = protectedRoutes.some((route) =>
			currentPath.startsWith(route)
		);

		if (isAccessingProtectedRoute) {
			// If accessing a protected route without a session, redirect to login
			redirect(303, '/auth/login');
		}
		// If not accessing a protected route (e.g., /auth/login, /, /about), allow access
	}
	if (event.locals.session && currentPath === '/auth/login') {
		// If the user is already logged in and tries to access the login page, redirect to home
		redirect(303, '/home');
	}
	return resolve(event);
};

export const handle: Handle = sequence(supabase, authGuard);
