import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Picks the language for every page (Arabic by default, English from the browser).
export default createMiddleware(routing);

export const config = {
  // Skip API routes, Next.js internals and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
