import { useSidebar } from "@/context/SidebarContext";

const MobileHeader = () => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-neutral-200 z-20">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-semibold text-neutral-800">SME Platform</h1>
        <button 
          className="p-2 rounded-md text-neutral-500 hover:bg-neutral-100"
          onClick={toggleSidebar}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MobileHeader;
