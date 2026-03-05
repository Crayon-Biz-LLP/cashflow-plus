import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PostHog } from 'posthog-node'; // <--- Import the Node SDK

// 1. Initialize PostHog Server-Side
const posthog = new PostHog(
    process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    {
        host: 'https://us.i.posthog.com', // Correct US Host
        flushAt: 1,
        flushInterval: 0
    }
);

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

    // 2. Use 'events' to capture the login asynchronously
    events: {
        async signIn({ user }) {
            if (user.email) {
                console.log("🚀 Server: Capturing Lead for", user.email);

                try {
                    // Identify the user in PostHog (Ad-Block Proof)
                    posthog.identify({
                        distinctId: user.email,
                        properties: {
                            email: user.email,
                            name: user.name,
                            source: "server-side-login",
                        }
                    });

                    // Capture the login event
                    posthog.capture({
                        distinctId: user.email,
                        event: 'user_logged_in_server',
                    });

                    // Force flush to ensure it sends before the function ends
                    await posthog.shutdown();

                } catch (error) {
                    console.error("❌ PostHog Server Error:", error);
                }
            }
        },
    },
});

export { handler as GET, handler as POST };