import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/courses(.*)',
  '/course/(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/courses(.*)',
  '/api/auth/webhook(.*)',
]);

const isAdminRoute = createRouteMatcher(['/admin(.*)']);
const isStudentRoute = createRouteMatcher(['/student(.*)']);

export default clerkMiddleware((auth, request) => {
  const url = new URL(request.url);
  const signInUrl = new URL('/sign-in', url.origin);
  
  // Protect admin routes - redirect to sign-in if not authenticated
  if (isAdminRoute(request)) {
    auth().protect({
      unauthenticatedUrl: signInUrl.toString(),
      unauthorizedUrl: signInUrl.toString(),
    });
  }
  
  // Protect student routes - redirect to sign-in if not authenticated
  if (isStudentRoute(request)) {
    auth().protect({
      unauthenticatedUrl: signInUrl.toString(),
      unauthorizedUrl: signInUrl.toString(),
    });
  }
  
  // Protect all other non-public routes
  if (!isPublicRoute(request)) {
    auth().protect({
      unauthenticatedUrl: signInUrl.toString(),
      unauthorizedUrl: signInUrl.toString(),
    });
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
