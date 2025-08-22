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
        <div className='px-6 h-full rounded-lg bg-inner-surface-light dark:bg-inner-surface-dark shadow-card-light
        dark:shadow-card-dark md:hidden border border-card-stroke-light dark:border-card-stroke-dark'>
            <UserProfile user={session.user} />
        </div>
    )
}
