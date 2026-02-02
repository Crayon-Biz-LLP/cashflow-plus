'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"

if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        // 🚀 CHANGE THIS: Point to your local proxy instead of the env var
        api_host: `${window.location.origin}/ingest`,
        person_profiles: 'identified_only',
        capture_pageview: false,
        ui_host: 'https://us.posthog.com' // Keep the UI pointing to the real PostHog
    })
}

// Internal component to track route changes
function PostHogPageView() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        if (pathname) {
            let url = window.origin + pathname
            if (searchParams && searchParams.toString()) {
                url = url + `?${searchParams.toString()}`
            }
            // 🚀 TRACK PAGE VIEW ON NAVIGATION
            posthog.capture('$pageview', {
                '$current_url': url,
            })
        }
    }, [pathname, searchParams])

    return null
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
    return (
        <PostHogProvider client={posthog}>
            {/* Wrap in Suspense to prevent hydration errors */}
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </PostHogProvider>
    )
}