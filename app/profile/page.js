import UserProfile from '@/app/components/chat/UserProfile'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function ProfilePage() {
    const session = await getServerSession(authOptions) // Fetch session server-side

    if (!session) {
        // Handle unauthenticated state, e.g., redirect to sign-in
        return (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Please sign in to view your profile.
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-lg md:max-w-none"> {/* Added max-width for better mobile centering */}
            <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Profile</h1>
            <UserProfile user={session.user} /> {/* Pass the user from session */}
        </div>
    )
}