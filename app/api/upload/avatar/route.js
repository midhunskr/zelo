export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import cloudinary from '@/lib/cloudinary';
import prisma from '@/lib/prisma';

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('avatar');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadRes = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'zelo_avatars' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        });

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { image: uploadRes.secure_url },
        });

        return NextResponse.json({ image: updatedUser.image });
    } catch (err) {
        console.error('Avatar upload error:', err);
        return NextResponse.json({ error: 'Failed to upload avatar' }, { status: 500 });
    }
}