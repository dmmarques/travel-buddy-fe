import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarProvider } from "@/components/ui/sidebar";
import "./globals.css";
import AppSidebar from "./components/AppSideBar";
import AppNavBar from "./components/AppNavBar";
import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "open";

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className="h-screen w-screen overflow-hidden">
        <SidebarProvider defaultOpen={defaultOpen}>
          <div className="flex h-screen w-screen">
            <AppSidebar />
            <main className="flex flex-col flex-grow overflow-hidden">
              <AppNavBar />
              <div className="flex-grow m-6 border rounded-md shadow-sm bg-white overflow-hidden">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
