import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PostHog } from 'posthog-node';

// 1. Initialize PostHog (Server-Side)
const posthog = new PostHog(
    process.env.NEXT_PUBLIC_POSTHOG_KEY!,
    {
        host: 'https://us.i.posthog.com', // Always send server events to the US cloud
        flushAt: 1, // Flush immediately
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

    // 2. We use 'events' for analytics (it's non-blocking)
    events: {
        async signIn({ user }) {
            // 🚀 SERVER-SIDE TRACKING (Ad-Block Proof)
            if (user.email) {
                console.log("🚀 Server: Capturing Lead for", user.email);

                try {
                    // A. Identify the user (Create the profile)
                    posthog.identify({
                        distinctId: user.email,
                        properties: {
                            email: user.email,
                            name: user.name,
                            source: "server-side-login", // Tagging it so you know
                        }
                    });

                    // B. Capture the event
                    posthog.capture({
                        distinctId: user.email,
                        event: 'user_logged_in_server',
                    });

                    // C. Flush immediately (Crucial for Vercel/Serverless)
                    await posthog.shutdown();

                } catch (error) {
                    console.error("❌ PostHog Server Error:", error);
                }
            }
        },
    },

    // (Optional) You can keep callbacks if you have other logic, 
    // but for pure logging, 'events' is better.
    callbacks: {
        async signIn({ user }) {
            // Return true to allow the login to proceed
            return true;
        },
    }
});

export { handler as GET, handler as POST };