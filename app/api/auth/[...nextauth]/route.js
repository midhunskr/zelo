import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const authOptions = {
    providers: [
        GoogleProvider.default({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        CredentialsProvider.default({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                })

                if (!user || !user.hashedPassword) {
                    throw new Error('Invalid credentials')
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                )

                if (!isPasswordValid) {
                    throw new Error('Invalid credentials')
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/signin',
        error: '/signin',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // On sign-in, seed the token from the user
            if (user) {
                console.log("JWT user:", user)
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.image = user.image || null
            }
            // On client update(), fetch the latest user from the DB to ensure token is in sync
            if (trigger === 'update' && session && token.id) {
                try {
                    // const prisma = new PrismaClient();
                    // console.log('JWT update: token.id =', token.id);
                    const dbUser = await prisma.user.findUnique({ where: { id: token.id } });
                    // console.log('JWT update: dbUser =', dbUser);
                    if (dbUser) {
                        token.name = dbUser.name;
                        token.email = dbUser.email;
                        token.image = dbUser.image || null;
                    }
                } catch (e) {
                    console.error('JWT update error:', e);
                    // fallback: merge session fields if DB fetch fails
                    if (session.name !== undefined) token.name = session.name;
                    if (session.email !== undefined) token.email = session.email;
                    if (session.image !== undefined) token.image = session.image;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id
                session.user.email = token.email
                session.user.name = token.name
                session.user.image = token.image || null
            }
            return session
        }
    },
    // callbacks: {
    //     async jwt({ token, user, trigger, session }) {
    //         try {
    //             if (user) {
    //                 token.id = user.id
    //                 token.email = user.email
    //                 token.name = user.name
    //                 token.image = user.image || null
    //             }

    //             if (trigger === "update" && session && token.id) {
    //                 const dbUser = await prisma.user.findUnique({ where: { id: token.id } })
    //                 if (dbUser) {
    //                     token.name = dbUser.name
    //                     token.email = dbUser.email
    //                     token.image = dbUser.image || null
    //                 }
    //             }
    //             return token
    //         } catch (err) {
    //             console.error("JWT callback error:", err)
    //             return token
    //         }
    //     },
    //     async session({ session, token }) {
    //         try {
    //             if (session.user && token) {
    //                 session.user.id = token.id
    //                 session.user.email = token.email
    //                 session.user.name = token.name
    //                 session.user.image = token.image || null
    //             }
    //             return session
    //         } catch (err) {
    //             console.error("Session callback error:", err)
    //             return session
    //         }
    //     }
    // },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth.default(authOptions)
export { handler as GET, handler as POST }

// import NextAuth from "next-auth"
// import GoogleProvider from "next-auth/providers/google"
// import CredentialsProvider from "next-auth/providers/credentials"
// import { PrismaClient } from "@prisma/client"
// import bcrypt from "bcryptjs"

// const prisma = new PrismaClient()

// export const authOptions = {
//     providers: [
//         GoogleProvider.default({
//             clientId: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         }),
//         CredentialsProvider.default({
//             name: "Credentials",
//             credentials: {
//                 email: { label: "Email", type: "email" },
//                 password: { label: "Password", type: "password" },
//             },
//             async authorize(credentials) {
//                 if (!credentials?.email || !credentials?.password) {
//                     throw new Error("Please enter an email and password")
//                 }

//                 const user = await prisma.user.findUnique({
//                     where: { email: credentials.email },
//                 })

//                 if (!user || !user.hashedPassword) {
//                     throw new Error("Invalid credentials")
//                 }

//                 const isPasswordValid = await bcrypt.compare(
//                     credentials.password,
//                     user.hashedPassword
//                 )

//                 if (!isPasswordValid) {
//                     throw new Error("Invalid credentials")
//                 }

//                 return {
//                     id: user.id,
//                     email: user.email,
//                     name: user.name,
//                 }
//             },
//         }),
//     ],
//     session: {
//         strategy: "jwt",
//     },
//     secret: process.env.NEXTAUTH_SECRET,
// }

// const handler = NextAuth.default(authOptions)
// export { handler as GET, handler as POST }

