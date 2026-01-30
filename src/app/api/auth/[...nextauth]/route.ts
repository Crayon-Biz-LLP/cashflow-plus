import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        // THIS CATCHES THE LOGIN EVENT
        async signIn({ user, account, profile }) {
            console.log("🚀 NEW LEAD CAPTURED:");
            console.log("Name:", user.name);
            console.log("Email:", user.email);
            console.log("Time:", new Date().toISOString());

            // Return true to allow the login to proceed
            return true;
        },
    }
});

export { handler as GET, handler as POST };