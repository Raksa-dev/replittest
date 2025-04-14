import { Link, useLocation } from "wouter";
import { useSidebar } from "@/context/SidebarContext";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const [location] = useLocation();
  const { isSidebarOpen } = useSidebar();
  
  const isActiveLink = (path: string) => {
    return location === path;
  };

  return (
    <aside 
      className={cn("bg-white border-r border-neutral-200 w-64 shrink-0 h-full overflow-y-auto fixed z-30 transition-transform cursor-pointer",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="p-4 border-b border-neutral-200">
        <h1 className="text-lg font-semibold text-neutral-800">SME Transaction Platform</h1>
        <p className="text-xs text-neutral-500">Connected to Tally ERP</p>
      </div>
      
      <nav className="p-2">
        <div className="mb-2">
          <p className="text-xs font-medium text-neutral-500 px-3 py-2">MAIN NAVIGATION</p>
          <Link href="/">
            <div className={cn("flex items-center px-3 py-2 rounded-md font-medium cursor-pointer cursor-pointer",
              isActiveLink("/") 
                ? "bg-primary-50 text-primary-600" 
                : "text-neutral-700 hover:bg-neutral-100"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </div>
          </Link>
          <div>
            <Link href="/search">
              <div className={cn("flex items-center px-3 py-2 mt-1 rounded-md font-medium cursor-pointer cursor-pointer",
                (isActiveLink("/search") || location.startsWith("/search/"))
                  ? "bg-primary-50 text-primary-600" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                Search
              </div>
            </Link>
            {(isActiveLink("/search") || location.startsWith("/search/")) && (
              <div className="ml-6 mt-2 space-y-1">
                <Link href="/search/products">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/search/products") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Products
                  </div>
                </Link>
                <Link href="/search/vendors">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/search/vendors") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Vendors
                  </div>
                </Link>
                <Link href="/search/my-listings">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/search/my-listings") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    My Listings
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <p className="text-xs font-medium text-neutral-500 px-3 py-2">TRANSACTIONS</p>
          <div>
            <Link href="/sales">
              <div className={cn("flex items-center px-3 py-2 rounded-md font-medium cursor-pointer",
                isActiveLink("/sales") || location.startsWith("/sales/")
                  ? "bg-primary-50 text-primary-600" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Sales
              </div>
            </Link>
            {(isActiveLink("/sales") || location.startsWith("/sales/")) && (
              <div className="ml-6 mt-2 space-y-1">
                <Link href="/sales/quotation-requests">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/quotation-requests") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Quotations
                  </div>
                </Link>
                <Link href="/sales/estimates">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/estimates") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Estimates
                  </div>
                </Link>
                <Link href="/sales/orders">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/orders") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Orders
                  </div>
                </Link>
                <Link href="/sales/delivery-notes">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/delivery-notes") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Delivery Notes
                  </div>
                </Link>
                <Link href="/sales/invoices">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/invoices") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Invoices
                  </div>
                </Link>
                <Link href="/sales/returns">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/returns") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Returns & Debit Notes
                  </div>
                </Link>
                <Link href="/sales/receipts">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/sales/receipts") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Receipts
                  </div>
                </Link>
              </div>
            )}
          </div>
          
          <div>
            <Link href="/purchases">
              <div className={cn("flex items-center px-3 py-2 mt-1 rounded-md font-medium cursor-pointer",
                isActiveLink("/purchases") || location.startsWith("/purchases/") 
                  ? "bg-primary-50 text-primary-600" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Purchase
              </div>
            </Link>
            {(isActiveLink("/purchases") || location.startsWith("/purchases/")) && (
              <div className="ml-6 mt-2 space-y-1">
                <Link href="/purchases/quotation-requests">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/purchases/quotation-requests") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Quotations
                  </div>
                </Link>
                <Link href="/purchases/orders">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/purchases/orders") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Orders
                  </div>
                </Link>
                <Link href="/purchases/bills">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/purchases/bills") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Bills
                  </div>
                </Link>
                <Link href="/purchases/payments">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/purchases/payments") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Payments
                  </div>
                </Link>
                <Link href="/purchases/returns">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer cursor-pointer",
                    location.startsWith("/purchases/returns") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Returns & Credit Notes
                  </div>
                </Link>
              </div>
            )}
          </div>
          
          <div>
            <Link href="/finance">
              <div className={cn("flex items-center px-3 py-2 mt-1 rounded-md font-medium cursor-pointer",
                isActiveLink("/finance") || location.startsWith("/finance/")
                  ? "bg-primary-50 text-primary-600" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h6a2 2 0 012 2v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1zm6-5a1 1 0 100 2h1a1 1 0 100-2h-1z" clipRule="evenodd" />
                  <path d="M11 9.5a.5.5 0 11-1 0 .5.5 0 011 0z" />
                </svg>
                Finance
              </div>
            </Link>
            {(isActiveLink("/finance") || location.startsWith("/finance/")) && (
              <div className="ml-6 mt-2 space-y-1">
                <Link href="/finance/receivables/customers">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/finance/receivables") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Receivables
                  </div>
                </Link>
                <Link href="/finance/payables/vendors">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/finance/payables") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Payables
                  </div>
                </Link>
                <Link href="/finance/bnpl">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/finance/bnpl") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    BNPL / Invoice Discounting
                  </div>
                </Link>
              </div>
            )}
          </div>

          <div>
            <Link href="/inventory">
              <div className={cn("flex items-center px-3 py-2 mt-1 rounded-md font-medium cursor-pointer",
                isActiveLink("/inventory") || location.startsWith("/inventory/")
                  ? "bg-primary-50 text-primary-600" 
                  : "text-neutral-700 hover:bg-neutral-100"
              )}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                  <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Inventory
              </div>
            </Link>
            {(isActiveLink("/inventory") || location.startsWith("/inventory/")) && (
              <div className="ml-6 mt-2 space-y-1">
                <Link href="/inventory/stock-items">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/inventory/stock-items") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Stock Items
                  </div>
                </Link>
                <Link href="/inventory/stock-groups">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/inventory/stock-groups") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Stock Groups
                  </div>
                </Link>
                <Link href="/inventory/godowns">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/inventory/godowns") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Godowns
                  </div>
                </Link>
                <Link href="/inventory/units">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/inventory/units") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Units
                  </div>
                </Link>
                <Link href="/inventory/price-list">
                  <div className={cn("flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    location.startsWith("/inventory/price-list") 
                      ? "bg-primary-50 text-primary-600 font-medium" 
                      : "text-neutral-600 hover:bg-neutral-100"
                  )}>
                    Price List
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          <p className="text-xs font-medium text-neutral-500 px-3 py-2">CONFIGURATION</p>
          <Link href="/master-data">
            <div className={cn("flex items-center px-3 py-2 rounded-md font-medium cursor-pointer",
              isActiveLink("/master-data") 
                ? "bg-primary-50 text-primary-600" 
                : "text-neutral-700 hover:bg-neutral-100"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              Master Data
            </div>
          </Link>
          <Link href="/settings">
            <div className={cn("flex items-center px-3 py-2 mt-1 rounded-md font-medium cursor-pointer",
              isActiveLink("/settings") 
                ? "bg-primary-50 text-primary-600" 
                : "text-neutral-700 hover:bg-neutral-100"
            )}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Settings
            </div>
          </Link>
        </div>
      </nav>
      
      <div className="p-4 mt-auto border-t border-neutral-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center font-medium">
            TS
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral-800">Trivedi & Sons</p>
            <p className="text-xs text-neutral-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
