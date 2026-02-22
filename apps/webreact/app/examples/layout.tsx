import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ExamplesNav } from "@/components/examples-nav";
import { ExamplesHeader } from "@/components/examples-header";

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ExamplesNav />
      <SidebarInset>
        <ExamplesHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
