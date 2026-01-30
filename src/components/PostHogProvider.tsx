'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        person_profiles: 'identified_only', // Don't track anonymous users as "people" to save money
        capture_pageview: false // We handle this manually in Next.js
    })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Track page views
        posthog.capture('$pageview');
    }, []);

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}