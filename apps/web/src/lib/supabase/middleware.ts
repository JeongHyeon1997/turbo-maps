import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Routes reachable while signed out. Everything else requires a session.
const PUBLIC_PREFIXES = ['/login', '/auth'];

const isPublic = (path: string) => PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

/**
 * Refresh the Supabase session cookie on every request AND guard routes:
 * signed-out users hitting a protected page are sent to /login (remembering
 * where they were via ?redirect=), and signed-in users hitting /login are sent
 * home. Refreshed auth cookies are carried onto any redirect.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // Touch the session so expired tokens refresh into the response cookies.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Carry the (possibly refreshed) auth cookies from `response` onto a redirect.
  const redirectTo = (pathname: string, set?: (url: URL) => void) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = '';
    set?.(url);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!user && !isPublic(path)) {
    // Remember the intended destination so we can return after login.
    return redirectTo('/login', (url) => {
      if (path !== '/') url.searchParams.set('redirect', path);
    });
  }

  if (user && path === '/login') {
    return redirectTo('/');
  }

  return response;
}
