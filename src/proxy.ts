import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|aiadmin|albamed|estet|_next|_vercel|.*\\..*).*)"],
};
