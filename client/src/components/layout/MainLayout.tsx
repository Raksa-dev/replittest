import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import MobileNavigation from "./MobileNavigation";
import { useSidebar } from "@/context/SidebarContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <div className="font-sans bg-neutral-50 h-screen flex overflow-hidden">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-20"
          onClick={() => useSidebar().toggleSidebar()}
        />
      )}
      
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-10 pt-16 md:pt-0 md:ml-64">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default MainLayout;
