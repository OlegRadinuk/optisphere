import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const locales = routing.locales as unknown as string[];
const defaultLocale: string = routing.defaultLocale;

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && locales.includes(cookie)) return cookie;

  const acceptLang = request.headers.get("accept-language") || "";
  for (const locale of locales) {
    if (locale !== defaultLocale && acceptLang.toLowerCase().startsWith(locale)) {
      return locale;
    }
  }
  return defaultLocale;
}

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip paths that already carry a locale prefix to prevent double-handling.
  // Without this check, the middleware rewriting / to /ru would cause a second
  // run on /ru which would then redirect back to / — infinite loop.
  const hasLocale = locales.some(
    (l) => pathname === "/" + l || pathname.startsWith("/" + l + "/")
  );
  if (hasLocale) return NextResponse.next();

  const locale = detectLocale(request);
  const localePath = pathname === "/" ? "/" + locale : "/" + locale + pathname;

  // Force HTTP for the internal rewrite URL.
  // request.url is normalized with X-Forwarded-Proto (https when behind nginx),
  // but the local Next.js server is plain HTTP — using https: causes EPROTO.
  const httpBase = request.url.startsWith("https")
    ? "http" + request.url.slice(5)
    : request.url;
  const rewriteTarget = new URL(localePath + search, httpBase);
  const response = NextResponse.rewrite(rewriteTarget);

  const currentCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (currentCookie !== locale) {
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|aiadmin|albamed|estet|demo|booking|saas|p(?:/|$)|_next|_vercel|.*\\..*).*)"],
};
