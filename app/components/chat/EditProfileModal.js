'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'
import { getConsistentAvatar } from './DefaultAvatars'

export default function EditProfileModal({ onClose }) {
    const { data: session, update } = useSession()
    const user = session?.user
    const { avatarUrl, backgroundColor, sizeClass } = getConsistentAvatar(user?.id, 'xs:w-[6rem] xs:h-[6rem] w-[4rem] h-[4rem] md:w-[3rem]')

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


    // Keep form in sync when session user changes (e.g., after update())
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                image: user.image || prev.image,
            }))
        }
    }, [user?.name, user?.email, user?.image])

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
            // Optimistically reflect updated values in the form
            setFormData((prev) => ({
                ...prev,
                name: updatedUser.name ?? prev.name,
                email: updatedUser.email ?? prev.email,
                image: updatedUser.image ?? prev.image,
                password: '',
            }))
            // Ask next-auth to refresh the session with the new fields
            await update({
                name: updatedUser.name,
                email: updatedUser.email,
                image: updatedUser.image,
            })
            onClose()
        } catch (error) {
            toast.error(error.message || 'Update failed', { id: toastId })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="md:fixed h-full w-full md:inset-0 md:bg-black md:bg-opacity-70 flex items-center justify-center md:z-50">
            <div className="h-full flex flex-col md:bg-light md:dark:bg-dark-accent md:p-6 rounded-xl w-full max-w-md md:shadow-lg">
                <h2 className="hidden md:block text-lg font-semibold md:mb-4 text-text-primary-dark dark:text-text-primary-light">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="flex-1 h-full flex flex-col md:flex-row justify-center">
                    <div className="relative flex flex-col items-center">
                        <div
                            style={{
                                backgroundImage: `url(${formData.image || avatarUrl})`,
                                backgroundColor,
                                backgroundPosition: "center 120%",
                                backgroundSize: "60%",
                            }}
                            alt="Avatar"
                            className={`${sizeClass} bg-contain bg-top bg-no-repeat rounded-full xsm:hidden`}
                        />
                        <label className="absolute -bottom-2  bg-blue shadow-lg flex items-center rounded-full justify-center
                            xs:w-10 xs:h-10 w-8 h-8 cursor-pointer border-4 border-light">
                            <img src="/icons/edit.svg" alt="edit-icon" className='xs:w-5 xs:h-5 w-4 h-4' />
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                        </label>
                    </div>

                    <div className='flex flex-col items-center justify-center py-3 xsm:py-2'>
                        <h1 className='xs:text-[1.4rem] font-semibold'>{user?.name}</h1>
                        <p className='text-text-secondary-light xs:text-[1.2rem] text-[.8rem]'>{user?.email}</p>
                    </div>

                    <div className='flex flex-col gap-2 xs:gap-2'>
                        <div className='flex flex-col space-y-2 items-center'>
                            <div className='w-full flex xs:flex-col gap-2'>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder={user?.name}
                                    // value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-[.5rem] xs:py-3 rounded-full text-text-primary-dark dark:text-light
                                placeholder:text-text-secondary-light placeholder:text-[.8rem] xs:placeholder:text-[1rem]
                                bg-white dark:bg-black dark:bg-opacity-15 md:hidden
                                border border-card-stroke-light dark:border-card-stroke-dark"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    placeholder={user?.email}
                                    // value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-[.5rem] xs:py-3 rounded-full text-text-primary-dark dark:text-light
                                placeholder:text-text-secondary-light placeholder:text-[.8rem] xs:placeholder:text-[1rem]
                                bg-white dark:bg-black dark:bg-opacity-15 md:hidden
                                border border-card-stroke-light dark:border-card-stroke-dark"
                                />
                            </div>

                            <input
                                type="current-password"
                                name="current-password"
                                placeholder="******"
                                // value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-[.5rem] xs:py-3 rounded-full text-text-primary-dark dark:text-light
                                placeholder:text-text-secondary-light placeholder:text-[.8rem] xs:placeholder:text-[1rem]
                                bg-white dark:bg-black dark:bg-opacity-15 md:hidden
                                border border-card-stroke-light dark:border-card-stroke-dark"
                            />
                        </div>

                        <div className="w-full flex flex-col items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-3 rounded-full text-text-primary-dark dark:text-text-primary-light
                                text-sm bg-light-accent dark:bg-text-tertiary-light hover:bg-gray-400 hidden md:block"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-[.5rem] xs:py-3 rounded-full text-[.8rem] xs:text-[1rem] bg-blue text-light hover:bg-blue"
                            >
                                Save
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                onClick={() => signOut({ callbackUrl: '/signin' })}
                                className="w-full py-[.5rem] xs:py-3 rounded-full text-[.8rem] xs:text-[1rem] bg-text-tertiary-light bg-opacity-10 dark:bg-opacity-25 text-primary-dark hover:bg-blue"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}