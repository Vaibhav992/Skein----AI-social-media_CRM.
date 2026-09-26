import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import AppSidebar from "./_common/app-sidebar"
import { DashboardHeader } from "./_common/dashboard-header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider className="bg-ink">
      <AppSidebar />
      <SidebarInset className="bg-ink! border-none">
        <div className="m-1 h-full rounded-[28px] border border-border bg-background px-4 shadow-sm">
          <DashboardHeader />
          <div className="px-3 py-2">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
