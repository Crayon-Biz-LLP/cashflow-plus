"use client";

import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/lib/SidebarContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { isOpen, setIsOpen } = useSidebar();

    return (
        <div className="flex min-h-screen bg-white">
            {/* Sidebar with Mobile Support */}
            <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

            <main className="flex-1 flex flex-col min-w-0 md:ml-[260px] transition-all duration-300">
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/");
        }
    }, [router]);

    return (
        <SidebarProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </SidebarProvider>
    );
}
