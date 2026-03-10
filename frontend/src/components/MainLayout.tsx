"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const publicRoutes = ['/login', '/register', '/forgot-password'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Landing page usually doesn't need the dashboard sidebar
    const isSidebarVisible = !!user && !isPublicRoute && pathname !== '/';

    if (!isSidebarVisible) {
        return (
            <main className="w-full min-h-screen bg-background text-foreground transition-colors duration-300">
                {children}
            </main>
        );
    }

    return (
        <div className="flex min-h-screen relative overflow-x-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className={cn(
                "flex-1 min-h-screen bg-background text-foreground transition-all duration-300 ease-in-out",
                "ml-0 xl:ml-72 w-full"
            )}>
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
