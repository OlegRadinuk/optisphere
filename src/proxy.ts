import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|aiadmin|albamed|estet|demo|booking|saas|p(?:/|$)|_next|_vercel|.*\\..*).*)"],
};
