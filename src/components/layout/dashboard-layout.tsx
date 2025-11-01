"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Header } from "../layout/header";
import { Sidebar } from "../layout/sidebar";
import { cn } from "@/lib/utils/utils";
import { useRouter } from "next/navigation";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    setSidebarOpen(isDesktop);
  }, [isDesktop]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (status === "loading") {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (status === "unauthenticated") {
    return null; // Or a redirect component
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar isOpen={sidebarOpen} isDesktop={isDesktop} toggleSidebar={toggleSidebar} />
      <div className={cn("flex flex-col min-h-screen", isDesktop && sidebarOpen ? "ml-64" : "ml-0", "transition-all duration-300 ease-in-out")}>
        <Header toggleSidebar={toggleSidebar} mainContentRef={mainContentRef} />
        <main ref={mainContentRef} className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
