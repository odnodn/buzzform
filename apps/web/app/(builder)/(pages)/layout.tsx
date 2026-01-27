import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "../components/header";
import { Sidebar } from "../components/sidebar";
import { BuilderDndProvider } from "../components/provider";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <BuilderDndProvider>
        <SidebarProvider className="flex flex-col">
          <SiteHeader />
          <div className="flex flex-1">
            <Sidebar />
            <SidebarInset>{children}</SidebarInset>
          </div>
        </SidebarProvider>
      </BuilderDndProvider>
    </div>
  );
}
