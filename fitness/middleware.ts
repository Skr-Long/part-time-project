export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard',
    '/checkin',
    '/cycle-plan',
    '/nutrition-plan',
    '/setup',
    '/api/user/:path*',
    '/api/checkin/:path*',
  ],
}
