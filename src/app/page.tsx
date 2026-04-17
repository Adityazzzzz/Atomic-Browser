import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TabContent } from "@/components/browser/TabContent";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
        <Topbar />
        <TabContent />
      </div>
    </div>
  );
}
