import { ReactNode, useState } from "react";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      {!isMobile && <AppSidebar />}
      
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 bottom-0 z-50 w-64 animate-fade-in">
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {isMobile && <MobileHeader onMenuClick={() => setSidebarOpen(true)} />}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
