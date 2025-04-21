import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        // If the user is not authenticated and trying to access a protected route,
        // they will be redirected to the signin page
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ req, token }) => {
                // Protect all routes except signin
                if (req.nextUrl.pathname === '/signin') {
                    return true
                }
                return !!token
            },
        },
    }
)

// Configure which routes to protect
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|signin).*)'],
} 