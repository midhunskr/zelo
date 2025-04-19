import InvitationList from '@/app/components/chat/InvitationList'

export default function InvitationsPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Friend Invitations</h1>
            <InvitationList />
        </div>
    )
} 