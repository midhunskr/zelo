'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function EditProfileModal({ onClose }) {
    const { data: session, update } = useSession()
    const user = session?.user

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        image: user?.image || '',
        password: '',
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET)

        const toastId = toast.loading('Uploading avatar...')
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            setFormData((prev) => ({ ...prev, image: data.secure_url }))
            toast.success('Avatar uploaded!', { id: toastId })
        } catch (error) {
            toast.error('Upload failed', { id: toastId })
        }
    }


    useEffect(() => {
        console.log('Cloudinary Cloud Name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        const toastId = toast.loading('Updating profile...')

        try {
            const res = await fetch('/api/users/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const updatedUser = await res.json()

            if (!res.ok) throw new Error(updatedUser.error)

            toast.success('Profile updated!', { id: toastId })
            await update()
            onClose()
        } catch (error) {
            toast.error(error.message || 'Update failed', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md shadow-lg">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-4">
                        <Image
                            src={formData.image || '/default-avatar.png'}
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="rounded-full object-cover"
                        />
                        <label className="text-sm font-medium text-blue-500 cursor-pointer">
                            Change Avatar
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </label>
                    </div>

                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="New password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"
                    />

                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm bg-gray-300 dark:bg-gray-600 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}